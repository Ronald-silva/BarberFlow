-- BarberFlow Seed Data
-- Execute este script APÓS o setup.sql

-- Insert sample barbershop
INSERT INTO barbershops (id, name, slug, logo_url, address) VALUES 
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Navalha Dourada', 'navalha-dourada', 'https://picsum.photos/seed/logo1/100/100', 'Rua das Tesouras, 123');

-- IMPORTANTE: Para criar usuários, você precisa primeiro criar as contas no Supabase Auth
-- Depois executar os INSERTs abaixo com os IDs corretos

-- Exemplo de como inserir usuários (substitua os UUIDs pelos IDs reais do auth.users):

-- Platform Admin (VOCÊ)
-- Primeiro crie a conta: platform@barberflow.com no Supabase Auth
-- Depois execute:
-- INSERT INTO users (id, email, name, barbershop_id, role, work_hours) VALUES 
-- ('seu-uuid-aqui', 'platform@barberflow.com', 'Admin BarberFlow', NULL, 'platform_admin', '[]');

-- Barbershop Admin
-- Primeiro crie a conta: admin@barber.com no Supabase Auth  
-- Depois execute:
-- INSERT INTO users (id, email, name, barbershop_id, role, work_hours) VALUES 
-- ('uuid-do-admin', 'admin@barber.com', 'Roberto Silva', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'admin', 
--  '[{"day": 1, "start": "09:00", "end": "18:00"}, {"day": 2, "start": "09:00", "end": "18:00"}]');

-- Insert sample services
INSERT INTO services (id, name, price, duration, barbershop_id) VALUES 
('s1s1s1s1-s1s1-s1s1-s1s1-s1s1s1s1s1s1', 'Corte de Cabelo', 40.00, 45, 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1'),
('s2s2s2s2-s2s2-s2s2-s2s2-s2s2s2s2s2s2', 'Barba', 30.00, 30, 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1'),
('s3s3s3s3-s3s3-s3s3-s3s3-s3s3s3s3s3s3', 'Corte e Barba', 65.00, 75, 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1'),
('s4s4s4s4-s4s4-s4s4-s4s4-s4s4s4s4s4s4', 'Pezinho', 15.00, 15, 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1');

-- Insert sample clients
INSERT INTO clients (id, name, whatsapp, barbershop_id, last_visit) VALUES 
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Carlos Silva', '5511988887777', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', NOW() - INTERVAL '7 days'),
('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'João Santos', '5511966665555', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', NOW() - INTERVAL '15 days'),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Pedro Oliveira', '5511955554444', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', NOW() - INTERVAL '30 days');

-- Appointments serão inseridos depois que você criar os usuários profissionais