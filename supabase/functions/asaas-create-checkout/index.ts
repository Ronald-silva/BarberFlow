import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function asaasBaseUrl() {
  const env = (Deno.env.get('ASAAS_ENV') || 'sandbox').toLowerCase();
  return env === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';
}

function assertAsaasKeyMatchesEnv(asaasApiKey: string) {
  const env = (Deno.env.get('ASAAS_ENV') || 'sandbox').toLowerCase();
  const k = asaasApiKey.trim();
  if (env !== 'production' && (/\$aact_prod|_prod_/i.test(k))) {
    throw new Error(
      'Asaas: chave de PRODUÇÃO com ASAAS_ENV=sandbox. Use chave SANDBOX e ASAAS_ENV=sandbox.',
    );
  }
}

async function asaasRequest(path: string, body: Record<string, unknown>) {
  const key = Deno.env.get('ASAAS_API_KEY');
  if (!key) throw new Error('ASAAS_API_KEY não configurada');
  assertAsaasKeyMatchesEnv(key);

  const response = await fetch(`${asaasBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      access_token: key,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.errors?.[0]?.description || payload?.message || 'Erro API Asaas');
  }
  return payload;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Não autorizado');

    const token = authHeader.replace('Bearer ', '');
    const { data: authData } = await supabaseAdmin.auth.getUser(token);
    if (!authData.user) throw new Error('Não autorizado');

    const body = await req.json();
    const planId = body.plan_id || body.planId;
    const billingCycle = body.billing_cycle || body.billingCycle || 'monthly';
    const barbershopId = body.barbershop_id || body.barbershopId;
    const billingType = body.billing_type || body.billingType || 'CREDIT_CARD';

    if (!planId || !barbershopId) throw new Error('Parâmetros inválidos');

    const { data: plan } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) throw new Error('Plano não encontrado');

    const { data: barbershop } = await supabaseAdmin
      .from('barbershops')
      .select('name, email')
      .eq('id', barbershopId)
      .single();

    if (!barbershop) throw new Error('Barbearia não encontrada');

    const { data: existingCustomer } = await supabaseAdmin
      .from('payment_customers')
      .select('provider_customer_id')
      .eq('barbershop_id', barbershopId)
      .eq('provider', 'asaas')
      .maybeSingle();

    let customerId = existingCustomer?.provider_customer_id;
    if (!customerId) {
      const customer = await asaasRequest('/customers', {
        name: barbershop.name,
        email: barbershop.email || authData.user.email,
        externalReference: barbershopId,
      });
      customerId = customer.id;

      await supabaseAdmin.from('payment_customers').upsert(
        {
          barbershop_id: barbershopId,
          user_id: authData.user.id,
          provider: 'asaas',
          provider_customer_id: customerId,
          email: barbershop.email || authData.user.email,
          name: barbershop.name,
        },
        { onConflict: 'barbershop_id,provider' }
      );
    }

    const value = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const cycle = billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY';
    const nextDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const subscription = await asaasRequest('/subscriptions', {
      customer: customerId,
      billingType,
      value,
      cycle,
      nextDueDate,
      description: `Plano ${plan.name} (${billingCycle})`,
      externalReference: `${barbershopId}:${plan.id}:${billingCycle}`,
    });

    return new Response(
      JSON.stringify({
        provider: 'asaas',
        subscription_id: subscription.id,
        url: subscription.invoiceUrl || subscription.bankSlipUrl || null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro ao criar checkout Asaas',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
