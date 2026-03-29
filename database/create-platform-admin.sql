-- =====================================================
-- CRIAR SUPER ADMIN (ADMINISTRADOR DA PLATAFORMA)
-- =====================================================
-- Este script cria um usuário super admin que tem acesso
-- a TODAS as barbearias da plataforma
-- =====================================================

-- OPÇÃO 1: Tornar um usuário existente em super admin
-- Email: contatoshafar@gmail.com

UPDATE users
SET
  is_platform_admin = TRUE,
  role = 'platform_admin'  -- IMPORTANTE: atualizar role também
WHERE email = 'contatoshafar@gmail.com';

-- OPÇÃO 2: Criar um novo super admin do zero
-- (Descomente e use se preferir criar uma nova conta)

/*
-- Primeiro, crie a conta no Supabase Auth em:
-- https://app.supabase.com/project/jrggwhlbvsyvcqvywrmy/auth/users
-- Clique em "Add user" e preencha:
--   Email: admin@shafar.com
--   Password: SuaSenhaSuperSegura123!
--   Confirm email: Yes

-- Depois execute este SQL:
INSERT INTO users (
  id,
  email,
  name,
  role,
  is_platform_admin,
  barbershop_id
) VALUES (
  'cole-aqui-o-uuid-do-usuario-criado-no-auth',
  'admin@shafar.com',
  'Super Admin',
  'platform_admin',
  TRUE,
  NULL  -- Super admin não pertence a nenhuma barbearia específica
);
*/

-- Verificar super admins criados
SELECT
  id,
  email,
  name,
  is_platform_admin,
  role,
  created_at
FROM users
WHERE is_platform_admin = TRUE;
