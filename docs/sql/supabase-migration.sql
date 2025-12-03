-- Migration para adicionar campos faltantes
-- Execute este script no SQL Editor do Supabase se o banco já foi criado

-- Adicionar campos phone e email na tabela barbershops
ALTER TABLE barbershops 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Atualizar dados da barbearia de exemplo
UPDATE barbershops 
SET 
  phone = '(11) 99999-9999',
  email = 'contato@navalhadorada.com'
WHERE slug = 'navalha-dourada';