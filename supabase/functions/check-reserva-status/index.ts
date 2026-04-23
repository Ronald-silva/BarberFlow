/**
 * check-reserva-status
 *
 * Polling endpoint chamado pelo frontend a cada 3s durante a tela de PIX.
 * Retorna o status atual da reserva e realiza expiração lazy quando necessário.
 *
 * Status possíveis retornados:
 *   aguardando_pagamento  — cliente ainda não pagou
 *   pago                  — webhook confirmou; frontend avança para tela de sucesso
 *   expirado              — tempo esgotou; frontend exibe mensagem e permite nova tentativa
 *   cancelado             — pagamento cancelado/rejeitado no MP
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as {
      reserva_id: string;
      barbearia_id: string;
    };

    const { reserva_id, barbearia_id } = body;

    if (!reserva_id || !barbearia_id) {
      return new Response(
        JSON.stringify({ error: 'reserva_id e barbearia_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: reserva, error } = await supabase
      .from('reservas')
      .select('id, status, expires_at, mp_payment_id, barbearia_id')
      .eq('id', reserva_id)
      .eq('barbearia_id', barbearia_id)
      .maybeSingle();

    if (error || !reserva) {
      return new Response(JSON.stringify({ error: 'Reserva não encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Expiração lazy: se o tempo esgotou mas o status ainda não foi atualizado, faz agora
    if (
      reserva.status === 'aguardando_pagamento' &&
      new Date(reserva.expires_at) < new Date()
    ) {
      await supabase
        .from('reservas')
        .update({ status: 'expirado' })
        .eq('id', reserva.id)
        .eq('status', 'aguardando_pagamento'); // guard contra race condition

      return new Response(
        JSON.stringify({ status: 'expirado', reserva_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        status: reserva.status,
        reserva_id: reserva.id,
        expires_at: reserva.expires_at,
        seconds_left:
          reserva.status === 'aguardando_pagamento'
            ? Math.max(0, Math.floor((new Date(reserva.expires_at).getTime() - Date.now()) / 1000))
            : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Erro check-reserva-status:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
