-- ============================================
-- CRIAR USUÁRIO ADMINISTRADOR MANUALMENTE
-- ============================================
-- Execute este script no Supabase SQL Editor
-- depois configure a senha no Auth

-- 1. Primeiro, crie o usuário no Supabase Auth via Dashboard:
--    https://app.supabase.com
--    Authentication → Users → Add User
--    Email: admin@barber.com
--    Password: 123456
--    Confirm Password: 123456
--    [X] Auto Confirm User (marque esta opção!)

-- 2. Copie o UUID gerado do usuário (você vai precisar)

-- 3. Crie uma barbearia de teste (se ainda não tiver):
INSERT INTO barbershops (name, slug, email, phone, address)
VALUES (
  'Barbearia Admin',
  'admin-barber',
  'contato@adminbarber.com',
  '(11) 99999-9999',
  'Rua Teste, 123'
)
RETURNING id;

-- 4. Copie o ID da barbearia retornado acima

-- 5. Crie o registro do usuário na tabela users:
-- IMPORTANTE: Substitua os valores abaixo:
--   - 'SEU_UUID_AQUI' pelo UUID do usuário criado no passo 1
--   - 'SEU_BARBERSHOP_ID_AQUI' pelo ID da barbearia do passo 3

INSERT INTO users (
  id,
  email,
  name,
  barbershop_id,
  role,
  work_hours
)
VALUES (
  'SEU_UUID_AQUI',  -- UUID do auth.users
  'admin@barber.com',
  'Administrador',
  'SEU_BARBERSHOP_ID_AQUI',  -- ID da barbershop
  'admin',
  '[
    {"day": 1, "start": "09:00", "end": "18:00"},
    {"day": 2, "start": "09:00", "end": "18:00"},
    {"day": 3, "start": "09:00", "end": "18:00"},
    {"day": 4, "start": "09:00", "end": "18:00"},
    {"day": 5, "start": "09:00", "end": "20:00"},
    {"day": 6, "start": "08:00", "end": "16:00"}
  ]'::jsonb
);

-- 6. Crie alguns serviços padrão:
INSERT INTO services (name, price, duration, barbershop_id)
VALUES
  ('Corte de Cabelo', 40.00, 45, 'SEU_BARBERSHOP_ID_AQUI'),
  ('Barba', 30.00, 30, 'SEU_BARBERSHOP_ID_AQUI'),
  ('Corte e Barba', 65.00, 75, 'SEU_BARBERSHOP_ID_AQUI'),
  ('Pezinho', 15.00, 15, 'SEU_BARBERSHOP_ID_AQUI');

-- ============================================
-- PRONTO! Agora você pode fazer login com:
-- Email: admin@barber.com
-- Senha: 123456
-- ============================================
