# Shafar — Sistema inteligente de agendamento para barbearias

**Criação e desenvolvimento:** RonalDigital

> **Status:** em produção · **Build:** `npm run build` · **Última revisão do README:** abril de 2026

SaaS multi-tenant para barbearias: agendamento, painel da barbearia, admin da plataforma, integração com Supabase, pagamentos (PIX, cartão/Stripe conforme configuração) e experiência mobile-first alinhada ao design system do produto.

## Sobre o produto

- Múltiplas barbearias com isolamento de dados (RLS) e URL pública de agendamento por slug  
- Autenticação (Supabase Auth), perfis (admin da barbearia, `platform_admin`, etc.)  
- Assinaturas e billing (ver `docs/BILLING_ROLLOUT_RUNBOOK.md` e `docs/STRIPE_IMPLEMENTATION_GUIDE.md` quando aplicável)  
- UI com React, TypeScript, styled-components e rotas com React Router (HashRouter no `App.tsx`)

## Principais Funcionalidades Recentes

- **Integração Mercado Pago (PIX)**: Fluxo completo de agendamento via PIX. O pagamento cai diretamente na conta do dono da barbearia (OAuth/Multi-tenant) através das nossas Edge Functions, com atualização de status via Webhooks em tempo real.
- **Agenda Inteligente (Anti-Overbooking)**: A interface de agendamentos (`BookingPage`) consulta o banco de dados dinamicamente, ocultando horários já reservados (ou em aguardo de PIX) com base na duração do serviço escolhido e disponibilidade dos profissionais.
- **Experiência Premium & Mobile-First**: Telas de configuração da barbearia (`SettingsPage`) com layout totalmente responsivo, adaptado para uso em smartphones pelos donos, focando em usabilidade comercial e sem jargões técnicos.

## Início rápido

### Requisitos

- Node.js 18+ (recomendado: a versão LTS atual)
- npm
- Projeto Supabase vinculado (URL + anon key)

### Instalação

```bash
git clone <url-do-repositório>
cd barberflow
npm install
cp .env.example .env
# Preencha VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY e demais chaves necessárias
```

### Banco e Supabase

Execute e ajuste os scripts em `docs/sql/` e siga [docs/guides/SUPABASE_SETUP.md](docs/guides/SUPABASE_SETUP.md) e [docs/guides/ENVIRONMENT_SETUP.md](docs/guides/ENVIRONMENT_SETUP.md) conforme o ambiente.

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
| Backend / dados | Supabase (Postgres, Auth, Storage; Edge Functions em `supabase/functions/`) |
| Estado / dados async | TanStack Query |

Estrutura útil:

```
├── App.tsx                 # Rotas principais
├── src/pages/              # Páginas (landing, dashboard, platform, booking…)
├── src/components/         # UI compartilhada (Footer, tema…)
├── src/services/           # APIs / Supabase
├── docs/                   # Guias e SQL
└── supabase/functions/     # Edge Functions (pagamentos, webhooks…)
```

Documentação mais ampla: [docs/README.md](docs/README.md), [docs/guides/PLATFORM_ARCHITECTURE.md](docs/guides/PLATFORM_ARCHITECTURE.md), [docs/guides/MULTI_TENANT_ARCHITECTURE.md](docs/guides/MULTI_TENANT_ARCHITECTURE.md).

## Deploy e variáveis

- Deploy típico na Vercel: variáveis `VITE_*` configuradas no painel do projeto (não commitar secrets).  
- Guia: [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md) e [docs/guides/VERCEL_DEPLOY_GUIDE.md](docs/guides/VERCEL_DEPLOY_GUIDE.md).

### Erro `placeholder.supabase.co` após deploy

As URLs/chaves do Supabase não foram injetadas no build. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no provedor de hospedagem para Production/Preview e faça redeploy.

## Licença

Veja [LICENSE](LICENSE) (MIT, se presente no repositório).

## Créditos

Projeto criado e desenvolvido por **RonalDigital**.  
Rodapé do site: indicação discreta “By RonalDigital” nos componentes de footer.

---

*By RonalDigital*
