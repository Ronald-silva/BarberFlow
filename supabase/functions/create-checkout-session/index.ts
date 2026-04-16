// =====================================================
// CREATE CHECKOUT SESSION - Supabase Edge Function
// =====================================================
// This Edge Function creates a Stripe Checkout Session
// for subscribing to a plan
//
// Deploy: supabase functions deploy create-checkout-session
// Test: supabase functions serve create-checkout-session
//
// Created: 2025-12-30
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno';

// =====================================================
// CORS HEADERS
// =====================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type BillingProvider = 'stripe' | 'asaas';

type CheckoutRequest = {
  plan_id?: string;
  planId?: string;
  billing_cycle?: 'monthly' | 'yearly';
  billingCycle?: 'monthly' | 'yearly';
  barbershop_id?: string;
  barbershopId?: string;
  success_url?: string;
  successUrl?: string;
  cancel_url?: string;
  cancelUrl?: string;
  provider?: BillingProvider;
  billing_type?: 'CREDIT_CARD' | 'PIX' | 'BOLETO';
};

function normalizeBillingCycle(value?: string): 'monthly' | 'yearly' {
  return value === 'yearly' ? 'yearly' : 'monthly';
}

async function resolveProvider(
  supabaseAdmin: ReturnType<typeof createClient>,
  barbershopId: string,
  requestedProvider?: BillingProvider
): Promise<BillingProvider> {
  if (requestedProvider) {
    return requestedProvider;
  }

  const { data: config } = await supabaseAdmin
    .from('payment_provider_configs')
    .select('subscription_provider, rollout_enabled')
    .eq('barbershop_id', barbershopId)
    .maybeSingle();

  if (config?.rollout_enabled && config.subscription_provider) {
    return config.subscription_provider as BillingProvider;
  }

  const envProvider = Deno.env.get('BILLING_PROVIDER_DEFAULT');
  return envProvider === 'asaas' ? 'asaas' : 'stripe';
}

function toAsaasBaseUrl(): string {
  const env = (Deno.env.get('ASAAS_ENV') || 'sandbox').toLowerCase();
  return env === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';
}

/** Chave de produção ($aact_prod / _prod_) com ASAAS_ENV≠production → risco de cobrança real ou config errada. */
function assertAsaasKeyMatchesEnv(asaasApiKey: string) {
  const env = (Deno.env.get('ASAAS_ENV') || 'sandbox').toLowerCase();
  const k = asaasApiKey.trim();
  const looksProdKey = /\$aact_prod|_prod_/i.test(k);
  if (env !== 'production' && looksProdKey) {
    throw new Error(
      'Asaas: ASAAS_API_KEY parece de PRODUÇÃO, mas ASAAS_ENV não é production. Para testes sem cobranças reais, use a chave da conta SANDBOX do Asaas e mantenha ASAAS_ENV=sandbox nos secrets (supabase secrets set …).',
    );
  }
}

async function asaasRequest(path: string, method: string, body: Record<string, unknown>) {
  const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
  if (!asaasApiKey) {
    throw new Error('ASAAS_API_KEY não configurada');
  }
  assertAsaasKeyMatchesEnv(asaasApiKey);

  const response = await fetch(`${toAsaasBaseUrl()}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      access_token: asaasApiKey,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();
  if (!response.ok) {
    const message =
      payload?.errors?.[0]?.description || payload?.message || 'Erro ao acessar API Asaas';
    throw new Error(message);
  }

  return payload;
}

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // 2. Initialize Supabase client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Get authenticated user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Não autorizado');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Não autorizado');
    }

    // 5. Parse request body (aceita snake_case e camelCase)
    const body = (await req.json()) as CheckoutRequest;
    const planParam = body.plan_id || body.planId;
    const billingCycle = normalizeBillingCycle(body.billing_cycle || body.billingCycle);
    const barbershopId = body.barbershop_id || body.barbershopId;
    const successUrl = body.success_url || body.successUrl;
    const cancelUrl = body.cancel_url || body.cancelUrl;

    if (!planParam || !barbershopId) {
      throw new Error('Parâmetros inválidos');
    }

    // 6. Validate user access to barbershop
    const { data: requester, error: requesterError } = await supabaseAdmin
      .from('users')
      .select('barbershop_id, role')
      .eq('id', user.id)
      .single();

    if (requesterError || !requester) {
      throw new Error('Usuário não encontrado');
    }

    if (
      requester.role !== 'platform_admin' &&
      requester.barbershop_id !== barbershopId
    ) {
      throw new Error('Sem permissão para esta barbearia');
    }

    const provider = await resolveProvider(supabaseAdmin, barbershopId, body.provider);

    // 7. Get plan details from database (ID UUID ou slug)
    let planQuery = supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .limit(1);

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (typeof planParam === 'string' && uuidPattern.test(planParam)) {
      planQuery = planQuery.eq('id', planParam);
    } else {
      planQuery = planQuery.eq('slug', planParam);
    }

    const { data: plans, error: planError } = await planQuery;
    const plan = plans?.[0];

    if (planError || !plan) {
      throw new Error('Plano não encontrado');
    }

    // 8. Get barbershop details
    const { data: barbershop, error: barbershopError } = await supabaseAdmin
      .from('barbershops')
      .select('name, email')
      .eq('id', barbershopId)
      .single();

    if (barbershopError || !barbershop) {
      throw new Error('Barbearia não encontrada');
    }

    if (provider === 'stripe') {
      if (!stripeSecretKey) {
        throw new Error('STRIPE_SECRET_KEY não configurada');
      }

      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
      });

      let customerId: string;
      const { data: existingCustomer } = await supabaseAdmin
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('barbershop_id', barbershopId)
        .single();

      if (existingCustomer?.stripe_customer_id) {
        customerId = existingCustomer.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({
          email: barbershop.email || user.email,
          name: barbershop.name,
          metadata: {
            barbershop_id: barbershopId,
            user_id: user.id,
          },
        });

        customerId = customer.id;

        await supabaseAdmin.from('stripe_customers').insert({
          barbershop_id: barbershopId,
          user_id: user.id,
          stripe_customer_id: customerId,
          email: barbershop.email || user.email,
          name: barbershop.name,
        });
      }

      await supabaseAdmin
        .from('payment_customers')
        .upsert(
          {
            barbershop_id: barbershopId,
            user_id: user.id,
            provider: 'stripe',
            provider_customer_id: customerId,
            email: barbershop.email || user.email,
            name: barbershop.name,
            metadata: { source: 'create-checkout-session' },
          },
          { onConflict: 'barbershop_id,provider' }
        );

      const stripePriceId =
        billingCycle === 'yearly'
          ? plan.stripe_price_id_yearly
          : plan.stripe_price_id_monthly;

      if (!stripePriceId) {
        throw new Error('Price ID do Stripe não configurado para este plano');
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        success_url:
          successUrl || `${req.headers.get('origin')}/#/dashboard/overview?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${req.headers.get('origin')}/#/pricing?canceled=true`,
        subscription_data: {
          trial_period_days: 14,
          metadata: {
            barbershop_id: barbershopId,
            plan_id: plan.id,
            billing_cycle: billingCycle,
            provider: 'stripe',
          },
        },
        metadata: {
          barbershop_id: barbershopId,
          plan_id: plan.id,
          billing_cycle: billingCycle,
          provider: 'stripe',
        },
      });

      return new Response(
        JSON.stringify({
          provider: 'stripe',
          url: session.url,
          session_id: session.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Provider: Asaas
    const billingType = body.billing_type || 'CREDIT_CARD';
    const externalReference = `${barbershopId}:${plan.id}:${billingCycle}`;
    const { data: existingAsaasCustomer } = await supabaseAdmin
      .from('payment_customers')
      .select('provider_customer_id')
      .eq('barbershop_id', barbershopId)
      .eq('provider', 'asaas')
      .maybeSingle();

    let asaasCustomerId = existingAsaasCustomer?.provider_customer_id;

    if (!asaasCustomerId) {
      const customer = await asaasRequest('/customers', 'POST', {
        name: barbershop.name,
        email: barbershop.email || user.email,
        externalReference: barbershopId,
      });

      asaasCustomerId = customer.id;
      await supabaseAdmin
        .from('payment_customers')
        .upsert(
          {
            barbershop_id: barbershopId,
            user_id: user.id,
            provider: 'asaas',
            provider_customer_id: asaasCustomerId,
            email: barbershop.email || user.email,
            name: barbershop.name,
            metadata: { createdBy: 'create-checkout-session' },
          },
          { onConflict: 'barbershop_id,provider' }
        );
    }

    const cycle = billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY';
    const value = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const nextDueDate = new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 86400000)
      .toISOString()
      .slice(0, 10);

    const asaasSubscription = await asaasRequest('/subscriptions', 'POST', {
      customer: asaasCustomerId,
      billingType,
      value,
      cycle,
      nextDueDate,
      description: `Assinatura ${plan.name} (${billingCycle})`,
      externalReference,
    });

    await supabaseAdmin.from('subscriptions').insert({
      barbershop_id: barbershopId,
      plan_id: plan.id,
      stripe_customer_id: null,
      provider: 'asaas',
      provider_customer_id: asaasCustomerId,
      provider_subscription_id: asaasSubscription.id,
      provider_price_id: billingCycle === 'yearly' ? plan.asaas_plan_id_yearly : plan.asaas_plan_id_monthly,
      billing_cycle: billingCycle,
      amount: value,
      currency: 'BRL',
      status: 'pending',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 86400000).toISOString(),
      metadata: {
        provider: 'asaas',
        external_reference: externalReference,
      },
    });

    return new Response(
      JSON.stringify({
        provider: 'asaas',
        url:
          asaasSubscription.invoiceUrl ||
          asaasSubscription.bankSlipUrl ||
          `${req.headers.get('origin')}/#/dashboard/subscription?provider=asaas&subscription_id=${asaasSubscription.id}`,
        subscription_id: asaasSubscription.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao criar sessão de checkout',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
