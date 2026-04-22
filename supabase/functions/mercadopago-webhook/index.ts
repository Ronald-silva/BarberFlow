import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

const MP_API = 'https://api.mercadopago.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Mercado Pago espera sempre HTTP 200 — nunca retornar erro
  try {
    const body = await req.json() as {
      type?: string;
      action?: string;
      data?: { id?: string | number };
    };

    // Ignorar eventos que não são de pagamento
    if (body.type !== 'payment' && body.action !== 'payment.updated') {
      return new Response('ok', { headers: corsHeaders });
    }

    const paymentId = body.data?.id ? String(body.data.id) : null;
    if (!paymentId) {
      return new Response('ok', { headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Buscar agendamento pelo mp_payment_id
    const { data: appointment } = await supabaseAdmin
      .from('appointments')
      .select('id, barbershop_id, payment_status')
      .eq('mp_payment_id', paymentId)
      .maybeSingle();

    if (!appointment) {
      console.log(`Nenhum agendamento para mp_payment_id=${paymentId}`);
      return new Response('ok', { headers: corsHeaders });
    }

    // Idempotência: não reprocessar se já finalizado
    if (appointment.payment_status === 'paid' || appointment.payment_status === 'cancelled') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Buscar access token da barbearia para verificar status real no MP
    const { data: barbershop } = await supabaseAdmin
      .from('barbershops')
      .select('mercadopago_access_token')
      .eq('id', appointment.barbershop_id)
      .single();

    if (!barbershop?.mercadopago_access_token) {
      console.error(`Access token MP não encontrado para barbershop_id=${appointment.barbershop_id}`);
      return new Response('ok', { headers: corsHeaders });
    }

    // Verificar status real no MP (não confiar cegamente no webhook)
    const mpRes = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${barbershop.mercadopago_access_token}`,
      },
    });

    const mpData = await mpRes.json() as { status?: string };
    const mpStatus = mpData.status;

    if (mpStatus === 'approved') {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('id', appointment.id);
      console.log(`Agendamento ${appointment.id} confirmado via webhook MP (payment ${paymentId})`);
    } else if (mpStatus === 'cancelled' || mpStatus === 'rejected') {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'cancelled', payment_status: 'cancelled' })
        .eq('id', appointment.id);
      console.log(`Agendamento ${appointment.id} cancelado (status MP: ${mpStatus})`);
    }

    return new Response('ok', { headers: corsHeaders });
  } catch (err) {
    console.error('Erro mercadopago-webhook:', err);
    return new Response('ok', { headers: corsHeaders }); // Sempre 200 para MP não retentar infinitamente
  }
});
