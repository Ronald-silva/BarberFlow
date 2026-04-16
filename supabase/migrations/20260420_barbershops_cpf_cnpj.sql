-- Add cpf_cnpj column to barbershops table for Asaas customer creation
ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS cpf_cnpj text;
