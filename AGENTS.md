# AGENTS.md - Contexto Persistente do Projeto Shafar

## Objetivo do produto
- SaaS multi-tenant para barbearias (agendamento, operação da barbearia e administração da plataforma).
- Frontend em React + TypeScript + Vite.
- Backend/data em Supabase (Auth, Postgres, RLS, Storage, Edge Functions).

## Rotas e domínios principais
- `\/platform/*`: operação de plataforma (visão global de barbearias/assinaturas).
- `\/dashboard/*`: operação de cada barbearia (agenda, clientes, serviços, profissionais).
- `\/book/:slug`: fluxo público de agendamento por barbearia.

## Stack e arquitetura
- UI: React 19, styled-components, React Router.
- Dados assíncronos: TanStack Query.
- Serviços de dados: `src/services/supabaseApi.ts` e módulos correlatos em `src/services/`.
- Integrações de pagamento via Edge Functions em `supabase/functions/` (Stripe, Asaas, Mercado Pago).

## Regras operacionais para agentes
1. Antes de iniciar tarefas, ler `README.md` e `docs/SESSION_BOOTSTRAP.md`.
2. Não expor segredos de `.env` em respostas.
3. Priorizar mudanças pequenas e específicas, mantendo padrão existente do projeto.
4. Após alterações relevantes, validar com `npm run type-check` (e build quando fizer sentido).
5. Em dúvidas de arquitetura/fluxo, usar os guias em `docs/guides/`.

## Comandos úteis
- `npm run dev`
- `npm run type-check`
- `npm run build`
- `npm run ci:check`

## Fontes de verdade da documentação
- `README.md`
- `docs/README.md`
- `docs/guides/PLATFORM_ARCHITECTURE.md`
- `docs/guides/MULTI_TENANT_ARCHITECTURE.md`
- `docs/BILLING_ROLLOUT_RUNBOOK.md`
