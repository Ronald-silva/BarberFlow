-- Expõe apenas um boolean público (sem token) para o booking saber se PIX está disponível.

DROP FUNCTION IF EXISTS public.get_public_barbershop_by_slug(TEXT);

CREATE FUNCTION public.get_public_barbershop_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  address TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  brand_primary_color TEXT,
  require_payment_before_booking BOOLEAN,
  working_hours JSONB,
  slot_interval_minutes INTEGER,
  mercadopago_configured BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id,
    b.name,
    b.slug,
    b.address,
    b.logo_url,
    b.phone,
    b.email,
    b.brand_primary_color,
    COALESCE(b.require_payment_before_booking, FALSE),
    b.working_hours,
    COALESCE(b.slot_interval_minutes, 30),
    EXISTS (
      SELECT 1
      FROM public.payment_provider_configs cfg
      WHERE cfg.barbershop_id = b.id
        AND COALESCE(cfg.metadata->>'mercadopago_access_token', '') <> ''
    )
  FROM public.barbershops b
  WHERE b.slug = p_slug
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_barbershop_by_slug(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_barbershop_by_slug(TEXT) TO anon, authenticated;
