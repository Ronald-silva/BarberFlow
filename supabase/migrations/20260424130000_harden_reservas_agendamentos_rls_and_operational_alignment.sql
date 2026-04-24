-- Harden RLS for reservas/agendamentos and align operational model.
-- Goal: remove permissive cross-tenant reads and keep service_role automation.

ALTER TABLE IF EXISTS public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Remove permissive legacy policies.
DROP POLICY IF EXISTS "anon_insert_reservas" ON public.reservas;
DROP POLICY IF EXISTS "anon_select_reservas" ON public.reservas;
DROP POLICY IF EXISTS "auth_select_reservas" ON public.reservas;
DROP POLICY IF EXISTS "auth_select_agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "reservas_member_all" ON public.reservas;
DROP POLICY IF EXISTS "agendamentos_member_select" ON public.agendamentos;

-- Keep automation unrestricted only for service role (Edge Functions).
DROP POLICY IF EXISTS "service_all_reservas" ON public.reservas;
CREATE POLICY "service_all_reservas"
  ON public.reservas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_all_agendamentos" ON public.agendamentos;
CREATE POLICY "service_all_agendamentos"
  ON public.agendamentos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can only read tenant data they belong to.
CREATE POLICY "reservas_select_member_or_platform"
  ON public.reservas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.barbershop_id = reservas.barbearia_id
    )
    OR is_platform_admin()
  );

CREATE POLICY "agendamentos_select_member_or_platform"
  ON public.agendamentos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.barbershop_id = agendamentos.barbearia_id
    )
    OR is_platform_admin()
  );
