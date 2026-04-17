-- Colunas usadas pelo fluxo de agendamento + PIX (createAppointment / webhook).
-- Seguro em ambientes que já possuem as colunas.

ALTER TABLE IF EXISTS public.appointments
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS payment_status TEXT,
  ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT FALSE;
