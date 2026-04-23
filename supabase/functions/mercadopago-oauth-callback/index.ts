import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const APP_ORIGIN = 'https://shafar.vercel.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': APP_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function redirect(path: 'success' | 'error', detail?: string): Response {
  const extra = detail ? `&detail=${encodeURIComponent(detail)}` : '';
  const target = `${APP_ORIGIN}/#/dashboard/settings?${path}=true${extra}`;
  return Response.redirect(target, 302);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');   // = barbershopId (URL-encoded)
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    console.warn('MP OAuth retornou erro:', errorParam);
    return redirect('error', errorParam);
  }

  if (!code || !state) {
    console.warn('Parâmetros ausentes: code ou state');
    return redirect('error', 'missing_params');
  }

  const barbershopId = decodeURIComponent(state).trim();
  if (!barbershopId) return redirect('error', 'invalid_state');

  const clientId     = Deno.env.get('MERCADOPAGO_CLIENT_ID');
  const clientSecret = Deno.env.get('MERCADOPAGO_CLIENT_SECRET');
  const redirectUri  = Deno.env.get('MERCADOPAGO_REDIRECT_URI');

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Secrets MERCADOPAGO_CLIENT_ID / CLIENT_SECRET / REDIRECT_URI não configurados');
    return redirect('error', 'mp_app_not_configured');
  }

  // ── 1. Troca code por tokens no Mercado Pago ──────────────────────────────
  let tokenData: {
    access_token?: string;
    refresh_token?: string;
    public_key?: string;
    user_id?: number | string;
    token_type?: string;
    scope?: string;
    message?: string;
    error?: string;
    cause?: Array<{ code?: string; description?: string }>;
  };

  try {
    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      const cause = Array.isArray(tokenData.cause)
        ? tokenData.cause.map((c) => c.description || c.code).filter(Boolean).join(', ')
        : '';
      const errMsg = cause || tokenData.message || tokenData.error || 'token_exchange_failed';
      console.error('MP token error:', tokenRes.status, JSON.stringify(tokenData));
      return redirect('error', errMsg);
    }
  } catch (fetchErr) {
    console.error('Erro de rede ao chamar MP:', fetchErr);
    return redirect('error', 'mp_network_error');
  }

  // ── 2. Persistir tokens no Supabase ──────────────────────────────────────
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Garante que a barbearia existe antes de salvar
    const { data: barbershop } = await supabaseAdmin
      .from('barbershops')
      .select('id')
      .eq('id', barbershopId)
      .maybeSingle();

    if (!barbershop) {
      console.error('Barbearia não encontrada:', barbershopId);
      return redirect('error', 'barbershop_not_found');
    }

    // Preserva quaisquer outros campos já existentes no metadata
    const { data: existingCfg } = await supabaseAdmin
      .from('payment_provider_configs')
      .select('metadata')
      .eq('barbershop_id', barbershopId)
      .maybeSingle();

    const prevMetadata: Record<string, unknown> =
      existingCfg?.metadata && typeof existingCfg.metadata === 'object'
        ? (existingCfg.metadata as Record<string, unknown>)
        : {};

    const metadata: Record<string, unknown> = {
      ...prevMetadata,
      mercadopago_access_token: tokenData.access_token,
    };
    if (tokenData.refresh_token) metadata.mercadopago_refresh_token = tokenData.refresh_token;
    if (tokenData.public_key)    metadata.mercadopago_public_key    = tokenData.public_key;
    if (tokenData.user_id)       metadata.mercadopago_user_id       = String(tokenData.user_id);

    const { error: upsertError } = await supabaseAdmin
      .from('payment_provider_configs')
      .upsert(
        { barbershop_id: barbershopId, metadata },
        { onConflict: 'barbershop_id' },
      );

    if (upsertError) {
      console.error('Erro ao salvar tokens MP:', upsertError);
      return redirect('error', 'database_error');
    }

    console.log(`Tokens MP salvos com sucesso para barbershop_id=${barbershopId}`);
    return redirect('success');
  } catch (dbErr) {
    console.error('Erro inesperado no Supabase:', dbErr);
    return redirect('error', 'internal_error');
  }
});
