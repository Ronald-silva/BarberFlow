-- Restrict direct table reads on barbershops and expose controlled public access via RPC.

CREATE OR REPLACE FUNCTION public.get_public_barbershop_by_slug(p_slug TEXT)
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
  working_hours JSONB
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
    b.working_hours
  FROM public.barbershops b
  WHERE b.slug = p_slug
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_barbershop_slug_available(p_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.barbershops b
    WHERE b.slug = p_slug
  );
$$;

REVOKE ALL ON FUNCTION public.get_public_barbershop_by_slug(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_barbershop_slug_available(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_barbershop_by_slug(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_barbershop_slug_available(TEXT) TO anon, authenticated;

DROP POLICY IF EXISTS "barbershops_select_public" ON public.barbershops;
DROP POLICY IF EXISTS "barbershops_select_member_or_platform" ON public.barbershops;
CREATE POLICY "barbershops_select_member_or_platform"
  ON public.barbershops FOR SELECT
  USING (is_barbershop_member(id) OR is_platform_admin());
