/**
 * create-pay-at-shop-booking
 *
 * Confirma agendamento "pagar na barbearia" com validação server-side:
 * preço/duração dos serviços, anti-overbooking (reservas + agendamentos + appointments).
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Helpers inlined para deploy pelo Dashboard (editor aceita só index.ts).
const CLEANUP_MINUTES = 5;

type ServiceRow = {
  id: string;
  price: number;
  duration: number;
  barbershop_id: string;
};

type OccupiedRange = {
  start: Date;
  end: Date;
  professionalId: string | null;
};

function horarioFimFromStart(horarioInicio: Date, durationMinutes: number): Date {
  return new Date(horarioInicio.getTime() + durationMinutes * 60 * 1000);
}

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function professionalConflict(slotProfId: string | null, occProfId: string | null): boolean {
  if (!slotProfId || !occProfId) return true;
  return slotProfId === occProfId;
}

function hasSlotConflict(
  slotStart: Date,
  slotEnd: Date,
  professionalId: string | null,
  occupied: OccupiedRange[],
): boolean {
  return occupied.some(
    (occ) =>
      rangesOverlap(slotStart, slotEnd, occ.start, occ.end) &&
      professionalConflict(professionalId, occ.professionalId),
  );
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchOccupied(
  supabase: ReturnType<typeof createClient>,
  barbeariaId: string,
  dayStart: string,
  dayEnd: string,
): Promise<OccupiedRange[]> {
  const { data, error } = await supabase.rpc('get_public_occupied_slots', {
    p_barbershop_id: barbeariaId,
    p_day_start: dayStart,
    p_day_end: dayEnd,
  });

  if (error) {
    console.error('get_public_occupied_slots:', error);
    return [];
  }

  return (data ?? []).map((row: {
    horario_inicio: string;
    horario_fim: string;
    profissional_id: string | null;
  }) => ({
    start: new Date(row.horario_inicio),
    end: new Date(row.horario_fim),
    professionalId: row.profissional_id,
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as {
      barbearia_id: string;
      profissional_id: string;
      servico_ids: string[];
      horario: string;
      cliente_nome: string;
      cliente_whatsapp: string;
    };

    const {
      barbearia_id,
      profissional_id,
      servico_ids = [],
      horario,
      cliente_nome,
      cliente_whatsapp,
    } = body;

    if (
      !barbearia_id ||
      !profissional_id ||
      !horario ||
      !cliente_nome?.trim() ||
      !cliente_whatsapp?.trim() ||
      servico_ids.length === 0
    ) {
      return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios ausentes' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const [{ data: barbearia }, { data: profissional }] = await Promise.all([
      supabase
        .from('barbershops')
        .select('id, require_payment_before_booking')
        .eq('id', barbearia_id)
        .maybeSingle(),
      supabase
        .from('users')
        .select('id, barbershop_id')
        .eq('id', profissional_id)
        .maybeSingle(),
    ]);

    if (!barbearia) {
      return new Response(JSON.stringify({ error: 'Barbearia não encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!profissional || profissional.barbershop_id !== barbearia_id) {
      return new Response(JSON.stringify({ error: 'Profissional inválido para esta barbearia' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: servicesRaw } = await supabase
      .from('services')
      .select('id, price, duration, barbershop_id')
      .eq('barbershop_id', barbearia_id)
      .in('id', servico_ids);

    const services = (servicesRaw ?? []) as ServiceRow[];
    if (services.length !== servico_ids.length) {
      return new Response(JSON.stringify({ error: 'Serviços inválidos para esta barbearia' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const valor = Number(services.reduce((acc, s) => acc + Number(s.price), 0).toFixed(2));
    const durationMinutes =
      services.reduce((acc, s) => acc + Number(s.duration), 0) + CLEANUP_MINUTES;
    const horarioInicio = new Date(horario);
    if (Number.isNaN(horarioInicio.getTime())) {
      return new Response(JSON.stringify({ error: 'Horário inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const horarioFim = horarioFimFromStart(horarioInicio, durationMinutes);
    const dayStart = new Date(horarioInicio);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(horarioInicio);
    dayEnd.setHours(23, 59, 59, 999);

    const occupied = await fetchOccupied(
      supabase,
      barbearia_id,
      dayStart.toISOString(),
      dayEnd.toISOString(),
    );

    if (hasSlotConflict(horarioInicio, horarioFim, profissional_id, occupied)) {
      return new Response(
        JSON.stringify({ error: 'Horário não disponível', detail: 'Este horário já foi reservado.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const whatsapp = cliente_whatsapp.replace(/\D/g, '');
    let clientId: string;

    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('barbershop_id', barbearia_id)
      .eq('whatsapp', whatsapp)
      .maybeSingle();

    if (existingClient?.id) {
      clientId = existingClient.id;
      await supabase
        .from('clients')
        .update({ last_visit: new Date().toISOString(), name: cliente_nome.trim() })
        .eq('id', clientId);
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients')
        .insert({
          name: cliente_nome.trim(),
          whatsapp,
          barbershop_id: barbearia_id,
          last_visit: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (clientErr || !newClient) {
        console.error('Erro ao criar cliente:', clientErr);
        return new Response(JSON.stringify({ error: 'Erro ao registrar cliente' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      clientId = newClient.id;
    }

    const { data: appointment, error: appErr } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        professional_id: profissional_id,
        barbershop_id: barbearia_id,
        service_ids: servico_ids,
        start_datetime: horarioInicio.toISOString(),
        end_datetime: horarioFim.toISOString(),
        status: 'confirmed',
        total_amount: valor,
        payment_method: 'pay_at_shop',
        payment_status: 'pay_at_shop',
      })
      .select('id, start_datetime, end_datetime')
      .single();

    if (appErr) {
      console.error('Erro ao criar appointment:', appErr);
      return new Response(JSON.stringify({ error: 'Erro ao confirmar agendamento' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        appointment_id: appointment?.id,
        start_datetime: appointment?.start_datetime,
        end_datetime: appointment?.end_datetime,
        valor,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Erro create-pay-at-shop-booking:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
