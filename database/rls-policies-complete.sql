-- ============================================
-- Shafar - COMPLETE RLS POLICIES
-- ============================================
-- Execute este script APÓS criar todas as tabelas
-- Este script consolida e corrige todas as políticas RLS
-- Versão: 3.0 - Completo e testado
-- ============================================

-- Limpar políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Public can read barbershops" ON barbershops;
DROP POLICY IF EXISTS "Admins can manage their barbershop" ON barbershops;
DROP POLICY IF EXISTS "Platform admins can view all barbershops" ON barbershops;
DROP POLICY IF EXISTS "Barbershop admins can view their barbershop" ON barbershops;
DROP POLICY IF EXISTS "Public can create barbershops" ON barbershops;
DROP POLICY IF EXISTS "Barbershop admins can update their barbershop" ON barbershops;
DROP POLICY IF EXISTS "Platform admins can delete barbershops" ON barbershops;

DROP POLICY IF EXISTS "Users can read same barbershop users" ON users;
DROP POLICY IF EXISTS "Admins can manage barbershop users" ON users;
DROP POLICY IF EXISTS "Users can update themselves" ON users;
DROP POLICY IF EXISTS "Users can view their profile" ON users;
DROP POLICY IF EXISTS "Users can view colleagues" ON users;
DROP POLICY IF EXISTS "Platform admins can view all users" ON users;
DROP POLICY IF EXISTS "Restrict user creation" ON users;
DROP POLICY IF EXISTS "Only admins can change roles" ON users;
DROP POLICY IF EXISTS "Barbershop admins can create users" ON users;
DROP POLICY IF EXISTS "Barbershop admins can delete users" ON users;

DROP POLICY IF EXISTS "Public can read services" ON services;
DROP POLICY IF EXISTS "Users can manage barbershop services" ON services;
DROP POLICY IF EXISTS "Users can view services in their barbershop" ON services;
DROP POLICY IF EXISTS "Admins can insert services" ON services;
DROP POLICY IF EXISTS "Users can view barbershop services" ON services;
DROP POLICY IF EXISTS "Admins can update services" ON services;
DROP POLICY IF EXISTS "Admins can delete services" ON services;

DROP POLICY IF EXISTS "Users can read barbershop clients" ON clients;
DROP POLICY IF EXISTS "Users can manage barbershop clients" ON clients;
DROP POLICY IF EXISTS "Public can create clients" ON clients;
DROP POLICY IF EXISTS "Users can view clients in their barbershop" ON clients;
DROP POLICY IF EXISTS "Users can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update clients" ON clients;
DROP POLICY IF EXISTS "Users can delete clients" ON clients;

DROP POLICY IF EXISTS "Users can read barbershop appointments" ON appointments;
DROP POLICY IF EXISTS "Users can manage barbershop appointments" ON appointments;
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can view appointments in their barbershop" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete appointments" ON appointments;

DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
DROP POLICY IF EXISTS "Platform admins can manage plans" ON plans;

DROP POLICY IF EXISTS "Users can view their barbershop subscription" ON subscriptions;
DROP POLICY IF EXISTS "Platform admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Platform admins can manage subscriptions" ON subscriptions;

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para verificar se o usuário é admin da barbearia
CREATE OR REPLACE FUNCTION is_barbershop_admin(barbershop_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE barbershop_id = barbershop_uuid
    AND id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário pertence à barbearia
CREATE OR REPLACE FUNCTION is_barbershop_member(barbershop_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE barbershop_id = barbershop_uuid
    AND id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'platform_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o barbershop_id do usuário autenticado
CREATE OR REPLACE FUNCTION current_user_barbershop_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT barbershop_id FROM users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLÍTICAS PARA BARBERSHOPS
-- ============================================

-- SELECT: Leitura pública de barbearias (para landing page e agendamento público)
CREATE POLICY "barbershops_select_public"
  ON barbershops FOR SELECT
  USING (true);

-- INSERT: Permitir criação pública (para cadastro de novas barbearias)
-- Durante o registro inicial, auth.uid() é NULL, então permitimos
CREATE POLICY "barbershops_insert_public"
  ON barbershops FOR INSERT
  WITH CHECK (
    -- Permitir durante registro (sem autenticação)
    auth.uid() IS NULL OR
    -- Ou por platform admins
    is_platform_admin()
  );

-- UPDATE: Apenas admins da própria barbearia ou platform admins
CREATE POLICY "barbershops_update_admin"
  ON barbershops FOR UPDATE
  USING (
    is_barbershop_admin(id) OR is_platform_admin()
  )
  WITH CHECK (
    is_barbershop_admin(id) OR is_platform_admin()
  );

-- DELETE: Apenas platform admins
CREATE POLICY "barbershops_delete_platform_admin"
  ON barbershops FOR DELETE
  USING (is_platform_admin());

-- ============================================
-- POLÍTICAS PARA USERS
-- ============================================

-- SELECT: Usuários podem ver colegas da mesma barbearia
CREATE POLICY "users_select_same_barbershop"
  ON users FOR SELECT
  USING (
    -- Ver a si mesmo
    id = auth.uid() OR
    -- Ver colegas da mesma barbearia
    barbershop_id = current_user_barbershop_id() OR
    -- Platform admins veem todos
    is_platform_admin()
  );

-- INSERT: Criação durante registro ou por admins
CREATE POLICY "users_insert_registration_or_admin"
  ON users FOR INSERT
  WITH CHECK (
    -- Permitir durante registro inicial (quando auth.uid() é NULL)
    auth.uid() IS NULL OR
    -- Ou quando um admin está criando um membro da sua equipe
    is_barbershop_admin(barbershop_id) OR
    -- Ou platform admin
    is_platform_admin()
  );

-- UPDATE: Usuários podem atualizar a si mesmos, admins podem atualizar equipe
CREATE POLICY "users_update_self_or_admin"
  ON users FOR UPDATE
  USING (
    id = auth.uid() OR
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  )
  WITH CHECK (
    id = auth.uid() OR
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

-- DELETE: Apenas admins podem remover membros da equipe
CREATE POLICY "users_delete_admin"
  ON users FOR DELETE
  USING (
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

-- ============================================
-- POLÍTICAS PARA SERVICES
-- ============================================

-- SELECT: Leitura pública (para página de agendamento)
CREATE POLICY "services_select_public"
  ON services FOR SELECT
  USING (true);

-- INSERT: Apenas membros da barbearia
CREATE POLICY "services_insert_barbershop_member"
  ON services FOR INSERT
  WITH CHECK (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

-- UPDATE: Apenas membros da barbearia
CREATE POLICY "services_update_barbershop_member"
  ON services FOR UPDATE
  USING (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  )
  WITH CHECK (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

-- DELETE: Apenas admins da barbearia
CREATE POLICY "services_delete_admin"
  ON services FOR DELETE
  USING (
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

-- ============================================
-- POLÍTICAS PARA CLIENTS
-- ============================================

-- SELECT: Apenas membros da barbearia veem os clientes
CREATE POLICY "clients_select_barbershop_member"
  ON clients FOR SELECT
  USING (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

-- INSERT: Membros da barbearia + criação pública (agendamento online)
CREATE POLICY "clients_insert_barbershop_or_public"
  ON clients FOR INSERT
  WITH CHECK (
    -- Permitir criação pública para agendamentos online
    auth.uid() IS NULL OR
    -- Ou por membros da barbearia
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

-- UPDATE: Apenas membros da barbearia
CREATE POLICY "clients_update_barbershop_member"
  ON clients FOR UPDATE
  USING (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  )
  WITH CHECK (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

-- DELETE: Apenas admins da barbearia
CREATE POLICY "clients_delete_admin"
  ON clients FOR DELETE
  USING (
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

-- ============================================
-- POLÍTICAS PARA APPOINTMENTS
-- ============================================

-- SELECT: Apenas membros da barbearia veem os agendamentos
CREATE POLICY "appointments_select_barbershop_member"
  ON appointments FOR SELECT
  USING (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

-- INSERT: Membros da barbearia + criação pública (agendamento online)
CREATE POLICY "appointments_insert_barbershop_or_public"
  ON appointments FOR INSERT
  WITH CHECK (
    -- Permitir criação pública para agendamentos online
    auth.uid() IS NULL OR
    -- Ou por membros da barbearia
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

-- UPDATE: Apenas membros da barbearia
CREATE POLICY "appointments_update_barbershop_member"
  ON appointments FOR UPDATE
  USING (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  )
  WITH CHECK (
    is_barbershop_member(barbershop_id) OR
    is_platform_admin()
  );

-- DELETE: Apenas admins da barbearia
CREATE POLICY "appointments_delete_admin"
  ON appointments FOR DELETE
  USING (
    is_barbershop_admin(barbershop_id) OR
    is_platform_admin()
  );

-- ============================================
-- POLÍTICAS PARA PLANS (Planos de Assinatura)
-- ============================================

-- SELECT: Todos podem ver planos ativos
CREATE POLICY "plans_select_active"
  ON plans FOR SELECT
  USING (active = true OR is_platform_admin());

-- INSERT/UPDATE/DELETE: Apenas platform admins
CREATE POLICY "plans_modify_platform_admin"
  ON plans FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- ============================================
-- POLÍTICAS PARA SUBSCRIPTIONS
-- ============================================

-- SELECT: Usuários veem a assinatura da própria barbearia
CREATE POLICY "subscriptions_select_own_barbershop"
  ON subscriptions FOR SELECT
  USING (
    barbershop_id = current_user_barbershop_id() OR
    is_platform_admin()
  );

-- INSERT/UPDATE/DELETE: Apenas platform admins (assinaturas são gerenciadas via Stripe)
CREATE POLICY "subscriptions_modify_platform_admin"
  ON subscriptions FOR ALL
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- ============================================
-- TRIGGERS DE PROTEÇÃO ADICIONAL
-- ============================================

-- Função para prevenir que usuários comuns mudem role ou barbershop_id
CREATE OR REPLACE FUNCTION prevent_unauthorized_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Se não há usuário autenticado, permitir (para registro inicial)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Platform admins podem fazer qualquer coisa
  IF is_platform_admin() THEN
    RETURN NEW;
  END IF;

  -- Admins da barbearia podem fazer qualquer coisa
  IF is_barbershop_admin(OLD.barbershop_id) THEN
    RETURN NEW;
  END IF;

  -- Se o usuário está atualizando a si mesmo
  IF OLD.id = auth.uid() THEN
    -- Não pode mudar role
    IF OLD.role != NEW.role THEN
      RAISE EXCEPTION 'Apenas administradores podem alterar roles de usuários';
    END IF;

    -- Não pode mudar barbershop_id
    IF OLD.barbershop_id != NEW.barbershop_id THEN
      RAISE EXCEPTION 'Apenas administradores podem transferir usuários entre barbearias';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para proteger alterações não autorizadas na tabela users
DROP TRIGGER IF EXISTS protect_user_changes ON users;
CREATE TRIGGER protect_user_changes
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_unauthorized_user_changes();

COMMENT ON FUNCTION prevent_unauthorized_user_changes() IS
  'Previne que usuários comuns mudem seu próprio role ou barbershop_id';

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON POLICY "barbershops_select_public" ON barbershops IS
  'Permite leitura pública para landing page e agendamento online';

COMMENT ON POLICY "barbershops_insert_public" ON barbershops IS
  'Permite cadastro público de novas barbearias e criação por platform admins';

COMMENT ON POLICY "users_insert_registration_or_admin" ON users IS
  'Permite criação de usuários durante registro inicial ou por admins da equipe';

COMMENT ON POLICY "clients_insert_barbershop_or_public" ON clients IS
  'Permite criação pública de clientes para agendamentos online';

COMMENT ON POLICY "appointments_insert_barbershop_or_public" ON appointments IS
  'Permite agendamentos públicos e por membros da equipe';

COMMENT ON FUNCTION is_barbershop_admin(UUID) IS
  'Verifica se o usuário autenticado é admin da barbearia especificada';

COMMENT ON FUNCTION is_barbershop_member(UUID) IS
  'Verifica se o usuário autenticado pertence à barbearia especificada';

COMMENT ON FUNCTION is_platform_admin() IS
  'Verifica se o usuário autenticado é admin da plataforma (SaaS)';

COMMENT ON FUNCTION current_user_barbershop_id() IS
  'Retorna o barbershop_id do usuário autenticado';

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Listar todas as políticas criadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('barbershops', 'users', 'services', 'clients', 'appointments', 'plans', 'subscriptions')
ORDER BY tablename, policyname;

-- ============================================
-- SCRIPT CONCLUÍDO
-- ============================================
-- Todas as políticas RLS foram configuradas com sucesso!
--
-- Próximos passos:
-- 1. Execute o script de testes (rls-tests.sql) para validar isolamento
-- 2. Verifique se não há erros de permissão no console
-- 3. Teste login e operações CRUD em ambiente de desenvolvimento
-- ============================================
