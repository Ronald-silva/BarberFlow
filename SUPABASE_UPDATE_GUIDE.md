# 🚀 Guia de Atualização do Supabase

## ⚡ Passos Rápidos

### 1. Acesse o Supabase Dashboard
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto BarberFlow

### 2. Execute o Schema de Pagamentos
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**
3. Cole o conteúdo do arquivo `supabase-payment-schema.sql`
4. Clique em **"Run"** (ou Ctrl+Enter)

### 3. Verifique se Funcionou
Após executar, você deve ver:
- ✅ Tabela `payments` criada
- ✅ Tabela `notifications` criada  
- ✅ Colunas adicionadas em `appointments`
- ✅ Índices criados
- ✅ Políticas RLS configuradas

### 4. Teste a Integração
1. Execute `npm run dev`
2. Acesse uma barbearia
3. Faça um agendamento
4. Teste o modal de pagamento

## 📋 Schema Resumido

O que será criado:

```sql
-- Tabela de Pagamentos
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id),
  payment_id TEXT UNIQUE, -- pix_xxx, btc_xxx
  amount DECIMAL(10,2),
  status TEXT, -- pending, approved, expired
  payment_method TEXT, -- pix, bitcoin
  payment_data JSONB, -- dados específicos
  expires_at TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- Tabela de Notificações  
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id),
  client_phone TEXT,
  message TEXT,
  type TEXT, -- confirmation, payment_confirmed, etc
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  status TEXT -- pending, sent, failed
);

-- Colunas em appointments
ALTER TABLE appointments ADD COLUMN payment_status TEXT DEFAULT 'pending';
ALTER TABLE appointments ADD COLUMN payment_required BOOLEAN DEFAULT true;
ALTER TABLE appointments ADD COLUMN total_amount DECIMAL(10,2);
```

## 🔒 Segurança (RLS)

As políticas criadas garantem:
- ✅ Usuários só veem pagamentos de suas barbearias
- ✅ Público pode criar pagamentos (para clientes)
- ✅ Sistema pode gerenciar notificações
- ✅ Dados protegidos por Row Level Security

## ⚠️ Troubleshooting

### Erro: "relation already exists"
```sql
-- Se alguma tabela já existe, use:
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
-- Depois execute o schema novamente
```

### Erro: "column already exists"
```sql
-- As colunas usam IF NOT EXISTS, mas se der erro:
ALTER TABLE appointments DROP COLUMN IF EXISTS payment_status;
ALTER TABLE appointments DROP COLUMN IF EXISTS payment_required;  
ALTER TABLE appointments DROP COLUMN IF EXISTS total_amount;
-- Depois execute o schema novamente
```

### Erro de Permissão
- Certifique-se de estar logado como owner do projeto
- Verifique se está no projeto correto

## ✅ Verificação Final

Execute esta query para confirmar:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'notifications');

-- Verificar colunas em appointments
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name IN ('payment_status', 'payment_required', 'total_amount');
```

Deve retornar todas as tabelas e colunas listadas.

## 🎉 Pronto!

Após executar o schema, seu sistema estará pronto para:
- ✅ Processar pagamentos PIX e Bitcoin
- ✅ Monitorar status de pagamentos
- ✅ Enviar notificações automáticas
- ✅ Gerenciar agendamentos com pagamento

**Próximo passo:** Configure as chaves PIX e Bitcoin no arquivo `.env.local`!