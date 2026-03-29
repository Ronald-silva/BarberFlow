# Guia de Implementação - Integração Stripe

**Versão**: 1.0
**Data**: 30 de dezembro de 2025
**Status**: Implementação Completa

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquivos Criados](#arquivos-criados)
3. [Configuração Stripe Dashboard](#configuração-stripe-dashboard)
4. [Configuração do Supabase](#configuração-do-supabase)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Deploy das Edge Functions](#deploy-das-edge-functions)
7. [Executar SQL no Banco](#executar-sql-no-banco)
8. [Testar Integração](#testar-integração)
9. [Troubleshooting](#troubleshooting)
10. [Segurança](#segurança)

---

## Visão Geral

A integração do Stripe no Shafar permite:

- **Assinaturas Recorrentes**: Planos mensais e anuais
- **Período de Teste**: 14 dias grátis para todos os planos
- **Gestão de Pagamentos**: Portal do cliente para gerenciar cartões e faturas
- **Webhooks**: Sincronização automática de eventos do Stripe
- **LGPD Compliance**: Logs completos de transações

### Planos Disponíveis

| Plano | Preço Mensal | Preço Anual | Profissionais | Serviços | Agendamentos/mês |
|-------|-------------|-------------|---------------|----------|------------------|
| **Básico** | R$ 49,90 | R$ 539,00 | 2 | 10 | 100 |
| **Profissional** | R$ 99,90 | R$ 1.079,00 | 5 | 30 | 500 |
| **Premium** | R$ 199,90 | R$ 2.159,00 | Ilimitados | Ilimitados | Ilimitados |

---

## Arquivos Criados

### 1. Banco de Dados

- **[database/subscriptions-schema.sql](../database/subscriptions-schema.sql)** - Schema completo
  - Tabela `subscription_plans` - Planos disponíveis
  - Tabela `stripe_customers` - Clientes Stripe
  - Tabela `subscriptions` - Assinaturas ativas
  - Tabela `payment_history` - Histórico de pagamentos
  - RLS policies completas
  - Helper functions

### 2. Frontend (React/TypeScript)

- **[src/config/stripe.ts](../src/config/stripe.ts)** - Configuração Stripe
  - Inicialização do Stripe
  - Formatação de preços
  - Price IDs mapping
  - Helper functions

- **[src/services/subscriptionService.ts](../src/services/subscriptionService.ts)** - Service para assinaturas
  - Fetch plans
  - Gerenciar assinaturas
  - Criar checkout sessions
  - Histórico de pagamentos

- **[src/pages/PricingPage.tsx](../src/pages/PricingPage.tsx)** - Página de preços (já existia)

### 3. Edge Functions (Supabase/Deno)

- **[supabase/functions/create-checkout-session/index.ts](../supabase/functions/create-checkout-session/index.ts)**
  - Cria sessão de checkout do Stripe
  - Cria/recupera cliente Stripe
  - Configura trial de 14 dias

- **[supabase/functions/create-portal-session/index.ts](../supabase/functions/create-portal-session/index.ts)**
  - Cria sessão do Customer Portal
  - Permite gerenciar assinatura

- **[supabase/functions/stripe-webhook/index.ts](../supabase/functions/stripe-webhook/index.ts)**
  - Recebe eventos do Stripe
  - Sincroniza assinaturas
  - Registra pagamentos

---

## Configuração Stripe Dashboard

### Passo 1: Criar Conta Stripe

1. Acesse: [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Crie sua conta
3. Complete o processo de verificação

### Passo 2: Ativar Modo de Teste

1. No dashboard, ative o **"Test Mode"** (switch no canto superior direito)
2. Use este modo para desenvolvimento

### Passo 3: Criar Produtos e Preços

#### 3.1. Criar Plano Básico

1. Vá em **Products** → **Add Product**
2. Preencha:
   - **Nome**: `Básico`
   - **Descrição**: `Ideal para barbearias iniciantes`
   - **Pricing Model**: `Standard pricing`
   - **Price**: `49.90 BRL`
   - **Billing Period**: `Monthly`
3. Clique em **Save product**
4. **Copie o Price ID** (formato: `price_xxx`) → Guarde para `VITE_STRIPE_PRICE_BASIC_MONTHLY`

5. Adicione preço anual:
   - Na página do produto, clique em **Add another price**
   - **Price**: `539.00 BRL`
   - **Billing Period**: `Yearly`
   - **Copie o Price ID** → Guarde para `VITE_STRIPE_PRICE_BASIC_YEARLY`

#### 3.2. Criar Plano Profissional

Repita o processo acima com:
- **Nome**: `Profissional`
- **Descrição**: `Para barbearias em crescimento`
- **Preço Mensal**: `99.90 BRL` → Copie Price ID para `VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY`
- **Preço Anual**: `1079.00 BRL` → Copie Price ID para `VITE_STRIPE_PRICE_PROFESSIONAL_YEARLY`

#### 3.3. Criar Plano Premium

Repita o processo acima com:
- **Nome**: `Premium`
- **Descrição**: `Solução completa para redes de barbearias`
- **Preço Mensal**: `199.90 BRL` → Copie Price ID para `VITE_STRIPE_PRICE_PREMIUM_MONTHLY`
- **Preço Anual**: `2159.00 BRL` → Copie Price ID para `VITE_STRIPE_PRICE_PREMIUM_YEARLY`

### Passo 4: Atualizar Database com Price IDs

1. Acesse: [https://app.supabase.com](https://app.supabase.com) → Seu Projeto → SQL Editor
2. Execute:

```sql
-- Atualizar Plano Básico
UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_xxx', -- Cole o Price ID mensal
  stripe_price_id_yearly = 'price_yyy',  -- Cole o Price ID anual
  stripe_product_id = 'prod_zzz'         -- Cole o Product ID
WHERE slug = 'basic';

-- Atualizar Plano Profissional
UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_xxx',
  stripe_price_id_yearly = 'price_yyy',
  stripe_product_id = 'prod_zzz'
WHERE slug = 'professional';

-- Atualizar Plano Premium
UPDATE subscription_plans
SET
  stripe_price_id_monthly = 'price_xxx',
  stripe_price_id_yearly = 'price_yyy',
  stripe_product_id = 'prod_zzz'
WHERE slug = 'premium';
```

### Passo 5: Configurar Customer Portal

1. Vá em **Settings** → **Customer portal**
2. Ative o portal
3. Configure:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to update billing information
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to switch plans

### Passo 6: Obter API Keys

1. Vá em **Developers** → **API Keys**
2. Copie:
   - **Publishable key** (pk_test_xxx) → Para `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (sk_test_xxx) → Para `STRIPE_SECRET_KEY`
   - ⚠️ **NUNCA exponha a Secret Key no frontend!**

### Passo 7: Configurar Webhook

1. Vá em **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. **Endpoint URL**: `https://[SEU-PROJETO].supabase.co/functions/v1/stripe-webhook`
   - Substitua `[SEU-PROJETO]` pelo ID do seu projeto Supabase
4. **Events to listen**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Clique em **Add endpoint**
6. **Copie o Webhook Secret** (whsec_xxx) → Para `STRIPE_WEBHOOK_SECRET`

---

## Configuração do Supabase

### Passo 1: Instalar Supabase CLI

```bash
npm install -g supabase
```

### Passo 2: Fazer Login

```bash
supabase login
```

### Passo 3: Linkar Projeto

```bash
supabase link --project-ref [SEU-PROJECT-ID]
```

**Como encontrar o Project ID**:
1. Acesse: [https://app.supabase.com](https://app.supabase.com)
2. Vá no seu projeto
3. **Settings** → **General**
4. Copie o **Reference ID**

---

## Variáveis de Ambiente

### Passo 1: Configurar `.env` Local

Crie/edite o arquivo `.env` na raiz do projeto:

```bash
# Supabase
VITE_SUPABASE_URL=https://[SEU-PROJETO].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Stripe (Publishable Key - OK expor no frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Stripe Price IDs
VITE_STRIPE_PRICE_BASIC_MONTHLY=price_xxx
VITE_STRIPE_PRICE_BASIC_YEARLY=price_xxx
VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxx
VITE_STRIPE_PRICE_PROFESSIONAL_YEARLY=price_xxx
VITE_STRIPE_PRICE_PREMIUM_MONTHLY=price_xxx
VITE_STRIPE_PRICE_PREMIUM_YEARLY=price_xxx
```

### Passo 2: Configurar Secrets no Supabase

**NUNCA** exponha as Secret Keys no código frontend. Configure-as como secrets no Supabase:

```bash
# Stripe Secret Key (NUNCA commite isso!)
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx

# Webhook Secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Passo 3: Configurar Variáveis no Vercel (Produção)

1. Acesse: [https://vercel.com](https://vercel.com) → Seu Projeto
2. **Settings** → **Environment Variables**
3. Adicione todas as variáveis `VITE_*` do `.env`
4. ⚠️ **NÃO** adicione `STRIPE_SECRET_KEY` ou `STRIPE_WEBHOOK_SECRET` no Vercel (elas ficam apenas no Supabase)

---

## Deploy das Edge Functions

### Passo 1: Deploy da Função de Checkout

```bash
supabase functions deploy create-checkout-session
```

**Teste**:
```bash
curl -i --location --request POST 'https://[SEU-PROJETO].supabase.co/functions/v1/create-checkout-session' \
  --header 'Authorization: Bearer [ANON-KEY]' \
  --header 'Content-Type: application/json' \
  --data '{"plan_id":"[UUID-DO-PLANO]","billing_cycle":"monthly","barbershop_id":"[UUID-BARBERSHOP]"}'
```

### Passo 2: Deploy da Função do Portal

```bash
supabase functions deploy create-portal-session
```

### Passo 3: Deploy do Webhook

```bash
supabase functions deploy stripe-webhook
```

**Importante**: Após o deploy, copie a URL da função e configure no Stripe Webhook (Passo 7 da seção "Configuração Stripe Dashboard")

---

## Executar SQL no Banco

### Passo 1: Executar Schema de Subscriptions

1. Acesse: [https://app.supabase.com](https://app.supabase.com) → Seu Projeto
2. **SQL Editor** → **New Query**
3. Cole o conteúdo de [database/subscriptions-schema.sql](../database/subscriptions-schema.sql)
4. Clique em **Run**
5. Verifique as mensagens de sucesso:
   - ✅ All 4 subscription tables created successfully!
   - ✅ 3 subscription plans created (Básico, Profissional, Premium)

### Passo 2: Verificar Tabelas Criadas

Execute no SQL Editor:

```sql
SELECT * FROM subscription_plans;
SELECT * FROM stripe_customers;
SELECT * FROM subscriptions;
SELECT * FROM payment_history;
```

---

## Testar Integração

### Teste 1: Frontend - Visualizar Planos

1. Execute o frontend:
```bash
npm run dev
```

2. Acesse: [http://localhost:5173/pricing](http://localhost:5173/pricing)

3. Verifique:
   - ✅ Os 3 planos aparecem (Básico, Profissional, Premium)
   - ✅ Preços estão corretos
   - ✅ Toggle mensal/anual funciona
   - ✅ Desconto de 10% é aplicado no anual

### Teste 2: Criar Checkout Session

1. Faça login no sistema
2. Na página de preços, clique em **"Começar Teste Grátis"** em qualquer plano
3. Você deve ser redirecionado para a página do Stripe Checkout
4. Verifique:
   - ✅ Nome da barbearia aparece
   - ✅ Preço está correto
   - ✅ Trial de 14 dias é mencionado

### Teste 3: Completar Pagamento (Modo Teste)

Use cartões de teste do Stripe:

| Cartão | Número | Resultado |
|--------|--------|-----------|
| Sucesso | `4242 4242 4242 4242` | Pagamento aprovado |
| Falha | `4000 0000 0000 0002` | Pagamento recusado |
| 3D Secure | `4000 0025 0000 3155` | Requer autenticação |

**Dados do cartão**:
- **Data de expiração**: Qualquer data futura (ex: 12/34)
- **CVC**: Qualquer 3 dígitos (ex: 123)
- **CEP**: Qualquer CEP (ex: 12345)

**Após completar**:

1. Você deve ser redirecionado para `/dashboard?session_id=...`
2. Verifique no Supabase:

```sql
SELECT * FROM subscriptions WHERE barbershop_id = '[SEU-BARBERSHOP-ID]';
SELECT * FROM stripe_customers WHERE barbershop_id = '[SEU-BARBERSHOP-ID]';
SELECT * FROM payment_history WHERE barbershop_id = '[SEU-BARBERSHOP-ID]';
```

3. Verifique no Stripe Dashboard:
   - **Customers** → Deve aparecer um cliente novo
   - **Subscriptions** → Deve aparecer a assinatura "Trialing"

### Teste 4: Customer Portal

1. No dashboard, adicione um botão "Gerenciar Assinatura"
2. Ao clicar, chame `createCustomerPortalSession(barbershopId)`
3. Você deve ser redirecionado para o Stripe Customer Portal
4. Teste:
   - ✅ Atualizar cartão de crédito
   - ✅ Ver faturas
   - ✅ Cancelar assinatura

### Teste 5: Webhooks

1. Acesse Stripe Dashboard → **Developers** → **Webhooks** → Seu webhook
2. Clique em **"Send test webhook"**
3. Selecione `invoice.payment_succeeded`
4. Clique em **Send**
5. Verifique logs no Supabase:

```bash
supabase functions logs stripe-webhook
```

---

## Troubleshooting

### Erro: "STRIPE_SECRET_KEY não configurada"

**Solução**:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase functions deploy stripe-webhook
```

### Erro: "Price ID do Stripe não configurado para este plano"

**Causa**: Os Price IDs não foram salvos no banco de dados.

**Solução**: Execute o UPDATE SQL do Passo 4 da seção "Configuração Stripe Dashboard"

### Erro: "Webhook signature invalid"

**Causa**: O Webhook Secret está incorreto.

**Solução**:
1. Copie o webhook secret do Stripe Dashboard
2. Configure no Supabase:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase functions deploy stripe-webhook
```

### Erro: "Stripe customer not found"

**Causa**: Tentando acessar o Customer Portal sem ter uma assinatura.

**Solução**: Primeiro complete um checkout para criar o Stripe customer.

### Webhook não está sendo chamado

**Causa**: URL do webhook incorreta ou Edge Function não deployada.

**Solução**:
1. Verifique a URL no Stripe Dashboard: `https://[SEU-PROJETO].supabase.co/functions/v1/stripe-webhook`
2. Deploy novamente:
```bash
supabase functions deploy stripe-webhook
```
3. Teste manualmente enviando um webhook de teste

---

## Segurança

### ✅ Boas Práticas Implementadas

1. **API Keys Seguras**
   - ✅ Secret Key NUNCA exposta no frontend
   - ✅ Publishable Key pode ser exposta (read-only)
   - ✅ Secrets configuradas no Supabase (não no .env commitado)

2. **Row Level Security (RLS)**
   - ✅ Usuários só veem assinaturas da própria barbearia
   - ✅ Apenas admins podem modificar planos
   - ✅ Isolamento completo entre barbearias

3. **Webhook Security**
   - ✅ Assinatura verificada em todas as requisições
   - ✅ Events validados antes de processar
   - ✅ Logs completos para auditoria

4. **LGPD Compliance**
   - ✅ Histórico de pagamentos rastreável
   - ✅ Dados de cartão NUNCA armazenados (apenas last4)
   - ✅ Links para Políticas de Privacidade

### ⚠️ Checklist de Segurança

Antes de ir para produção:

- [ ] Migrar de Test Mode para Live Mode no Stripe
- [ ] Atualizar API keys (pk_live_xxx, sk_live_xxx)
- [ ] Atualizar Price IDs (produtos de produção)
- [ ] Configurar webhook de produção
- [ ] Habilitar HTTPS em todos os endpoints
- [ ] Revisar RLS policies
- [ ] Adicionar rate limiting nas Edge Functions
- [ ] Configurar alertas de falha de pagamento
- [ ] Testar fluxo completo em produção

---

## Próximos Passos

1. ✅ **Implementação Stripe** - Concluída
2. ⏳ **Testar localmente** - Seguir seção "Testar Integração"
3. ⏳ **Deploy produção** - Configurar Vercel + domínio
4. ⏳ **Migrar para Live Mode** - Usar chaves de produção do Stripe
5. ⏳ **Configurar notificações** - Avisar sobre pagamentos falhados
6. ⏳ **Adicionar analytics** - Monitorar conversões e churn

---

**Status**: ✅ **Integração Stripe Completa**

**Arquivos criados**: 8
- 1 database schema
- 2 frontend services
- 3 Edge Functions
- 1 .env.example atualizado
- 1 guia de implementação

**Próxima tarefa crítica**: Deploy em produção (Tarefa 6/7)

---

© 2025 Shafar
