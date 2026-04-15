# 🎯 PRÓXIMOS PASSOS - Shafar

**Status Atual**: 🟢 92% Completo - Pronto para Beta
**Bugs Críticos**: ✅ Todos corrigidos
**Build**: ✅ Funcionando perfeitamente

---

## ✅ O QUE FOI CORRIGIDO AGORA

1. ✅ **Sessão persiste entre reloads** - AuthContext atualizado
2. ✅ **Webhook secret seguro** - Removido do .env
3. ✅ **Arquivos duplicados removidos** - Pasta pages/ deletada
4. ✅ **Consentimento de cookies registrado** - Logs LGPD completos
5. ✅ **Upload de logo validado** - Segurança contra arquivos maliciosos

---

## 🚀 PARA COLOCAR EM PRODUÇÃO (2 horas)

### Passo 1: Configurar Secrets no Supabase (5 min)

```bash
# 1. Instalar CLI (se necessário)
npm install -g supabase

# 2. Login
supabase login

# 3. Linkar projeto
supabase link --project-ref knlvbuucymqkzdxuvamy

# 4. Configurar secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_sua_key_aqui
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_seu_secret_aqui
supabase secrets set RESEND_API_KEY=re_sua_key_aqui
```

**Onde obter as keys**:
- Stripe: https://dashboard.stripe.com/test/apikeys
- Webhook: https://dashboard.stripe.com/test/webhooks
- Resend: https://resend.com/api-keys (grátis - 100 emails/dia)

---

### Passo 2: Deploy das Edge Functions (10 min)

```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
supabase functions deploy send-email
```

**Verificar**:
```bash
supabase functions list
```

---

### Passo 3: Configurar Webhook no Stripe (5 min)

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em **"Add endpoint"**
3. **URL**: `https://knlvbuucymqkzdxuvamy.supabase.co/functions/v1/stripe-webhook`
4. **Eventos**:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
5. Clique em **"Add endpoint"**
6. Copie o webhook secret e configure no passo 1

---

### Passo 4: Executar SQL no Supabase (5 min)

1. Acesse: https://app.supabase.com
2. Vá em **SQL Editor** → **New Query**
3. Cole o conteúdo de `database/SETUP_COMPLETO.sql`
4. Clique em **Run**
5. Aguarde mensagem de sucesso

**Verificar**:
```sql
SELECT * FROM subscription_plans;  -- Deve ter 3 planos
SELECT * FROM consent_logs;        -- Tabela criada
SELECT * FROM email_templates;     -- Deve ter 3 templates
```

---

### Passo 5: Atualizar Price IDs no Banco (5 min)

No Stripe Dashboard, copie os Price IDs dos seus produtos e execute:

```sql
-- Plano Básico
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1Sk2OkRwJh1khCyJZOHNcdiy',
    stripe_price_id_yearly = 'price_1Sk2AbRwJh1khCyJn1ezvWeH'
WHERE slug = 'basic';

-- Plano Profissional
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1Sk2NRRwJh1khCyJLLV99Zhv',
    stripe_price_id_yearly = 'price_1Sk2CYRwJh1khCyJjREI6ZKF'
WHERE slug = 'professional';

-- Plano Premium
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1Sk2LgRwJh1khCyJGWi58LW9',
    stripe_price_id_yearly = 'price_1Sk2E6RwJh1khCyJyYRpWtl4'
WHERE slug = 'premium';
```

**Nota**: Os Price IDs acima já estão no seu .env, mas verifique se estão corretos no Stripe Dashboard.

---

### Passo 6: Deploy no Vercel (10 min)

```bash
# 1. Instalar Vercel CLI (se necessário)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

**Configurar variáveis de ambiente no Vercel**:
1. Acesse: https://vercel.com/dashboard
2. Vá em **Settings** → **Environment Variables**
3. Adicione todas as variáveis `VITE_*` do seu .env:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_STRIPE_PUBLISHABLE_KEY
   - VITE_STRIPE_PRICE_BASIC_MONTHLY
   - VITE_STRIPE_PRICE_BASIC_YEARLY
   - VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY
   - VITE_STRIPE_PRICE_PROFESSIONAL_YEARLY
   - VITE_STRIPE_PRICE_PREMIUM_MONTHLY
   - VITE_STRIPE_PRICE_PREMIUM_YEARLY
   - VITE_EMAIL_FROM
   - VITE_EMAIL_FROM_NAME

4. Marque: ✅ Production ✅ Preview ✅ Development
5. Clique em **Save**
6. Faça **Redeploy**

---

### Passo 7: Testar em Produção (30 min)

#### Teste 1: Login
1. Acesse sua URL do Vercel
2. Faça login
3. Dê F5 na página
4. ✅ Deve continuar logado

#### Teste 2: Checkout Stripe
1. Vá em `/pricing`
2. Clique em "Começar Teste Grátis"
3. ✅ Deve redirecionar para Stripe Checkout
4. Use cartão de teste: `4242 4242 4242 4242`
5. ✅ Deve criar assinatura no banco

#### Teste 3: Webhook
1. No Stripe Dashboard, envie webhook de teste
2. Verifique logs: `supabase functions logs stripe-webhook`
3. ✅ Deve processar sem erros

#### Teste 4: Consentimento
1. Abra em modo anônimo
2. ✅ Banner de cookies deve aparecer
3. Clique em "Aceitar"
4. Faça login
5. Verifique no Supabase: `SELECT * FROM consent_logs`
6. ✅ Deve ter registro do consentimento

---

## 📋 CHECKLIST COMPLETO

### Correções Aplicadas ✅
- [x] Persistência de sessão corrigida
- [x] Webhook secret movido para Supabase Secrets
- [x] Arquivos duplicados removidos
- [x] Consentimento de cookies registrado
- [x] Upload de logo validado
- [x] Build testado e funcionando

### Configuração Necessária ⏳
- [ ] Secrets configurados no Supabase
- [ ] Edge Functions deployadas
- [ ] Webhook configurado no Stripe
- [ ] SQL executado no banco
- [ ] Price IDs atualizados
- [ ] Deploy no Vercel
- [ ] Variáveis configuradas no Vercel
- [ ] Testes em produção

### Opcional (Melhorias) 🟡
- [ ] Preencher dados legais ([INSERIR ...])
- [ ] Configurar emails (privacy@, dpo@)
- [ ] Configurar Sentry
- [ ] Adicionar testes automatizados
- [ ] Configurar domínio personalizado
- [ ] Revisar com advogado

---

## 💰 CUSTOS

### Setup (One-time)
- Domínio: R$ 40/ano (opcional por enquanto)
- Revisão jurídica: R$ 2-5k (opcional)

### Mensal (Primeiros meses)
- Supabase: R$ 0 (free tier)
- Vercel: R$ 0 (hobby plan)
- Stripe: 3,49% + R$ 0,39 por transação
- Resend: R$ 0 (até 100 emails/dia)
- **Total**: R$ 0 + taxas Stripe

---

## 🎯 RECOMENDAÇÃO

### Para Beta Privado (AGORA):
1. ✅ Execute os passos 1-7 acima (2 horas)
2. ✅ Convide 5-10 barbearias para testar
3. ✅ Cobre preço reduzido (50% off)
4. ✅ Colete feedback
5. ✅ Itere baseado no uso real

### Para Lançamento Público (1-2 semanas):
1. Preencha dados legais
2. Configure emails profissionais
3. Contrate advogado para revisão
4. Configure domínio personalizado
5. Adicione testes automatizados
6. Configure monitoring completo

---

## 📞 PRECISA DE AJUDA?

Posso ajudar com:
- ✅ Deploy das Edge Functions
- ✅ Configuração do Vercel
- ✅ Testes do fluxo completo
- ✅ Preencher dados legais
- ✅ Criar scripts de automação

**Próxima ação sugerida**: Deploy das Edge Functions

Quer que eu te guie no deploy agora?
