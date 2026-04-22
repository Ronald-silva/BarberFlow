-- Public RPCs for booking pages (anon-safe, least-privilege).
-- Exposes only the minimum fields needed by /book/:slug.

CREATE OR REPLACE FUNCTION public.get_public_services_by_barbershop(p_barbershop_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  duration INTEGER,
  barbershop_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.name,
    s.price,
    s.duration,
    s.barbershop_id
  FROM public.services s
  WHERE s.barbershop_id = p_barbershop_id
  ORDER BY s.name ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_public_professionals_by_barbershop(p_barbershop_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  barbershop_id UUID,
  role TEXT,
  work_hours JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    u.name,
    u.barbershop_id,
    u.role::TEXT,
    u.work_hours::JSONB
  FROM public.users u
  WHERE u.barbershop_id = p_barbershop_id
    AND u.role IN ('admin', 'member')
  ORDER BY u.name ASC;
$$;

REVOKE ALL ON FUNCTION public.get_public_services_by_barbershop(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_professionals_by_barbershop(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_services_by_barbershop(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_professionals_by_barbershop(UUID) TO anon, authenticated;
