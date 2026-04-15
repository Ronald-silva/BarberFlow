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

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    // 2. Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 3. Initialize Supabase client
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
    const body = await req.json();
    const planParam = body.plan_id || body.planId;
    const billingCycle = body.billing_cycle || body.billingCycle || 'monthly';
    const barbershopId = body.barbershop_id || body.barbershopId;
    const successUrl = body.success_url || body.successUrl;
    const cancelUrl = body.cancel_url || body.cancelUrl;

    if (!planParam || !barbershopId) {
      throw new Error('Parâmetros inválidos');
    }

    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      throw new Error('billing_cycle inválido');
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

    // 9. Check if Stripe customer already exists
    let customerId: string;
    const { data: existingCustomer } = await supabaseAdmin
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('barbershop_id', barbershopId)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: barbershop.email || user.email,
        name: barbershop.name,
        metadata: {
          barbershop_id: barbershopId,
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Save to database
      await supabaseAdmin.from('stripe_customers').insert({
        barbershop_id: barbershopId,
        user_id: user.id,
        stripe_customer_id: customerId,
        email: barbershop.email || user.email,
        name: barbershop.name,
      });
    }

    // 10. Get Stripe Price ID
    const stripePriceId =
      billingCycle === 'yearly'
        ? plan.stripe_price_id_yearly
        : plan.stripe_price_id_monthly;

    if (!stripePriceId) {
      throw new Error('Price ID do Stripe não configurado para este plano');
    }

    // 11. Create Checkout Session
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
        trial_period_days: 14, // 14 days free trial
        metadata: {
          barbershop_id: barbershopId,
          plan_id: plan.id,
          billing_cycle: billingCycle,
        },
      },
      metadata: {
        barbershop_id: barbershopId,
        plan_id: plan.id,
        billing_cycle: billingCycle,
      },
    });

    // 12. Return session URL
    return new Response(
      JSON.stringify({
        url: session.url,
        session_id: session.id,
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
