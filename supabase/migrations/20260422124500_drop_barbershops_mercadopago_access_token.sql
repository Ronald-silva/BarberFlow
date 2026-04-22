-- Drop legacy Mercado Pago token column after migration to payment_provider_configs.metadata.
ALTER TABLE public.barbershops
  DROP COLUMN IF EXISTS mercadopago_access_token;
