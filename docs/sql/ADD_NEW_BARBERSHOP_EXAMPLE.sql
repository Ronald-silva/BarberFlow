-- 🏢 Exemplo: Adicionando Nova Barbearia ao Sistema
-- Execute este script para adicionar uma nova barbearia

DO $
DECLARE
    new_barbershop_id UUID;
    admin_user_id UUID;
BEGIN
    -- 1. Criar nova barbearia
    INSERT INTO barbershops (
        name, 
        slug, 
        logo_url, 
        address, 
        phone, 
        email
    ) VALUES (
        'Corte & Estilo Premium',           -- Nome da barbearia
        'corte-estilo-premium',             -- Slug único para URL
        'https://picsum.photos/seed/logo2/100/100',  -- Logo
        'Av. Paulista, 1000 - São Paulo',  -- Endereço
        '(11) 98765-4321',                 -- Telefone
        'contato@corteeestilo.com'          -- Email
    )
    RETURNING id INTO new_barbershop_id;

    -- 2. Criar usuário administrador
    INSERT INTO users (
        email, 
        name, 
        barbershop_id, 
        role, 
        work_hours
    ) VALUES (
        'admin@corteeestilo.com',           -- Email do admin
        'Maria Silva Santos',               -- Nome do admin
        new_barbershop_id,                  -- ID da barbearia
        'admin',                            -- Perfil de administrador
        '[
            {"day": 1, "start": "08:00", "end": "18:00"},
            {"day": 2, "start": "08:00", "end": "18:00"},
            {"day": 3, "start": "08:00", "end": "18:00"},
            {"day": 4, "start": "08:00", "end": "18:00"},
            {"day": 5, "start": "08:00", "end": "20:00"},
            {"day": 6, "start": "08:00", "end": "16:00"}
        ]'::jsonb                           -- Horários de trabalho
    )
    RETURNING id INTO admin_user_id;

    -- 3. Adicionar profissionais
    INSERT INTO users (email, name, barbershop_id, role, work_hours) VALUES 
    (
        'carlos@corteeestilo.com', 
        'Carlos Barbeiro', 
        new_barbershop_id, 
        'member',
        '[
            {"day": 1, "start": "09:00", "end": "18:00"},
            {"day": 2, "start": "09:00", "end": "18:00"},
            {"day": 3, "start": "09:00", "end": "18:00"},
            {"day": 4, "start": "09:00", "end": "18:00"},
            {"day": 5, "start": "09:00", "end": "19:00"},
            {"day": 6, "start": "08:00", "end": "15:00"}
        ]'::jsonb
    ),
    (
        'ana@corteeestilo.com', 
        'Ana Cabeleireira', 
        new_barbershop_id, 
        'member',
        '[
            {"day": 2, "start": "10:00", "end": "19:00"},
            {"day": 3, "start": "10:00", "end": "19:00"},
            {"day": 4, "start": "10:00", "end": "19:00"},
            {"day": 5, "start": "10:00", "end": "20:00"},
            {"day": 6, "start": "09:00", "end": "16:00"},
            {"day": 0, "start": "10:00", "end": "14:00"}
        ]'::jsonb
    );

    -- 4. Criar serviços da barbearia
    INSERT INTO services (name, price, duration, barbershop_id) VALUES 
    ('Corte Masculino', 35.00, 40, new_barbershop_id),
    ('Corte Feminino', 50.00, 60, new_barbershop_id),
    ('Barba Completa', 25.00, 30, new_barbershop_id),
    ('Corte + Barba', 55.00, 70, new_barbershop_id),
    ('Sobrancelha', 20.00, 20, new_barbershop_id),
    ('Hidratação Capilar', 80.00, 90, new_barbershop_id);

    -- 5. Adicionar alguns clientes de exemplo
    INSERT INTO clients (name, whatsapp, barbershop_id, last_visit) VALUES 
    ('João Pedro Silva', '5511987654321', new_barbershop_id, NOW() - INTERVAL '5 days'),
    ('Maria Fernanda Costa', '5511976543210', new_barbershop_id, NOW() - INTERVAL '12 days'),
    ('Roberto Carlos Lima', '5511965432109', new_barbershop_id, NOW() - INTERVAL '20 days'),
    ('Ana Paula Santos', '5511954321098', new_barbershop_id, NOW() - INTERVAL '8 days');

    -- 6. Criar alguns agendamentos de exemplo
    INSERT INTO appointments (
        client_id, 
        professional_id, 
        barbershop_id, 
        service_ids, 
        start_datetime, 
        end_datetime, 
        status
    ) 
    SELECT 
        c.id,
        u.id,
        new_barbershop_id,
        ARRAY[s.id],
        NOW() + INTERVAL '2 days' + INTERVAL '10:00:00',
        NOW() + INTERVAL '2 days' + INTERVAL '10:40:00',
        'confirmed'
    FROM clients c, users u, services s
    WHERE c.barbershop_id = new_barbershop_id 
    AND u.barbershop_id = new_barbershop_id 
    AND u.role = 'member'
    AND s.barbershop_id = new_barbershop_id
    AND s.name = 'Corte Masculino'
    LIMIT 1;

    -- Exibir informações da nova barbearia
    RAISE NOTICE '✅ Nova barbearia criada com sucesso!';
    RAISE NOTICE '🏢 ID da Barbearia: %', new_barbershop_id;
    RAISE NOTICE '👤 ID do Admin: %', admin_user_id;
    RAISE NOTICE '🌐 URL: /barbershop/corte-estilo-premium';
    RAISE NOTICE '📧 Login Admin: admin@corteeestilo.com';

END $;