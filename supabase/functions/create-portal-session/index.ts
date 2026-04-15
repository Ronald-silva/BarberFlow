// =====================================================
// CREATE PORTAL SESSION - Supabase Edge Function
// =====================================================
// This Edge Function creates a Stripe Customer Portal Session
// for managing subscriptions and payment methods
//
// Deploy: supabase functions deploy create-portal-session
// Test: supabase functions serve create-portal-session
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
    const barbershopId = body.barbershop_id || body.barbershopId;
    const returnUrl = body.return_url || body.returnUrl;

    if (!barbershopId) {
      throw new Error('barbershop_id é obrigatório');
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

    // 7. Get Stripe customer ID from database
    const { data: stripeCustomer, error: customerError } = await supabaseAdmin
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('barbershop_id', barbershopId)
      .single();

    if (customerError || !stripeCustomer) {
      throw new Error('Cliente Stripe não encontrado. Faça uma assinatura primeiro.');
    }

    // 8. Create Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomer.stripe_customer_id,
      return_url: returnUrl || `${req.headers.get('origin')}/#/dashboard/settings`,
    });

    // 9. Return session URL
    return new Response(
      JSON.stringify({
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating portal session:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao criar sessão do portal',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
