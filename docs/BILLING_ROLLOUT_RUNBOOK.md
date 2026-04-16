# Billing Rollout Runbook (Stripe + Asaas)

Este runbook define como habilitar Asaas gradualmente sem interromper cobrança existente no Stripe.

## 1) Pré-requisitos

- Migration aplicada: `supabase/migrations/20260415_multi_provider_billing.sql`
- Secrets configurados no Supabase:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `ASAAS_API_KEY` (use a chave da **conta sandbox** do Asaas para testes)
  - `ASAAS_ENV` = `sandbox` (padrão seguro; só `production` + chave de produção após validação)
  - `ASAAS_WEBHOOK_SECRET` (opcional, recomendado)
- Deploy das funções:
  - `create-checkout-session`
  - `create-portal-session`
  - `stripe-webhook`
  - `asaas-webhook`
  - `create-booking-payment`

### Asaas: sandbox (sem cobrança real)

- Crie / use a conta em [sandbox.asaas.com](https://sandbox.asaas.com) e copie a **API key de sandbox** (não use token com `$aact_prod` em dev).
- Nos secrets: `ASAAS_ENV=sandbox` (ou omita; o código assume sandbox).
- As Edge Functions chamam `https://sandbox.asaas.com/api/v3` quando `ASAAS_ENV` ≠ `production`.
- Se `ASAAS_ENV=sandbox` e a chave parecer de produção (`$aact_prod` / `_prod_`), a função **recusa** o pedido com erro explícito, para evitar confusão.

## 2) Feature Flags por tenant

Tabela: `payment_provider_configs`

- `subscription_provider`: provedor principal para assinaturas
- `booking_provider`: provedor principal para agendamentos
- `fallback_provider`: usado para rollback rápido
- `rollout_enabled`: habilita o roteamento por tenant

Exemplo (canary de 1 tenant):

```sql
insert into payment_provider_configs (
  barbershop_id,
  subscription_provider,
  booking_provider,
  fallback_provider,
  rollout_enabled
)
values (
  '<BARBERSHOP_UUID>',
  'asaas',
  'asaas',
  'stripe',
  true
)
on conflict (barbershop_id) do update
set
  subscription_provider = excluded.subscription_provider,
  booking_provider = excluded.booking_provider,
  fallback_provider = excluded.fallback_provider,
  rollout_enabled = excluded.rollout_enabled,
  updated_at = now();
```

## 3) Observabilidade mínima

Dados operacionais:
- `webhook_events`: taxa de sucesso/falha, backlog de eventos
- `payment_history`: divergência por provider e status final
- `subscriptions`: estado de assinatura por provider

Consultas úteis:

```sql
-- Falhas de webhook nas últimas 24h
select provider, count(*) as failures
from webhook_events
where status = 'failed'
  and created_at >= now() - interval '24 hours'
group by provider;
```

```sql
-- Backlog de webhooks pendentes
select provider, count(*) as pending
from webhook_events
where status = 'received'
group by provider;
```

```sql
-- Conversão de pagamentos por provider (24h)
select provider, status, count(*) as total
from payment_history
where created_at >= now() - interval '24 hours'
group by provider, status
order by provider, status;
```

## 4) Rollback imediato por tenant

Se houver incidentes no Asaas:

1. Atualizar tenant para Stripe.
2. Manter `rollout_enabled = true` (roteamento explícito).
3. Confirmar novos checkouts em Stripe.

```sql
update payment_provider_configs
set
  subscription_provider = 'stripe',
  booking_provider = 'stripe',
  fallback_provider = 'stripe',
  updated_at = now()
where barbershop_id = '<BARBERSHOP_UUID>';
```

## 5) Critério de promoção de fase

Promover rollout de 5% -> 25% -> 100% somente se:
- `webhook_events` com sucesso >= 99% em 24h
- sem backlog crescente por mais de 15 minutos
- sem queda de conversão de pagamento acima de 5% vs baseline Stripe
