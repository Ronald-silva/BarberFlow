# Shafar — Sistema inteligente de agendamento para barbearias

**Criação e desenvolvimento:** RonalDigital

> **Status:** em produção · **Build:** `npm run build` · **Última revisão do README:** maio de 2026

SaaS multi-tenant para barbearias: agendamento público, painel da barbearia, admin da plataforma, Supabase (Postgres + Auth + Edge Functions) e pagamentos (PIX Mercado Pago na conta da barbearia; assinatura SaaS via Stripe/Asaas conforme rollout).

## Sobre o produto

- Múltiplas barbearias com isolamento de dados (RLS) e agendamento público em `/book/:slug`
- Autenticação Supabase Auth — perfis `admin`, `member`, `platform_admin`
- UI: React 19, TypeScript, styled-components, **React Router (`BrowserRouter` em `App.tsx`)**
- Links antigos `/#/...` são redirecionados automaticamente para URLs limpas

### Rotas principais

| Rota | Uso |
|------|-----|
| `/` | Landing |
| `/register`, `/login` | Cadastro e acesso da barbearia |
| `/book/:slug` | Agendamento público (cliente final) |
| `/dashboard/*` | Operação da barbearia |
| `/platform/*` | Administração da plataforma |

## Agendamento público (`/book/:slug`)

Dois modos por barbearia (configurável em **Configurações**):

| Modo | Quando | Backend |
|------|--------|---------|
| **PIX (Mercado Pago)** | MP conectado; opcionalmente “pagamento obrigatório” | Edge Function `create-reserva-pix` → webhook `mercadopago-webhook` → polling `check-reserva-status` |
| **Pagar na barbearia** | Padrão para novas barbearias / quando PIX não é obrigatório | Edge Function `create-pay-at-shop-booking` (preço e anti-overbooking no servidor) |

**Anti-overbooking:** horários ocupados vêm da RPC `get_public_occupied_slots` (reservas + agendamentos + appointments). A UI filtra slots pela duração do serviço (+ 5 min de limpeza no servidor).

**Onboarding (dashboard):** checklist “Primeiros passos”, link de agendamento copiável, horários seed no cadastro, mensagem de sucesso no login após `/register`.

## Edge Functions (booking / PIX — deploy)

Funções usadas pelo fluxo atual de agendamento. No Supabase Dashboard, cada uma deve ser um único arquivo `index.ts` (sem imports de `_shared`).

| Função | Papel |
|--------|--------|
| `create-reserva-pix` | Cria reserva + PIX (valor calculado no servidor) |
| `create-pay-at-shop-booking` | Confirma agendamento “pagar na barbearia” |
| `check-reserva-status` | Polling do status da reserva PIX |
| `mercadopago-webhook` | Confirma pagamento e cria `agendamentos` |
| `mercadopago-oauth-callback` | OAuth MP → redirect `/dashboard/settings?...` |

Outras funções no projeto (`stripe-webhook`, `create-checkout-session`, `asaas-*`, etc.) servem assinatura SaaS ou fluxos legados — não substituem a tabela acima no `/book`.

### Migrations relevantes (SQL Editor)

- `supabase/migrations/20260508180000_public_barbershop_mercadopago_flag.sql` — flag pública `mercadopago_configured`
- `supabase/migrations/20260529120000_public_occupied_slots_rpc.sql` — RPC `get_public_occupied_slots`

## Início rápido

### Requisitos

- Node.js 18+ (LTS recomendado)
- npm
- Projeto Supabase (URL + anon key)

### Instalação

```bash
git clone <url-do-repositório>
cd barberflow
npm install
cp .env.example .env
# Preencha VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY e demais chaves necessárias
```

### Banco e Supabase

Execute migrations em `supabase/migrations/` e siga [docs/guides/SUPABASE_SETUP.md](docs/guides/SUPABASE_SETUP.md) e [docs/guides/ENVIRONMENT_SETUP.md](docs/guides/ENVIRONMENT_SETUP.md).

**Importante:** para reduzir pausa do projeto free tier por inatividade, veja [docs/EVITAR_PAUSA_SUPABASE.md](docs/EVITAR_PAUSA_SUPABASE.md) e [docs/CONFIGURAR_GITHUB_ACTIONS.md](docs/CONFIGURAR_GITHUB_ACTIONS.md).

### Comandos

```bash
npm run dev          # Desenvolvimento (Vite)
npm run build        # Build de produção
npm run preview      # Servir pasta dist
npm run type-check   # TypeScript (tsc --noEmit)
npm run ci:check     # type-check + build + pre-deploy
```

Scripts auxiliares: `npm run api:mock` / `npm run api:supabase` para alternar origem dos dados em desenvolvimento.

## Arquitetura (resumo)

| Camada | Stack |
|--------|--------|
| Frontend | React 19, TypeScript, Vite 6, styled-components 6 |
| Backend / dados | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Estado / dados async | TanStack Query |
| Erros (opcional) | Sentry via `VITE_SENTRY_DSN` + `VITE_ENVIRONMENT` |

```
├── App.tsx                 # Rotas (BrowserRouter)
├── src/pages/              # Landing, dashboard, platform, booking…
├── src/services/           # supabaseApi, pagamentos…
├── supabase/functions/     # Edge Functions
└── supabase/migrations/    # Schema e RPCs
```

Documentação: [docs/README.md](docs/README.md), [AGENTS.md](AGENTS.md), [docs/SESSION_BOOTSTRAP.md](docs/SESSION_BOOTSTRAP.md), [docs/guides/PLATFORM_ARCHITECTURE.md](docs/guides/PLATFORM_ARCHITECTURE.md).

## Deploy e variáveis

- **Frontend:** Vercel — variáveis `VITE_*` no painel (nunca commitar secrets). Guias: [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md).
- **Edge Functions:** redeploy no Supabase após alterar `supabase/functions/*/index.ts`.
- **Produção (opcional):** `VITE_SENTRY_DSN`, `VITE_ENVIRONMENT=production`, `VITE_MERCADOPAGO_CLIENT_ID`.

### Erro `placeholder.supabase.co` após deploy

`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` não foram injetadas no build. Configure no provedor e faça redeploy.

## Licença

Veja [LICENSE](LICENSE) (MIT, se presente no repositório).

## Créditos

Projeto criado e desenvolvido por **RonalDigital**.  
Rodapé do site: indicação discreta “By RonalDigital” nos componentes de footer.

---

*By RonalDigital*
