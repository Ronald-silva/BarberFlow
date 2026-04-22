import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MP_API = 'https://api.mercadopago.com';

function extractMercadoPagoToken(
  providerMetadata: unknown,
): string | null {
  if (providerMetadata && typeof providerMetadata === 'object') {
    const token = (providerMetadata as Record<string, unknown>).mercadopago_access_token;
    if (typeof token === 'string' && token.trim().length > 0) return token.trim();
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      barbershop_id,
      appointment_id,
      amount,
      description,
      client_name,
      client_email,
      client_phone,
    } = body as {
      barbershop_id: string;
      appointment_id: string;
      amount: number;
      description?: string;
      client_name?: string;
      client_email?: string;
      client_phone?: string;
    };

    if (!barbershop_id || !appointment_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'barbershop_id, appointment_id e amount são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: appointment, error: appErr } = await supabaseAdmin
      .from('appointments')
      .select('id, barbershop_id, payment_status, total_amount')
      .eq('id', appointment_id)
      .single();

    if (appErr || !appointment) {
      return new Response(
        JSON.stringify({ error: 'Agendamento não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (appointment.barbershop_id !== barbershop_id) {
      return new Response(
        JSON.stringify({ error: 'Agendamento não pertence à barbearia informada' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (appointment.payment_status && appointment.payment_status !== 'pending_payment') {
      return new Response(
        JSON.stringify({ error: 'Agendamento não está aguardando pagamento' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (
      appointment.total_amount !== null &&
      appointment.total_amount !== undefined &&
      Math.abs(Number(appointment.total_amount) - Number(amount)) > 0.01
    ) {
      return new Response(
        JSON.stringify({ error: 'Valor diferente do total do agendamento' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Buscar metadados da barbearia para descrição (dados públicos).
    const { data: barbershop, error: bsErr } = await supabaseAdmin
      .from('barbershops')
      .select('name')
      .eq('id', barbershop_id)
      .single();

    if (bsErr || !barbershop) {
      return new Response(
        JSON.stringify({ error: 'Barbearia não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: providerCfg } = await supabaseAdmin
      .from('payment_provider_configs')
      .select('metadata')
      .eq('barbershop_id', barbershop_id)
      .maybeSingle();

    const accessToken = extractMercadoPagoToken(providerCfg?.metadata);

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Mercado Pago não configurado para esta barbearia' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const firstName = (client_name || 'Cliente').split(' ')[0];
    const lastName = (client_name || '').split(' ').slice(1).join(' ') || 'Barbearia';
    const email = client_email?.trim() ||
      `${(client_phone || '').replace(/\D/g, '') || 'cliente'}@barberflow.app`;

    const mpPayload = {
      transaction_amount: Number(Number(amount).toFixed(2)),
      description: description || `Agendamento - ${barbershop.name}`,
      payment_method_id: 'pix',
      payer: {
        email,
        first_name: firstName,
        last_name: lastName,
      },
      external_reference: `bf:${barbershop_id}:${appointment_id}`,
      date_of_expiration: expiresAt,
    };

    const mpRes = await fetch(`${MP_API}/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': `bf-pix-${appointment_id}`,
      },
      body: JSON.stringify(mpPayload),
    });

    const mpData = await mpRes.json() as {
      id?: number;
      status?: string;
      message?: string;
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
          ticket_url?: string;
        };
      };
    };

    if (!mpRes.ok || !mpData.id) {
      console.error('MP error:', JSON.stringify(mpData));
      return new Response(
        JSON.stringify({ error: mpData.message || 'Erro ao gerar PIX no Mercado Pago' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const txData = mpData.point_of_interaction?.transaction_data;
    const qrCode = txData?.qr_code ?? null;
    const qrCodeBase64 = txData?.qr_code_base64 ?? null;
    const ticketUrl = txData?.ticket_url ?? null;
    const paymentId = String(mpData.id);

    // Salvar dados MP no agendamento
    const { error: updateErr } = await supabaseAdmin
      .from('appointments')
      .update({
        mp_payment_id: paymentId,
        mp_qr_code: qrCode,
        mp_qr_code_base64: qrCodeBase64,
        mp_ticket_url: ticketUrl,
        payment_status: 'pending_payment',
        payment_method: 'pix',
      })
      .eq('id', appointment_id)
      .eq('barbershop_id', barbershop_id)
      .eq('payment_status', 'pending_payment');

    if (updateErr) {
      console.error('Erro ao atualizar appointment:', updateErr);
    }

    return new Response(
      JSON.stringify({
        payment_id: paymentId,
        qr_code: qrCode,
        qr_code_base64: qrCodeBase64,
        ticket_url: ticketUrl,
        status: mpData.status,
        expires_at: expiresAt,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Erro create-mercadopago-pix:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
