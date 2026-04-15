# 🚀 Guia Rápido - Deploy das Edge Functions

**Tempo estimado**: 15-20 minutos
**Pré-requisitos**: Supabase CLI instalado

---

## 📋 Passo a Passo

### 1. Instalar Supabase CLI (se ainda não tiver)

```bash
npm install -g supabase
```

### 2. Fazer Login no Supabase

```bash
supabase login
```

Isso vai abrir o navegador para você autorizar.

### 3. Linkar seu Projeto

```bash
supabase link --project-ref knlvbuucymqkzdxuvamy
```

**Nota**: O project ref está no seu .env (`knlvbuucymqkzdxuvamy`)

### 4. Configurar Secrets (IMPORTANTE!)

```bash
# Stripe Secret Key (obtenha em: https://dashboard.stripe.com/test/apikeys)
supabase secrets set STRIPE_SECRET_KEY=sk_test_sua_secret_key_aqui

# Stripe Webhook Secret (obtenha em: https://dashboard.stripe.com/test/webhooks)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui

# Resend API Key (obtenha em: https://resend.com/api-keys)
supabase secrets set RESEND_API_KEY=re_sua_api_key_aqui
```

### 5. Deploy das Edge Functions

```bash
# Deploy função de checkout
supabase functions deploy create-checkout-session

# Deploy função de portal do cliente
supabase functions deploy create-portal-session

# Deploy função de webhook do Stripe
supabase functions deploy stripe-webhook

# Deploy função de envio de email
supabase functions deploy send-email
```

### 6. Verificar Deploy

```bash
# Listar funções deployadas
supabase functions list

# Ver logs de uma função
supabase functions logs create-checkout-session
```

---

## 🧪 Testar as Funções

### Teste 1: Checkout Session

```bash
curl -i --location --request POST \
  'https://knlvbuucymqkzdxuvamy.supabase.co/functions/v1/create-checkout-session' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  --header 'Content-Type: application/json' \
  --data '{
    "plan_id": "uuid-do-plano-basico",
    "billing_cycle": "monthly",
    "barbershop_id": "uuid-da-sua-barbearia"
  }'
```

**Resposta esperada**: `{ "url": "https://checkout.stripe.com/..." }`

### Teste 2: Webhook

No Stripe Dashboard:
1. Vá em **Developers** → **Webhooks**
2. Clique no seu webhook
3. Clique em **"Send test webhook"**
4. Selecione `checkout.session.completed`
5. Clique em **Send**

Verificar logs:
```bash
supabase functions logs stripe-webhook --tail
```

---

## 🔧 Configurar Webhook no Stripe

### URL do Webhook:
```
https://knlvbuucymqkzdxuvamy.supabase.co/functions/v1/stripe-webhook
```

### Eventos para escutar:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### Copiar Webhook Secret:
Após criar o webhook, copie o secret (whsec_xxx) e configure:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## ⚠️ Troubleshooting

### Erro: "STRIPE_SECRET_KEY não configurada"
**Solução**: Execute o passo 4 novamente

### Erro: "supabase: command not found"
**Solução**: Instale o CLI: `npm install -g supabase`

### Erro: "Project not linked"
**Solução**: Execute: `supabase link --project-ref knlvbuucymqkzdxuvamy`

### Função não aparece na lista
**Solução**: Aguarde 30 segundos e execute `supabase functions list` novamente

---

## ✅ Checklist Final

- [ ] Supabase CLI instalado
- [ ] Login feito (`supabase login`)
- [ ] Projeto linkado
- [ ] 3 secrets configurados (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY)
- [ ] 4 funções deployadas
- [ ] Webhook configurado no Stripe Dashboard
- [ ] Testes executados com sucesso

---

**Após completar**: As Edge Functions estarão prontas e o Stripe funcionará em produção! 🎉
