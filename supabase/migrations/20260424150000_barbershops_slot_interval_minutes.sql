-- Add configurable slot interval to barbershops.
-- Barbershop owners can set the booking time-slot granularity (in minutes) from their settings.

ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS slot_interval_minutes INTEGER NOT NULL DEFAULT 30;

-- Update the public RPC so the booking page can read this value without auth.
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
  slot_interval_minutes INTEGER
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
    COALESCE(b.slot_interval_minutes, 30)
  FROM public.barbershops b
  WHERE b.slug = p_slug
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_barbershop_by_slug(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_barbershop_by_slug(TEXT) TO anon, authenticated;
