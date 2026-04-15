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

function toAsaasBillingType(method: Method) {
  if (method === 'pix') return 'PIX';
  if (method === 'boleto') return 'BOLETO';
  if (method === 'debit_card') return 'DEBIT_CARD';
  return 'CREDIT_CARD';
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

    const customerResponse = await fetch(`${asaasBaseUrl()}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: asaasApiKey,
      },
      body: JSON.stringify({
        name: customerName,
        email: customerEmail,
        externalReference: `${barbershopId}:${appointmentId}`,
      }),
    });
    const customerPayload = await customerResponse.json();
    if (!customerResponse.ok) {
      throw new Error(customerPayload?.errors?.[0]?.description || 'Falha ao criar customer Asaas');
    }

    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const paymentResponse = await fetch(`${asaasBaseUrl()}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: asaasApiKey,
      },
      body: JSON.stringify({
        customer: customerPayload.id,
        billingType: toAsaasBillingType(method),
        value: Number(amount.toFixed(2)),
        dueDate,
        description,
        externalReference: `${barbershopId}:${appointmentId}`,
      }),
    });
    const paymentPayload = await paymentResponse.json();
    if (!paymentResponse.ok) {
      throw new Error(paymentPayload?.errors?.[0]?.description || 'Falha ao criar cobrança Asaas');
    }

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
