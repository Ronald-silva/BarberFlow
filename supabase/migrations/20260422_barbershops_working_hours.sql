-- Horários de funcionamento por barbearia com suporte a múltiplos intervalos por dia.
-- Formato JSONB: [{ day: 0-6, enabled: bool, intervals: [{ start: "HH:MM", end: "HH:MM" }] }]

ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS working_hours JSONB;
