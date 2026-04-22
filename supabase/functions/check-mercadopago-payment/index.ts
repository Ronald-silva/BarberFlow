import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MP_API = 'https://api.mercadopago.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { payment_id, barbershop_id, appointment_id } = body as {
      payment_id: string;
      barbershop_id: string;
      appointment_id: string;
    };

    if (!payment_id || !barbershop_id || !appointment_id) {
      return new Response(
        JSON.stringify({ error: 'payment_id, barbershop_id e appointment_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: barbershop } = await supabaseAdmin
      .from('barbershops')
      .select('mercadopago_access_token')
      .eq('id', barbershop_id)
      .single();

    if (!barbershop?.mercadopago_access_token) {
      return new Response(
        JSON.stringify({ error: 'Configuração MP não encontrada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const mpRes = await fetch(`${MP_API}/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Bearer ${barbershop.mercadopago_access_token}`,
      },
    });

    const mpData = await mpRes.json() as { status?: string; status_detail?: string };

    if (!mpRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Erro ao consultar pagamento no Mercado Pago' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const mpStatus = mpData.status ?? 'pending';

    // Aprovar agendamento ao confirmar pagamento (idempotente)
    if (mpStatus === 'approved') {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('id', appointment_id)
        .eq('payment_status', 'pending_payment');
    }

    // Cancelar agendamento se pagamento foi rejeitado/cancelado
    if (mpStatus === 'cancelled' || mpStatus === 'rejected') {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'cancelled', payment_status: 'cancelled' })
        .eq('id', appointment_id)
        .eq('payment_status', 'pending_payment');
    }

    return new Response(
      JSON.stringify({ status: mpStatus, status_detail: mpData.status_detail }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Erro check-mercadopago-payment:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
