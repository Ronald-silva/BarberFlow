-- Dados iniciais para teste
-- Execute após criar as tabelas

-- Primeiro, vamos criar variáveis para armazenar os IDs gerados
DO $$
DECLARE
    barbershop_id UUID;
    admin_id UUID;
    member1_id UUID;
    member2_id UUID;
    service1_id UUID;
    service2_id UUID;
    service3_id UUID;
    service4_id UUID;
BEGIN
    -- Inserir barbearia e capturar o ID
    INSERT INTO barbershops (name, slug, logo_url, address) 
    VALUES ('Navalha Dourada', 'navalha-dourada', 'https://picsum.photos/seed/logo1/100/100', 'Rua das Tesouras, 123')
    RETURNING id INTO barbershop_id;

    -- Inserir usuários/profissionais
    INSERT INTO users (email, name, barbershop_id, role, work_hours) 
    VALUES ('admin@barber.com', 'Roberto Silva', barbershop_id, 'admin', '[
      {"day": 1, "start": "09:00", "end": "18:00"},
      {"day": 2, "start": "09:00", "end": "18:00"},
      {"day": 3, "start": "09:00", "end": "18:00"},
      {"day": 4, "start": "09:00", "end": "18:00"},
      {"day": 5, "start": "09:00", "end": "20:00"},
      {"day": 6, "start": "08:00", "end": "16:00"}
    ]'::jsonb)
    RETURNING id INTO admin_id;

    INSERT INTO users (email, name, barbershop_id, role, work_hours) 
    VALUES ('thiago@barber.com', 'Thiago Santos', barbershop_id, 'member', '[
      {"day": 1, "start": "10:00", "end": "19:00"},
      {"day": 2, "start": "10:00", "end": "19:00"},
      {"day": 3, "start": "10:00", "end": "19:00"},
      {"day": 4, "start": "10:00", "end": "19:00"},
      {"day": 5, "start": "10:00", "end": "21:00"},
      {"day": 6, "start": "08:00", "end": "16:00"}
    ]'::jsonb)
    RETURNING id INTO member1_id;

    INSERT INTO users (email, name, barbershop_id, role, work_hours) 
    VALUES ('felipe@barber.com', 'Felipe Costa', barbershop_id, 'member', '[
      {"day": 2, "start": "09:00", "end": "18:00"},
      {"day": 3, "start": "09:00", "end": "18:00"},
      {"day": 4, "start": "09:00", "end": "18:00"},
      {"day": 5, "start": "09:00", "end": "20:00"},
      {"day": 6, "start": "08:00", "end": "16:00"},
      {"day": 0, "start": "09:00", "end": "15:00"}
    ]'::jsonb)
    RETURNING id INTO member2_id;

    -- Inserir serviços
    INSERT INTO services (name, price, duration, barbershop_id) VALUES 
    ('Corte de Cabelo', 40.00, 45, barbershop_id),
    ('Barba', 30.00, 30, barbershop_id),
    ('Corte e Barba', 65.00, 75, barbershop_id),
    ('Pezinho', 15.00, 15, barbershop_id);

    -- Inserir alguns clientes
    INSERT INTO clients (name, whatsapp, barbershop_id, last_visit) VALUES 
    ('Carlos Silva', '5511988887777', barbershop_id, NOW() - INTERVAL '7 days'),
    ('João Santos', '5511966665555', barbershop_id, NOW() - INTERVAL '15 days'),
    ('Pedro Oliveira', '5511955554444', barbershop_id, NOW() - INTERVAL '30 days');

    RAISE NOTICE 'Dados inseridos com sucesso! Barbearia ID: %', barbershop_id;
END $$;