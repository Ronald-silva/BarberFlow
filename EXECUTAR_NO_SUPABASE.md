# 🗄️ SQL PARA EXECUTAR NO SUPABASE

**Tempo**: 5 minutos
**Onde**: Supabase Dashboard → SQL Editor

---

## 📋 PASSO A PASSO

### 1. Acesse o SQL Editor

1. Vá em: https://app.supabase.com
2. Selecione seu projeto: **Shafar**
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**

---

### 2. Execute o Setup Completo

Cole o conteúdo do arquivo `database/SETUP_COMPLETO.sql` e clique em **Run**.

**O que esse script faz**:
- ✅ Limpa policies antigas
- ✅ Habilita RLS em todas as tabelas
- ✅ Cria 4 funções auxiliares (is_barbershop_admin, is_platform_admin, etc)
- ✅ Cria 26 RLS policies
- ✅ Cria tabela consent_logs (LGPD)
- ✅ Cria 4 tabelas de subscriptions (Stripe)
- ✅ Cria 2 tabelas de email (Resend)
- ✅ Insere 3 planos de assinatura
- ✅ Insere 3 templates de email

**Resultado esperado**:
```
✅ 26 RLS policies criadas
✅ 7 tabelas novas criadas
✅ 4 funções auxiliares criadas
✅ 3 planos de assinatura inseridos
✅ 3 templates de email inseridos
```

---

### 3. Verificar se funcionou

Execute essas queries para confirmar:

```sql
-- Ver planos criados
SELECT name, price_monthly, price_yearly FROM subscription_plans;

-- Ver templates de email
SELECT template_key, name FROM email_templates;

-- Ver tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('consent_logs', 'subscription_plans', 'stripe_customers', 'subscriptions', 'payment_history', 'email_templates', 'email_logs');

-- Contar RLS policies
SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';
```

**Resultado esperado**:
- 3 planos (Básico, Profissional, Premium)
- 3 templates (appointment_confirmation, appointment_reminder, payment_confirmed)
- 7 tabelas novas
- ~26 policies

---

## ✅ PRONTO!

Depois de executar o SQL, seu banco estará 100% configurado e pronto para uso!

**O que vai funcionar**:
- ✅ Autenticação e login
- ✅ Cadastro de barbearias
- ✅ Agendamentos
- ✅ Gestão de clientes, serviços, profissionais
- ✅ Logs LGPD
- ✅ Isolamento de dados entre barbearias

**O que vai precisar do Stripe (configurar depois)**:
- ⏳ Checkout de assinaturas
- ⏳ Portal do cliente
- ⏳ Webhooks de pagamento

---

Me avise quando executar o SQL que eu te ajudo com o próximo passo!
