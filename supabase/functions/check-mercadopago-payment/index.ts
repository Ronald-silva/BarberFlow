import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MP_API = 'https://api.mercadopago.com';
type Requester = { id: string; barbershop_id: string | null; role: string };

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function parseBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') return null;
  return token.trim();
}

function extractMercadoPagoToken(
  providerMetadata: unknown,
): string | null {
  if (providerMetadata && typeof providerMetadata === 'object') {
    const token = (providerMetadata as Record<string, unknown>).mercadopago_access_token;
    if (typeof token === 'string') {
      const normalized = token.replace(/\s+/g, '');
      if (normalized.length > 0) return normalized;
    }
  }
  return null;
}

function isLikelyMercadoPagoAccessToken(token: string | null): boolean {
  if (!token) return false;
  return token.startsWith('TEST-') || token.startsWith('APP_USR-');
}

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
      throw new HttpError(400, 'payment_id, barbershop_id e appointment_id são obrigatórios');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .select('id, barbershop_id, payment_status, mp_payment_id')
      .eq('id', appointment_id)
      .single();

    if (appointmentError || !appointment) {
      throw new HttpError(404, 'Agendamento não encontrado');
    }

    if (appointment.barbershop_id !== barbershop_id) {
      throw new HttpError(403, 'Agendamento não pertence à barbearia informada');
    }

    if (!appointment.mp_payment_id || appointment.mp_payment_id !== payment_id) {
      throw new HttpError(403, 'payment_id não corresponde ao agendamento informado');
    }

    if (appointment.payment_status !== 'pending_payment') {
      return new Response(
        JSON.stringify({ status: appointment.payment_status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const token = parseBearerToken(req);
    if (token) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (authError || !authData?.user) {
        throw new HttpError(401, 'Token inválido');
      }

      const { data: requester, error: requesterError } = await supabaseAdmin
        .from('users')
        .select('id, barbershop_id, role')
        .eq('id', authData.user.id)
        .single();

      const requesterData = requester as Requester | null;
      if (requesterError || !requesterData) {
        throw new HttpError(403, 'Usuário sem perfil autorizado');
      }

      const canAccess =
        requesterData.role === 'platform_admin' || requesterData.barbershop_id === barbershop_id;
      if (!canAccess) {
        throw new HttpError(403, 'Sem permissão para consultar este pagamento');
      }
    }

    const { data: providerCfg } = await supabaseAdmin
      .from('payment_provider_configs')
      .select('metadata')
      .eq('barbershop_id', barbershop_id)
      .maybeSingle();

    const accessTokenFromMetadata = extractMercadoPagoToken(providerCfg?.metadata);
    const accessTokenFromEnv = (Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || '').replace(/\s+/g, '');
    const metadataTokenValid = isLikelyMercadoPagoAccessToken(accessTokenFromMetadata);
    const envTokenValid = isLikelyMercadoPagoAccessToken(accessTokenFromEnv);
    const accessToken = metadataTokenValid
      ? accessTokenFromMetadata
      : envTokenValid
      ? accessTokenFromEnv
      : (accessTokenFromMetadata || accessTokenFromEnv || null);

    if (!accessToken) {
      throw new HttpError(
        400,
        'Configuração MP não encontrada. Defina token por barbearia ou MERCADOPAGO_ACCESS_TOKEN nos Supabase Secrets.',
      );
    }
    if (!isLikelyMercadoPagoAccessToken(accessToken)) {
      throw new HttpError(
        400,
        'Token MP inválido. Use TEST-... (sandbox) ou APP_USR-... (produção).',
      );
    }

    const mpRes = await fetch(`${MP_API}/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const mpData = await mpRes.json() as { status?: string; status_detail?: string };

    if (!mpRes.ok) {
      throw new HttpError(502, 'Erro ao consultar pagamento no Mercado Pago');
    }

    const mpStatus = mpData.status ?? 'pending';

    // Aprovar agendamento ao confirmar pagamento (idempotente)
    if (mpStatus === 'approved') {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('id', appointment_id)
        .eq('barbershop_id', barbershop_id)
        .eq('mp_payment_id', payment_id)
        .eq('payment_status', 'pending_payment');
    }

    // Cancelar agendamento se pagamento foi rejeitado/cancelado
    if (mpStatus === 'cancelled' || mpStatus === 'rejected') {
      await supabaseAdmin
        .from('appointments')
        .update({ status: 'cancelled', payment_status: 'cancelled' })
        .eq('id', appointment_id)
        .eq('barbershop_id', barbershop_id)
        .eq('mp_payment_id', payment_id)
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
      { status: err instanceof HttpError ? err.status : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
