import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Provider = 'stripe' | 'asaas';
type Method = 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'bitcoin';

function asaasBaseUrl() {
  return (Deno.env.get('ASAAS_ENV') || 'sandbox').toLowerCase() === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';
}

function assertAsaasKeyMatchesEnv(asaasApiKey: string) {
  const env = (Deno.env.get('ASAAS_ENV') || 'sandbox').toLowerCase();
  const k = asaasApiKey.trim();
  if (env !== 'production' && (/\$aact_prod|_prod_/i.test(k))) {
    throw new Error(
      'Asaas: chave de PRODUÇÃO com ASAAS_ENV=sandbox. Use chave SANDBOX e ASAAS_ENV=sandbox para não cobrar de verdade.',
    );
  }
}

function toAsaasBillingType(method: Method) {
  if (method === 'pix') return 'PIX';
  if (method === 'boleto') return 'BOLETO';
  if (method === 'debit_card') return 'DEBIT_CARD';
  return 'CREDIT_CARD';
}

/** Dígitos do telefone/WhatsApp — chave estável para externalReference do cliente (Asaas). */
function phoneDigits(phone: string | undefined): string {
  const d = (phone || '').replace(/\D/g, '');
  return d.length > 0 ? d : '0';
}

/** Referência externa do cliente na Asaas: reutiliza o mesmo cadastro por barbearia + contato (evita duplicar customer). */
function asaasBookingCustomerExternalRef(barbershopId: string, phone: string | undefined): string {
  return `bf-cust:${barbershopId}:${phoneDigits(phone)}`;
}

async function asaasFetchJson(
  asaasApiKey: string,
  method: 'GET' | 'POST',
  pathWithLeadingSlash: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const response = await fetch(`${asaasBaseUrl()}${pathWithLeadingSlash}`, {
    method,
    headers: {
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
      access_token: asaasApiKey,
    },
    ...(method === 'POST' && body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json();
  if (!response.ok) {
    const msg =
      (payload as { errors?: { description?: string }[] })?.errors?.[0]?.description ||
      (payload as { message?: string })?.message ||
      'Erro API Asaas';
    throw new Error(msg);
  }
  return payload;
}

type AsaasCustomerRow = { id?: string; deleted?: boolean };

/** Lista cliente existente por externalReference (API Asaas: GET /customers?externalReference=). */
async function findAsaasCustomerByExternalRef(
  asaasApiKey: string,
  externalReference: string
): Promise<string | null> {
  const q = encodeURIComponent(externalReference);
  const list = (await asaasFetchJson(
    asaasApiKey,
    'GET',
    `/customers?externalReference=${q}&limit=10`
  )) as { data?: AsaasCustomerRow[] };
  const row = (list.data || []).find((c) => c.id && !c.deleted);
  return row?.id ?? null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const appointmentId = body.appointment_id || body.appointmentId;
    const barbershopId = body.barbershop_id || body.barbershopId;
    const amount = Number(body.amount || 0);
    const description = body.description || 'Pagamento agendamento';
    const method = (body.method || 'pix') as Method;
    const requestedProvider = body.provider as Provider | undefined;
    const customerName = body.customer_name || body.customerName || 'Cliente';
    const customerEmail = body.customer_email || body.customerEmail;
    const customerPhone = body.customer_phone || body.customerPhone || body.customer_whatsapp || '';
    const successUrl = body.success_url || body.successUrl;
    const cancelUrl = body.cancel_url || body.cancelUrl;

    if (!appointmentId || !barbershopId || amount <= 0) {
      throw new Error('Parâmetros inválidos para pagamento');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let provider: Provider = requestedProvider || 'stripe';
    if (!requestedProvider) {
      const { data: cfg } = await supabaseAdmin
        .from('payment_provider_configs')
        .select('booking_provider, rollout_enabled')
        .eq('barbershop_id', barbershopId)
        .maybeSingle();
      if (cfg?.rollout_enabled && cfg.booking_provider) {
        provider = cfg.booking_provider as Provider;
      }
    }

    if (provider === 'stripe') {
      const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
      if (!stripeSecret) throw new Error('STRIPE_SECRET_KEY não configurada');

      const stripe = new Stripe(stripeSecret, {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
      });

      const paymentMethodTypes = method === 'pix' ? ['pix'] : ['card'];
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: paymentMethodTypes as Array<'card' | 'pix'>,
        line_items: [
          {
            price_data: {
              currency: 'brl',
              unit_amount: Math.round(amount * 100),
              product_data: {
                name: description,
              },
            },
            quantity: 1,
          },
        ],
        success_url:
          successUrl ||
          `${req.headers.get('origin')}/#/booking/success?appointment_id=${appointmentId}`,
        cancel_url:
          cancelUrl ||
          `${req.headers.get('origin')}/#/booking/cancel?appointment_id=${appointmentId}`,
        metadata: {
          appointment_id: appointmentId,
          barbershop_id: barbershopId,
          provider: 'stripe',
        },
      });

      await supabaseAdmin.from('payments').insert({
        payment_id: session.id,
        appointment_id: appointmentId,
        amount,
        status: 'pending',
        payment_method: method,
        payment_data: {
          provider: 'stripe',
          checkout_url: session.url,
        },
      });

      return new Response(
        JSON.stringify({
          provider: 'stripe',
          paymentId: session.id,
          paymentUrl: session.url,
          status: 'pending',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Provider Asaas
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
    if (!asaasApiKey) throw new Error('ASAAS_API_KEY não configurada');
    assertAsaasKeyMatchesEnv(asaasApiKey);

    // Idempotência: mesma cobrança pendente Asaas já registrada para este agendamento
    const { data: existingPay } = await supabaseAdmin
      .from('payments')
      .select('payment_id, payment_data, status')
      .eq('appointment_id', appointmentId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const existingPd = existingPay?.payment_data as
      | { provider?: string; invoice_url?: string | null; pix_qr_code?: string | null; pix_copy_paste?: string | null }
      | null
      | undefined;
    if (existingPay && existingPd?.provider === 'asaas') {
      return new Response(
        JSON.stringify({
          provider: 'asaas',
          paymentId: existingPay.payment_id,
          paymentUrl: existingPd.invoice_url || null,
          qrCode: existingPd.pix_qr_code || null,
          pixCode: existingPd.pix_copy_paste || null,
          status: 'pending',
          duplicate: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const customerExtRef = asaasBookingCustomerExternalRef(barbershopId, customerPhone);
    let asaasCustomerId = await findAsaasCustomerByExternalRef(asaasApiKey, customerExtRef);

    const emailTrim = typeof customerEmail === 'string' ? customerEmail.trim() : '';
    const emailForAsaas =
      emailTrim.length > 0
        ? emailTrim
        : `booking.${barbershopId.replace(/-/g, '').slice(0, 12)}.${phoneDigits(customerPhone)}@invalid`;

    if (!asaasCustomerId) {
      const customerPayload = (await asaasFetchJson(asaasApiKey, 'POST', '/customers', {
        name: customerName,
        email: emailForAsaas,
        mobilePhone: phoneDigits(customerPhone) !== '0' ? phoneDigits(customerPhone) : undefined,
        externalReference: customerExtRef,
      })) as { id: string };
      asaasCustomerId = customerPayload.id;
    }

    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const paymentPayload = (await asaasFetchJson(asaasApiKey, 'POST', '/payments', {
      customer: asaasCustomerId,
      billingType: toAsaasBillingType(method),
      value: Number(amount.toFixed(2)),
      dueDate,
      description,
      externalReference: `${barbershopId}:${appointmentId}`,
    })) as {
      id: string;
      invoiceUrl?: string | null;
      bankSlipUrl?: string | null;
      encodedImage?: string | null;
      payload?: string | null;
    };

    await supabaseAdmin.from('payments').insert({
      payment_id: paymentPayload.id,
      appointment_id: appointmentId,
      amount,
      status: 'pending',
      payment_method: method,
      payment_data: {
        provider: 'asaas',
        invoice_url: paymentPayload.invoiceUrl || null,
        pix_qr_code: paymentPayload.encodedImage || null,
        pix_copy_paste: paymentPayload.payload || null,
      },
    });

    return new Response(
      JSON.stringify({
        provider: 'asaas',
        paymentId: paymentPayload.id,
        paymentUrl: paymentPayload.invoiceUrl || paymentPayload.bankSlipUrl || null,
        qrCode: paymentPayload.encodedImage || null,
        pixCode: paymentPayload.payload || null,
        status: 'pending',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('create-booking-payment error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro ao criar pagamento',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
