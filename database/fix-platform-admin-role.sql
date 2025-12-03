-- =====================================================
-- Fix: Permitir role 'platform_admin' na tabela users
-- =====================================================
-- Problema: A constraint users_role_check não permite 'platform_admin'
-- Solução: Remover e recriar a constraint com todos os roles válidos
-- =====================================================

-- EXECUTE ESTE SCRIPT COMPLETO NO SUPABASE SQL EDITOR

-- 1. Remover a constraint existente (se existir)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Adicionar nova constraint que permite todos os roles
ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('platform_admin', 'admin', 'member', 'professional', 'receptionist'));

-- 3. Atualizar o usuário para platform_admin
UPDATE users
SET
  role = 'platform_admin',
  barbershop_id = NULL,
  updated_at = NOW()
WHERE email = 'admin@barber.com';

-- 4. Verificar se funcionou
SELECT id, email, name, role, barbershop_id
FROM users
WHERE email = 'admin@barber.com';

-- =====================================================
-- Resultado Esperado:
-- role: 'platform_admin'
-- barbershop_id: NULL
-- =====================================================

-- Próximos passos:
-- 1. Limpar localStorage: localStorage.clear(); location.reload();
-- 2. Fazer login com: admin@barber.com / 123456
-- 3. Você será redirecionado para /platform ✅
