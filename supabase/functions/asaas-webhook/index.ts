import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-access-token',
};

const STATUS_MAP: Record<string, string> = {
  RECEIVED: 'active',
  CONFIRMED: 'active',
  OVERDUE: 'past_due',
  REFUNDED: 'canceled',
  DELETED: 'canceled',
  PENDING: 'pending',
};

type AsaasWebhookPayload = {
  event?: string;
  id?: string;
  payment?: {
    id?: string;
    customer?: string;
    subscription?: string;
    externalReference?: string | null;
    value?: number;
    status?: string;
    dueDate?: string;
    invoiceUrl?: string;
    bankSlipUrl?: string;
    description?: string;
  };
  subscription?: {
    id?: string;
    customer?: string;
    externalReference?: string;
    value?: number;
    status?: string;
    nextDueDate?: string;
  };
};

/** Id estável para deduplicação em webhook_events (limite 255). */
function safeEventId(payload: AsaasWebhookPayload): string {
  const raw =
    payload?.id ||
    payload?.payment?.id ||
    payload?.subscription?.id ||
    crypto.randomUUID();
  const s = String(raw).trim();
  return s.length > 255 ? s.slice(0, 255) : s;
}

function normalizeStatus(raw?: string): string {
  if (!raw) return 'pending';
  const u = raw.toUpperCase();
  return STATUS_MAP[u] || raw.toLowerCase();
}

/** Pagamento de agendamento (create-booking-payment grava payment_id = id da cobrança Asaas). */
async function processBookingPaymentIfAny(
  supabaseAdmin: ReturnType<typeof createClient>,
  payment: NonNullable<AsaasWebhookPayload['payment']>
): Promise<void> {
  const payId = payment.id;
  if (!payId) return;
  const st = (payment.status || '').toUpperCase();
  if (!['RECEIVED', 'CONFIRMED'].includes(st)) return;

  const { data: row } = await supabaseAdmin
    .from('payments')
    .select('payment_id, status, appointment_id, amount')
    .eq('payment_id', payId)
    .maybeSingle();

  if (!row || row.status === 'approved') return;

  const { error: upPay } = await supabaseAdmin
    .from('payments')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('payment_id', payId);
  if (upPay) throw new Error(upPay.message || String(upPay));

  const amt = row.amount != null ? Number(row.amount) : Number(payment.value ?? 0);
  const { error: upApp } = await supabaseAdmin
    .from('appointments')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      total_amount: amt,
    })
    .eq('id', row.appointment_id);
  if (upApp) throw new Error(upApp.message || String(upApp));
}

async function processSubscriptionIfAny(
  supabaseAdmin: ReturnType<typeof createClient>,
  payload: AsaasWebhookPayload
): Promise<void> {
  const subscriptionId = payload.subscription?.id || payload.payment?.subscription;
  const payment = payload.payment;
  const normalizedStatus = normalizeStatus(payment?.status || payload.subscription?.status);

  if (!subscriptionId) return;

  const { data: subscriptionRow } = await supabaseAdmin
    .from('subscriptions')
    .select('id, barbershop_id, plan_id, billing_cycle, current_period_end')
    .eq('provider', 'asaas')
    .eq('provider_subscription_id', subscriptionId)
    .maybeSingle();

  if (!subscriptionRow) return;

  const now = new Date();
  const nextPeriodEnd = new Date(now);
  nextPeriodEnd.setDate(now.getDate() + (subscriptionRow.billing_cycle === 'yearly' ? 365 : 30));

  const { error: upSub } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: normalizedStatus,
      provider: 'asaas',
      provider_customer_id: payment?.customer || payload.subscription?.customer || null,
      current_period_start: now.toISOString(),
      current_period_end: nextPeriodEnd.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', subscriptionRow.id);
  if (upSub) throw new Error(upSub.message || String(upSub));

  if (payment?.id) {
    const { error: histErr } = await supabaseAdmin.from('payment_history').insert({
      barbershop_id: subscriptionRow.barbershop_id,
      subscription_id: subscriptionRow.id,
      provider: 'asaas',
      provider_customer_id: payment.customer || null,
      provider_invoice_id: payment.id,
      provider_payment_id: payment.id,
      amount: payment.value || 0,
      currency: 'BRL',
      status: normalizedStatus === 'active' ? 'succeeded' : normalizedStatus,
      payment_method_type: 'asaas',
      payment_date: new Date().toISOString(),
      invoice_url: payment.invoiceUrl || payment.bankSlipUrl || null,
      description: payment.description || `Webhook Asaas: ${payload.event || 'unknown'}`,
      metadata: payload as unknown as Record<string, unknown>,
    });
    if (histErr) throw new Error(histErr.message || String(histErr));
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const webhookSecretRaw = Deno.env.get('ASAAS_WEBHOOK_SECRET');
  const webhookSecret = webhookSecretRaw?.trim() || '';

  let payload: AsaasWebhookPayload;
  try {
    payload = (await req.json()) as AsaasWebhookPayload;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (webhookSecret.length > 0) {
    const incoming =
      (req.headers.get('asaas-access-token') || req.headers.get('x-asaas-signature') || '').trim();
    if (incoming !== webhookSecret) {
      console.warn('asaas-webhook: token de acesso não confere (confira ASAAS_WEBHOOK_SECRET e o token no painel Asaas).');
      return new Response(JSON.stringify({ error: 'Webhook Asaas inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const eventId = safeEventId(payload);
  const eventType = payload.event || 'unknown';

  const { error: eventInsertError } = await supabaseAdmin.from('webhook_events').insert({
    provider: 'asaas',
    event_id: eventId,
    event_type: eventType,
    status: 'received',
    payload: payload as unknown as Record<string, unknown>,
  });

  if ((eventInsertError as { code?: string } | null)?.code === '23505') {
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (eventInsertError) {
    console.error('asaas-webhook: falha ao gravar webhook_events', eventInsertError);
    return new Response(JSON.stringify({ error: String(eventInsertError.message || eventInsertError) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let processingError: string | null = null;
  try {
    await processSubscriptionIfAny(supabaseAdmin, payload);
    if (payload.payment) {
      await processBookingPaymentIfAny(supabaseAdmin, payload.payment);
    }
  } catch (e) {
    processingError = e instanceof Error ? e.message : String(e);
    console.error('asaas-webhook: erro ao processar negócio', processingError);
  }

  const { error: updErr } = await supabaseAdmin
    .from('webhook_events')
    .update({
      status: processingError ? 'failed' : 'processed',
      processed_at: new Date().toISOString(),
      error_message: processingError,
    })
    .eq('provider', 'asaas')
    .eq('event_id', eventId);

  if (updErr) {
    console.error('asaas-webhook: falha ao atualizar webhook_events', updErr);
  }

  return new Response(
    JSON.stringify({
      received: true,
      processed: !processingError,
      ...(processingError ? { processingError } : {}),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
