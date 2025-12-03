-- 🔍 Script para Verificar Status do Supabase
-- Execute no SQL Editor para ver o que já existe

-- 1. Verificar barbearias existentes
SELECT 
    id,
    name,
    slug,
    address,
    phone,
    email,
    created_at
FROM barbershops
ORDER BY created_at;

-- 2. Verificar usuários por barbearia
SELECT 
    u.name as usuario,
    u.email,
    u.role,
    b.name as barbearia
FROM users u
JOIN barbershops b ON u.barbershop_id = b.id
ORDER BY b.name, u.role DESC;

-- 3. Verificar serviços por barbearia
SELECT 
    b.name as barbearia,
    s.name as servico,
    s.price,
    s.duration
FROM services s
JOIN barbershops b ON s.barbershop_id = b.id
ORDER BY b.name, s.price;

-- 4. Verificar clientes por barbearia
SELECT 
    b.name as barbearia,
    COUNT(c.id) as total_clientes
FROM barbershops b
LEFT JOIN clients c ON c.barbershop_id = b.id
GROUP BY b.id, b.name
ORDER BY b.name;

-- 5. Verificar agendamentos por barbearia
SELECT 
    b.name as barbearia,
    COUNT(a.id) as total_agendamentos
FROM barbershops b
LEFT JOIN appointments a ON a.barbershop_id = b.id
GROUP BY b.id, b.name
ORDER BY b.name;