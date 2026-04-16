-- Cadastro público: após signUp o usuário autenticado precisa inserir a própria linha em public.users.
-- A política antiga só permitia INSERT com auth.uid() IS NULL ou admin — quebrava o fluxo pós-signUp.
DROP POLICY IF EXISTS "users_insert_registration_or_admin" ON public.users;

CREATE POLICY "users_insert_registration_or_admin"
  ON public.users FOR INSERT
  WITH CHECK (
    id = auth.uid()
    OR is_barbershop_admin(barbershop_id)
    OR is_platform_admin()
  );
