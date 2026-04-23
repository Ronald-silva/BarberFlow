/**
 * create-reserva-pix
 *
 * Cria uma reserva (slot bloqueado por 10 min) e um pagamento PIX via
 * Mercado Pago usando o access_token da própria barbearia (OAuth).
 * Dinheiro cai direto na conta da barbearia — sem intermediação.
 *
 * Fluxo:
 *   1. Valida disponibilidade do horário (sem reserva ativa para o slot)
 *   2. Busca access_token MP da barbearia em payment_provider_configs
 *   3. Cria reserva com status "aguardando_pagamento" e expires_at = now + 10min
 *   4. Cria pagamento PIX no MP com external_reference = reserva.id
 *   5. Atualiza reserva com mp_payment_id e QR code
 *   6. Retorna qr_code, copia-e-cola e dados da reserva para o frontend
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MP_API = 'https://api.mercadopago.com';
const EXPIRY_MINUTES = 10;

function extractMpToken(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const t = (metadata as Record<string, unknown>).mercadopago_access_token;
  return typeof t === 'string' && t.trim().length > 0 ? t.trim() : null;
}

function formatMpError(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return 'Erro desconhecido';
  const b = payload as {
    message?: string;
    error?: string;
    cause?: Array<{ code?: string; description?: string }>;
  };
  const cause =
    Array.isArray(b.cause) && b.cause.length > 0
      ? b.cause
          .map((c) => [c.code, c.description].filter(Boolean).join(': '))
          .join(' | ')
      : '';
  const base = b.message || b.error || 'Erro no Mercado Pago';
  return cause ? `${base} — ${cause}` : base;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as {
      barbearia_id: string;
      profissional_id?: string | null;
      servico_ids?: string[];
      horario: string;      // ISO 8601 UTC
      horario_fim: string;  // ISO 8601 UTC
      cliente_nome: string;
      cliente_whatsapp: string;
      cliente_email?: string;
      valor: number;        // em reais
      descricao?: string;
    };

    const {
      barbearia_id,
      profissional_id = null,
      servico_ids = [],
      horario,
      horario_fim,
      cliente_nome,
      cliente_whatsapp,
      cliente_email,
      valor,
      descricao,
    } = body;

    if (!barbearia_id || !horario || !horario_fim || !cliente_nome || !cliente_whatsapp || !valor || valor <= 0) {
      return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios ausentes ou inválidos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // ── 1. Verificar disponibilidade ──────────────────────────────────────────
    const slotQuery = supabase
      .from('reservas')
      .select('id, status, expires_at')
      .eq('barbearia_id', barbearia_id)
      .eq('horario', horario)
      .in('status', ['aguardando_pagamento', 'pago']);

    if (profissional_id) {
      slotQuery.eq('profissional_id', profissional_id);
    }

    const { data: conflito } = await slotQuery.maybeSingle();

    if (conflito) {
      // Expiração lazy: se a reserva está vencida, liberamos o slot agora
      if (
        conflito.status === 'aguardando_pagamento' &&
        new Date(conflito.expires_at) < new Date()
      ) {
        await supabase
          .from('reservas')
          .update({ status: 'expirado' })
          .eq('id', conflito.id);
      } else {
        const minutosRestantes =
          conflito.status === 'aguardando_pagamento'
            ? Math.ceil((new Date(conflito.expires_at).getTime() - Date.now()) / 60000)
            : null;
        return new Response(
          JSON.stringify({
            error: 'Horário não disponível',
            detail:
              conflito.status === 'aguardando_pagamento'
                ? `Horário reservado por outro cliente. Tente em ${minutosRestantes} min.`
                : 'Horário já agendado.',
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // ── 2. Buscar access_token MP da barbearia ────────────────────────────────
    const [{ data: barbearia }, { data: providerCfg }] = await Promise.all([
      supabase.from('barbershops').select('name').eq('id', barbearia_id).maybeSingle(),
      supabase
        .from('payment_provider_configs')
        .select('metadata')
        .eq('barbershop_id', barbearia_id)
        .maybeSingle(),
    ]);

    if (!barbearia) {
      return new Response(JSON.stringify({ error: 'Barbearia não encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = extractMpToken(providerCfg?.metadata);
    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error:
            'Mercado Pago não configurado para esta barbearia. ' +
            'O administrador deve conectar a conta MP no painel de configurações.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 3. Criar reserva (slot bloqueado) ─────────────────────────────────────
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .insert({
        barbearia_id,
        profissional_id: profissional_id || null,
        servico_ids,
        horario,
        horario_fim,
        cliente_nome: cliente_nome.trim(),
        cliente_whatsapp: cliente_whatsapp.replace(/\D/g, ''),
        cliente_email: cliente_email?.trim() || null,
        valor: Number(valor.toFixed(2)),
        status: 'aguardando_pagamento',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (reservaError || !reserva) {
      // Código 23505 = violação de unique index (slot ocupado por race condition)
      if (reservaError?.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Horário não disponível', detail: 'Conflito de reserva simultânea.' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      console.error('Erro ao criar reserva:', reservaError);
      return new Response(JSON.stringify({ error: 'Erro ao criar reserva' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 4. Criar PIX no Mercado Pago ──────────────────────────────────────────
    const firstName = cliente_nome.trim().split(' ')[0];
    const lastName = cliente_nome.trim().split(' ').slice(1).join(' ') || 'Cliente';
    const payerEmail =
      cliente_email?.trim() ||
      `${cliente_whatsapp.replace(/\D/g, '')}@shafar.app`;

    const mpPayload = {
      transaction_amount: Number(valor.toFixed(2)),
      description: (descricao || `Agendamento - ${barbearia.name}`).slice(0, 200),
      payment_method_id: 'pix',
      payer: { email: payerEmail, first_name: firstName, last_name: lastName },
      external_reference: reserva.id,   // usado pelo webhook para localizar a reserva
      date_of_expiration: expiresAt,
    };

    const mpRes = await fetch(`${MP_API}/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Idempotency-Key': `reserva-${reserva.id}`,
      },
      body: JSON.stringify(mpPayload),
    });

    const mpData = (await mpRes.json()) as {
      id?: number;
      status?: string;
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
          ticket_url?: string;
        };
      };
      message?: string;
      error?: string;
      cause?: unknown[];
    };

    if (!mpRes.ok || !mpData.id) {
      // Rollback: expirar reserva para liberar slot
      await supabase
        .from('reservas')
        .update({ status: 'expirado' })
        .eq('id', reserva.id);
      console.error('Erro MP:', mpRes.status, JSON.stringify(mpData));
      return new Response(
        JSON.stringify({ error: `Erro ao criar pagamento PIX: ${formatMpError(mpData)}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 5. Persistir dados do pagamento na reserva ────────────────────────────
    const txData = mpData.point_of_interaction?.transaction_data;
    const qrCode = txData?.qr_code ?? null;
    const qrCodeBase64 = txData?.qr_code_base64 ?? null;
    const ticketUrl = txData?.ticket_url ?? null;
    const mpPaymentId = String(mpData.id);

    await supabase
      .from('reservas')
      .update({
        mp_payment_id: mpPaymentId,
        mp_qr_code: qrCode,
        mp_qr_code_base64: qrCodeBase64,
        mp_ticket_url: ticketUrl,
      })
      .eq('id', reserva.id);

    // ── 6. Resposta ao frontend ───────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        reserva_id: reserva.id,
        mp_payment_id: mpPaymentId,
        qr_code: qrCode,
        qr_code_base64: qrCodeBase64,
        ticket_url: ticketUrl,
        expires_at: expiresAt,
        status: 'aguardando_pagamento',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Erro create-reserva-pix:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
