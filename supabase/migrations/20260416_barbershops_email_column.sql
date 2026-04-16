-- Barbearias: email de contato (cadastro público / notificações)
-- Corrige: "Could not find the 'email' column of 'barbershops' in the schema cache"
ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN public.barbershops.email IS 'Email de contato público da barbearia';
