-- Move Mercado Pago access token from public.barbershops (publicly readable)
-- to payment_provider_configs.metadata (tenant-restricted via RLS).

INSERT INTO public.payment_provider_configs (barbershop_id, metadata)
SELECT
  b.id,
  jsonb_build_object('mercadopago_access_token', trim(b.mercadopago_access_token))
FROM public.barbershops b
WHERE COALESCE(trim(b.mercadopago_access_token), '') <> ''
ON CONFLICT (barbershop_id)
DO UPDATE SET
  metadata = COALESCE(public.payment_provider_configs.metadata, '{}'::jsonb)
    || jsonb_build_object('mercadopago_access_token', EXCLUDED.metadata->>'mercadopago_access_token'),
  updated_at = NOW();

UPDATE public.barbershops
SET mercadopago_access_token = NULL
WHERE COALESCE(trim(mercadopago_access_token), '') <> '';
