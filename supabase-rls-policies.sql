-- BarberFlow Row Level Security Policies
-- Execute este script após criar as tabelas para configurar as políticas de segurança

-- Habilitar RLS em todas as tabelas
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS PARA BARBERSHOPS
-- ========================================

-- Permitir leitura pública de barbearias (para página de agendamento)
CREATE POLICY "Public can read barbershops" ON barbershops
  FOR SELECT USING (true);

-- Admins podem fazer tudo na sua barbearia
CREATE POLICY "Admins can manage their barbershop" ON barbershops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.barbershop_id = barbershops.id 
      AND users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- ========================================
-- POLÍTICAS PARA USERS
-- ========================================

-- Usuários podem ver outros usuários da mesma barbearia
CREATE POLICY "Users can read same barbershop users" ON users
  FOR SELECT USING (
    barbershop_id IN (
      SELECT barbershop_id FROM users WHERE id = auth.uid()
    )
  );

-- Admins podem gerenciar usuários da sua barbearia
CREATE POLICY "Admins can manage barbershop users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.barbershop_id = users.barbershop_id
      AND admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
    )
  );

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update themselves" ON users
  FOR UPDATE USING (id = auth.uid());

-- ========================================
-- POLÍTICAS PARA SERVICES
-- ========================================

-- Leitura pública de serviços (para página de agendamento)
CREATE POLICY "Public can read services" ON services
  FOR SELECT USING (true);

-- Usuários podem gerenciar serviços da sua barbearia
CREATE POLICY "Users can manage barbershop services" ON services
  FOR ALL USING (
    barbershop_id IN (
      SELECT barbershop_id FROM users WHERE id = auth.uid()
    )
  );

-- ========================================
-- POLÍTICAS PARA CLIENTS
-- ========================================

-- Usuários podem ver clientes da sua barbearia
CREATE POLICY "Users can read barbershop clients" ON clients
  FOR SELECT USING (
    barbershop_id IN (
      SELECT barbershop_id FROM users WHERE id = auth.uid()
    )
  );

-- Usuários podem gerenciar clientes da sua barbearia
CREATE POLICY "Users can manage barbershop clients" ON clients
  FOR ALL USING (
    barbershop_id IN (
      SELECT barbershop_id FROM users WHERE id = auth.uid()
    )
  );

-- Permitir inserção pública de clientes (para agendamentos online)
CREATE POLICY "Public can create clients" ON clients
  FOR INSERT WITH CHECK (true);

-- ========================================
-- POLÍTICAS PARA APPOINTMENTS
-- ========================================

-- Usuários podem ver agendamentos da sua barbearia
CREATE POLICY "Users can read barbershop appointments" ON appointments
  FOR SELECT USING (
    barbershop_id IN (
      SELECT barbershop_id FROM users WHERE id = auth.uid()
    )
  );

-- Usuários podem gerenciar agendamentos da sua barbearia
CREATE POLICY "Users can manage barbershop appointments" ON appointments
  FOR ALL USING (
    barbershop_id IN (
      SELECT barbershop_id FROM users WHERE id = auth.uid()
    )
  );

-- Permitir inserção pública de agendamentos (para agendamentos online)
CREATE POLICY "Public can create appointments" ON appointments
  FOR INSERT WITH CHECK (true);

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para verificar se o usuário é admin da barbearia
CREATE OR REPLACE FUNCTION is_barbershop_admin(barbershop_uuid UUID)
RETURNS BOOLEAN AS $
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE barbershop_id = barbershop_uuid 
    AND id = auth.uid() 
    AND role = 'admin'
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário pertence à barbearia
CREATE OR REPLACE FUNCTION is_barbershop_member(barbershop_uuid UUID)
RETURNS BOOLEAN AS $
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE barbershop_id = barbershop_uuid 
    AND id = auth.uid()
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- POLÍTICAS ADICIONAIS DE SEGURANÇA
-- ========================================

-- Garantir que usuários só podem ser criados por admins ou durante o registro
CREATE POLICY "Restrict user creation" ON users
  FOR INSERT WITH CHECK (
    -- Permitir durante registro inicial (quando não há auth.uid())
    auth.uid() IS NULL OR
    -- Ou quando um admin está criando
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
      AND admin_user.barbershop_id = users.barbershop_id
    )
  );

-- Garantir que apenas admins podem alterar roles
CREATE POLICY "Only admins can change roles" ON users
  FOR UPDATE USING (
    -- Se não está mudando o role, permitir
    (OLD.role = NEW.role) OR
    -- Se está mudando, verificar se é admin
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.barbershop_id = users.barbershop_id
      AND admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
    )
  );