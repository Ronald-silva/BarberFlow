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
    externalReference?: string;
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

function resolveEventId(payload: AsaasWebhookPayload): string {
  return (
    payload.id ||
    payload.payment?.id ||
    payload.subscription?.id ||
    crypto.randomUUID()
  );
}

function normalizeStatus(raw?: string): string {
  if (!raw) return 'pending';
  return STATUS_MAP[raw] || raw.toLowerCase();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('ASAAS_WEBHOOK_SECRET');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    if (webhookSecret) {
      const incomingSecret =
        req.headers.get('asaas-access-token') ||
        req.headers.get('x-asaas-signature') ||
        '';
      if (incomingSecret !== webhookSecret) {
        throw new Error('Webhook Asaas inválido');
      }
    }

    const payload = (await req.json()) as AsaasWebhookPayload;
    const eventId = resolveEventId(payload);
    const eventType = payload.event || 'unknown';

    const { error: eventInsertError } = await supabaseAdmin.from('webhook_events').insert({
      provider: 'asaas',
      event_id: eventId,
      event_type: eventType,
      status: 'received',
      payload,
    });

    if ((eventInsertError as { code?: string } | null)?.code === '23505') {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (eventInsertError) {
      throw eventInsertError;
    }

    const subscriptionId = payload.subscription?.id || payload.payment?.subscription;
    const payment = payload.payment;
    const normalizedStatus = normalizeStatus(payment?.status || payload.subscription?.status);
    let subscriptionRow:
      | {
          id: string;
          barbershop_id: string;
          plan_id: string;
          billing_cycle: 'monthly' | 'yearly';
          current_period_end: string | null;
        }
      | null = null;

    if (subscriptionId) {
      const { data } = await supabaseAdmin
        .from('subscriptions')
        .select('id, barbershop_id, plan_id, billing_cycle, current_period_end')
        .eq('provider', 'asaas')
        .eq('provider_subscription_id', subscriptionId)
        .maybeSingle();

      subscriptionRow = data;
    }

    if (subscriptionRow) {
      const now = new Date();
      const nextPeriodEnd = new Date(now);
      nextPeriodEnd.setDate(now.getDate() + (subscriptionRow.billing_cycle === 'yearly' ? 365 : 30));

      await supabaseAdmin
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

      if (payment?.id) {
        await supabaseAdmin.from('payment_history').insert({
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
          description: payment.description || `Webhook Asaas: ${eventType}`,
          metadata: payload,
        });
      }
    }

    await supabaseAdmin
      .from('webhook_events')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('provider', 'asaas')
      .eq('event_id', eventId);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Asaas webhook error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro no webhook Asaas',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
