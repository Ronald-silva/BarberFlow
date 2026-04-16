-- Cadastro público: permitir criar barbearia sem sessão OU com sessão ainda sem perfil em public.users
-- (evita 403 quando o navegador ficou logado de outro fluxo de teste)
DROP POLICY IF EXISTS "barbershops_insert_public" ON public.barbershops;

CREATE POLICY "barbershops_insert_public"
  ON public.barbershops FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL
    OR is_platform_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid())
  );
