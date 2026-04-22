-- Suporte ao Mercado Pago por barbearia (payment-first flow)

ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS mercadopago_access_token TEXT,
  ADD COLUMN IF NOT EXISTS require_payment_before_booking BOOLEAN DEFAULT FALSE;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS mp_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS mp_qr_code TEXT,
  ADD COLUMN IF NOT EXISTS mp_qr_code_base64 TEXT,
  ADD COLUMN IF NOT EXISTS mp_ticket_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

CREATE INDEX IF NOT EXISTS idx_appointments_mp_payment_id
  ON public.appointments (mp_payment_id)
  WHERE mp_payment_id IS NOT NULL;
