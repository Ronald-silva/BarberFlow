import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

const MP_API = 'https://api.mercadopago.com';

type MpWebhookPayload = {
  id?: string | number;
  type?: string;
  action?: string;
  data?: { id?: string | number };
};

function parseSignatureHeader(raw: string | null): { ts: string; v1: string } | null {
  if (!raw) return null;
  const parts = raw.split(',');
  let ts = '';
  let v1 = '';
  for (const part of parts) {
    const [k, v] = part.split('=');
    if (!k || !v) continue;
    const key = k.trim().toLowerCase();
    const value = v.trim();
    if (key === 'ts') ts = value;
    if (key === 'v1') v1 = value;
  }
  if (!ts || !v1) return null;
  return { ts, v1: v1.toLowerCase() };
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const bytes = new Uint8Array(sig);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function toCanonicalDataId(dataId: string): string {
  return /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
}

function buildManifest(dataId: string | null, requestId: string | null, ts: string | null): string {
  const parts: string[] = [];
  if (dataId) parts.push(`id:${toCanonicalDataId(dataId)}`);
  if (requestId) parts.push(`request-id:${requestId}`);
  if (ts) parts.push(`ts:${ts}`);
  return parts.length > 0 ? `${parts.join(';')};` : '';
}

function extractMercadoPagoToken(providerMetadata: unknown): string | null {
  if (providerMetadata && typeof providerMetadata === 'object') {
    const token = (providerMetadata as Record<string, unknown>).mercadopago_access_token;
    if (typeof token === 'string' && token.trim().length > 0) return token.trim();
  }
  return null;
}

async function isMercadoPagoSignatureValid(
  req: Request,
  payload: MpWebhookPayload,
): Promise<{ valid: boolean; reason?: string }> {
  const webhookSecret = (Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET') || '').trim();
  if (!webhookSecret) {
    return { valid: false, reason: 'MERCADOPAGO_WEBHOOK_SECRET ausente' };
  }

  const parsed = parseSignatureHeader(req.headers.get('x-signature'));
  if (!parsed) {
    return { valid: false, reason: 'Header x-signature inválido/ausente' };
  }

  const requestId = (req.headers.get('x-request-id') || '').trim();
  if (!requestId) {
    return { valid: false, reason: 'Header x-request-id ausente' };
  }

  const url = new URL(req.url);
  const queryDataId = url.searchParams.get('data.id');
  const bodyDataId = payload.data?.id ? String(payload.data.id) : null;
  const dataId = queryDataId || bodyDataId;
  if (!dataId) {
    return { valid: false, reason: 'data.id ausente em query/body' };
  }

  const manifest = buildManifest(dataId, requestId, parsed.ts);
  if (!manifest) {
    return { valid: false, reason: 'Manifest de assinatura vazio' };
  }

  const expected = await hmacSha256Hex(webhookSecret, manifest);
  if (!timingSafeEqualHex(expected, parsed.v1)) {
    return { valid: false, reason: 'Assinatura não confere' };
  }

  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Mercado Pago espera sempre HTTP 200 — nunca retornar erro
  try {
    const body = (await req.json()) as MpWebhookPayload;

    const signatureValidation = await isMercadoPagoSignatureValid(req, body);
    if (!signatureValidation.valid) {
      console.warn(
        `mercadopago-webhook: rejeitado por assinatura inválida (${signatureValidation.reason})`,
      );
      return new Response('ok', { headers: corsHeaders });
    }

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

    // Buscar reserva pelo mp_payment_id
    const { data: reserva } = await supabaseAdmin
      .from('reservas')
      .select('id, barbearia_id, status, profissional_id, servico_ids, horario, horario_fim, cliente_nome, cliente_whatsapp, valor')
      .eq('mp_payment_id', paymentId)
      .maybeSingle();

    if (!reserva) {
      console.log(`Nenhuma reserva para mp_payment_id=${paymentId}`);
      return new Response('ok', { headers: corsHeaders });
    }

    // Idempotência: não reprocessar se já finalizado
    if (reserva.status === 'pago' || reserva.status === 'cancelado') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Buscar access token da barbearia para verificar status real no MP
    const { data: providerCfg } = await supabaseAdmin
      .from('payment_provider_configs')
      .select('metadata')
      .eq('barbershop_id', reserva.barbearia_id)
      .maybeSingle();

    const accessToken = extractMercadoPagoToken(providerCfg?.metadata);

    if (!accessToken) {
      console.error(`Access token MP não encontrado para barbearia_id=${reserva.barbearia_id}`);
      return new Response('ok', { headers: corsHeaders });
    }

    // Verificar status real no MP (não confiar cegamente no webhook)
    const mpRes = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const mpData = (await mpRes.json()) as { status?: string };
    const mpStatus = mpData.status;

    if (mpStatus === 'approved') {
      // Atualizar reserva para pago
      await supabaseAdmin
        .from('reservas')
        .update({ status: 'pago' })
        .eq('id', reserva.id)
        .eq('status', 'aguardando_pagamento'); // guard contra race condition

      // Criar agendamento confirmado
      const { error: agendErr } = await supabaseAdmin
        .from('agendamentos')
        .insert({
          reserva_id: reserva.id,
          barbearia_id: reserva.barbearia_id,
          profissional_id: reserva.profissional_id,
          servico_ids: reserva.servico_ids,
          horario: reserva.horario,
          horario_fim: reserva.horario_fim,
          cliente_nome: reserva.cliente_nome,
          cliente_whatsapp: reserva.cliente_whatsapp,
          valor: reserva.valor,
          mp_payment_id: paymentId,
        })
        .onConflict('reserva_id') // idempotência — não duplicar
        .ignoreDuplicates();

      if (agendErr) {
        console.error(`Erro ao criar agendamento para reserva ${reserva.id}:`, agendErr);
      } else {
        console.log(`Reserva ${reserva.id} paga — agendamento criado (payment ${paymentId})`);
      }
    } else if (mpStatus === 'cancelled' || mpStatus === 'rejected') {
      await supabaseAdmin
        .from('reservas')
        .update({ status: 'cancelado' })
        .eq('id', reserva.id)
        .eq('status', 'aguardando_pagamento');

      console.log(`Reserva ${reserva.id} cancelada (status MP: ${mpStatus})`);
    }

    return new Response('ok', { headers: corsHeaders });
  } catch (err) {
    console.error('Erro mercadopago-webhook:', err);
    return new Response('ok', { headers: corsHeaders }); // Sempre 200 para MP não retentar infinitamente
  }
});
