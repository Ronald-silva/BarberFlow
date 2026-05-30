-- Slots ocupados para booking público (anon): reservas + agendamentos + appointments.

CREATE OR REPLACE FUNCTION public.get_public_occupied_slots(
  p_barbershop_id UUID,
  p_day_start TIMESTAMPTZ,
  p_day_end TIMESTAMPTZ
)
RETURNS TABLE (
  horario_inicio TIMESTAMPTZ,
  horario_fim TIMESTAMPTZ,
  profissional_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.horario, r.horario_fim, r.profissional_id
  FROM reservas r
  WHERE r.barbearia_id = p_barbershop_id
    AND r.horario >= p_day_start
    AND r.horario <= p_day_end
    AND (
      r.status = 'pago'
      OR (r.status = 'aguardando_pagamento' AND r.expires_at > NOW())
    )

  UNION ALL

  SELECT a.horario, a.horario_fim, a.profissional_id
  FROM agendamentos a
  WHERE a.barbearia_id = p_barbershop_id
    AND a.horario >= p_day_start
    AND a.horario <= p_day_end

  UNION ALL

  SELECT ap.start_datetime, ap.end_datetime, ap.professional_id
  FROM appointments ap
  WHERE ap.barbershop_id = p_barbershop_id
    AND ap.start_datetime >= p_day_start
    AND ap.start_datetime <= p_day_end
    AND ap.status IN ('confirmed', 'pending');
$$;

REVOKE ALL ON FUNCTION public.get_public_occupied_slots(UUID, TIMESTAMPTZ, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_occupied_slots(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;
