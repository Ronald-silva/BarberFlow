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
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Não autorizado');
    }

    // 5. Parse request body
    const { plan_id, billing_cycle, barbershop_id } = await req.json();

    if (!plan_id || !billing_cycle || !barbershop_id) {
      throw new Error('Parâmetros inválidos');
    }

    // 6. Get plan details from database
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      throw new Error('Plano não encontrado');
    }

    // 7. Get barbershop details
    const { data: barbershop, error: barbershopError } = await supabaseAdmin
      .from('barbershops')
      .select('name, email')
      .eq('id', barbershop_id)
      .single();

    if (barbershopError || !barbershop) {
      throw new Error('Barbearia não encontrada');
    }

    // 8. Check if Stripe customer already exists
    let customerId: string;
    const { data: existingCustomer } = await supabaseAdmin
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('barbershop_id', barbershop_id)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: barbershop.email || user.email,
        name: barbershop.name,
        metadata: {
          barbershop_id: barbershop_id,
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Save to database
      await supabaseAdmin.from('stripe_customers').insert({
        barbershop_id: barbershop_id,
        user_id: user.id,
        stripe_customer_id: customerId,
        email: barbershop.email || user.email,
        name: barbershop.name,
      });
    }

    // 9. Get Stripe Price ID
    const stripePriceId =
      billing_cycle === 'yearly'
        ? plan.stripe_price_id_yearly
        : plan.stripe_price_id_monthly;

    if (!stripePriceId) {
      throw new Error('Price ID do Stripe não configurado para este plano');
    }

    // 10. Create Checkout Session
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
      success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/pricing?cancelled=true`,
      subscription_data: {
        trial_period_days: 14, // 14 days free trial
        metadata: {
          barbershop_id: barbershop_id,
          plan_id: plan_id,
          billing_cycle: billing_cycle,
        },
      },
      metadata: {
        barbershop_id: barbershop_id,
        plan_id: plan_id,
        billing_cycle: billing_cycle,
      },
    });

    // 11. Return session URL
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
