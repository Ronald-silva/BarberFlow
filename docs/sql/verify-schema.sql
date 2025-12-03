-- Query para verificar se o schema foi criado corretamente
-- Execute no SQL Editor do Supabase

-- 1. Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'notifications')
ORDER BY table_name;

-- 2. Verificar colunas adicionadas em appointments
SELECT 'Colunas em appointments:' as status;
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name IN ('payment_status', 'payment_required', 'total_amount')
ORDER BY column_name;

-- 3. Verificar estrutura da tabela payments
SELECT 'Estrutura da tabela payments:' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- 4. Verificar políticas RLS
SELECT 'Políticas RLS:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('payments', 'notifications')
ORDER BY tablename, policyname;