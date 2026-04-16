-- Barbearias: telefone e endereço (cadastro público)
-- Corrige: "Could not find the 'phone' column of 'barbershops' in the schema cache"
ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS address text;

COMMENT ON COLUMN public.barbershops.phone IS 'Telefone de contato da barbearia';
COMMENT ON COLUMN public.barbershops.address IS 'Endereço da barbearia';
