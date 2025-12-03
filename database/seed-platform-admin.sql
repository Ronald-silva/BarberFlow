-- =====================================================
-- Seed Script: Platform Administrator
-- =====================================================
-- Este script cria o usuário administrador da plataforma BarberFlow
-- Você (dono do SaaS) usará este usuário para gerenciar todas as barbearias

-- =====================================================
-- 1. Criar Platform Administrator
-- =====================================================

-- IMPORTANTE: A tabela users está vinculada a auth.users
-- Precisamos primeiro criar o usuário no Supabase Auth, mas para simplificar
-- vamos fazer um INSERT direto (funciona se você desabilitar temporariamente a FK)

INSERT INTO users (
  id,
  email,
  name,
  role,
  barbershop_id,
  work_hours,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),                       -- UUID gerado automaticamente
  'platform@barberflow.com',               -- Email do admin
  'Platform Administrator',                -- Nome do admin
  'platform_admin',                        -- Role especial
  NULL,                                    -- Não pertence a nenhuma barbearia
  '[]'::jsonb,                            -- Sem horário de trabalho
  NOW(),                                   -- Data de criação
  NOW()                                    -- Data de atualização
)
ON CONFLICT (email)
DO UPDATE SET
  role = 'platform_admin',
  barbershop_id = NULL,
  updated_at = NOW();

-- =====================================================
-- 2. Verificar se foi criado
-- =====================================================

SELECT
  id,
  email,
  name,
  role,
  barbershop_id,
  phone,
  created_at
FROM users
WHERE role = 'platform_admin'
ORDER BY created_at DESC;

-- =====================================================
-- 3. (Opcional) Atualizar usuário existente
-- =====================================================
-- Se você já tem um usuário (ex: admin@barber.com) e quer transformá-lo em platform_admin:

UPDATE users
SET
  role = 'platform_admin',
  barbershop_id = NULL,  -- Platform admin não pertence a uma barbearia específica
  updated_at = NOW()
WHERE email = 'admin@barber.com';

SELECT id, email, name, role, barbershop_id FROM users WHERE email = 'admin@barber.com';

-- =====================================================
-- 4. Resultado Esperado
-- =====================================================
-- Você deve ver uma linha com:
-- - role: 'platform_admin'
-- - barbershop_id: NULL
-- - email: 'platform@barberflow.com'
--
-- Agora você pode fazer login com:
--   Email: platform@barberflow.com
--   Senha: (qualquer senha, não está validando ainda)
--
-- Após o login, você será redirecionado para /platform

-- =====================================================
-- 5. (Opcional) Row Level Security Policies
-- =====================================================
-- Adicione políticas RLS para platform admin ver TODAS as barbearias:

-- Platform admins podem ver todas as barbearias
CREATE POLICY IF NOT EXISTS "Platform admins can view all barbershops"
  ON barbershops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'platform_admin'
    )
  );

-- Platform admins podem ver todos os usuários
CREATE POLICY IF NOT EXISTS "Platform admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'platform_admin'
    )
  );

-- Platform admins podem ver todas as assinaturas
CREATE POLICY IF NOT EXISTS "Platform admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'platform_admin'
    )
  );

-- Platform admins podem ver todos os agendamentos
CREATE POLICY IF NOT EXISTS "Platform admins can view all appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'platform_admin'
    )
  );

-- =====================================================
-- Notas Importantes
-- =====================================================
-- 1. SEGURANÇA: Por enquanto não estamos validando senha
--    Para produção, você DEVE implementar Supabase Auth real
--
-- 2. SEPARAÇÃO: Platform Admin NÃO deve ter barbershop_id
--    Isso mantém separação clara entre você (dono) e barbershops
--
-- 3. ROLE: Use exatamente 'platform_admin' (com underscore)
--    O App.tsx verifica: user.role === 'platform_admin'
--
-- 4. TESTE: Após executar, limpe o localStorage e faça login:
--    localStorage.clear();
--    location.reload();
