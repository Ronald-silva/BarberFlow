-- Adiciona a coluna para armazenar o ID do cliente do Stripe na tabela de barbearias

ALTER TABLE public.barbershops
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Habilita RLS para a nova coluna (se já não estiver)
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;

