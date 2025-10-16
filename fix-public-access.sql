-- Execute este script no SQL Editor do Supabase para permitir acesso público

-- Permitir leitura pública de barbearias
CREATE POLICY IF NOT EXISTS "Public can read barbershops" ON barbershops
  FOR SELECT USING (true);

-- Permitir leitura pública de serviços
CREATE POLICY IF NOT EXISTS "Public can read services" ON services
  FOR SELECT USING (true);

-- Permitir leitura pública de usuários (profissionais)
CREATE POLICY IF NOT EXISTS "Public can read users" ON users
  FOR SELECT USING (true);

-- Permitir inserção pública de clientes (para agendamentos)
CREATE POLICY IF NOT EXISTS "Public can create clients" ON clients
  FOR INSERT WITH CHECK (true);

-- Permitir inserção pública de agendamentos
CREATE POLICY IF NOT EXISTS "Public can create appointments" ON appointments
  FOR INSERT WITH CHECK (true);