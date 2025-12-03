-- Script para verificar o schema atual do banco
-- Execute este script PRIMEIRO para ver como está seu banco

-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver estrutura da tabela de planos (qualquer que seja o nome)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('plans', 'planos')
ORDER BY table_name, ordinal_position;

-- Ver estrutura da tabela de assinaturas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('subscriptions', 'assinaturas')
ORDER BY table_name, ordinal_position;

-- Ver dados existentes em planos
SELECT * FROM plans LIMIT 5;
-- OU se for em português:
-- SELECT * FROM planos LIMIT 5;
