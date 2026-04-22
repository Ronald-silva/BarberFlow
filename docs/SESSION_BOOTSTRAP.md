# Session Bootstrap - Shafar

Use este checklist no inicio de qualquer nova sessao para evitar perda de contexto.

## 1) Leitura rapida obrigatoria (3-5 min)
1. `README.md`
2. `AGENTS.md`
3. `docs/README.md`

## 2) Mapa funcional minimo
- Plataforma (admin global): `\/platform/*`
- Barbearia (tenant): `\/dashboard/*`
- Agendamento publico: `\/book/:slug`

## 3) Partes criticas do codigo
- Rotas: `App.tsx`
- Auth e perfil: `src/contexts/AuthContext.tsx`
- Integracao Supabase: `src/services/supabase.ts` e `src/services/supabaseApi.ts`
- Pagamentos: `src/services/paymentService.ts` e `supabase/functions/*`

## 4) Validacao padrao ao editar
- Rodar: `npm run type-check`
- Se alterou fluxo importante: `npm run build`

## 5) Regras de seguranca
- Nao compartilhar valores reais de `.env`.
- Segredos de webhook/API devem ficar em secrets do Supabase/Vercel, nao no frontend.

## 6) Prompt recomendado para abertura de sessao
`Leia AGENTS.md e docs/SESSION_BOOTSTRAP.md antes de iniciar qualquer mudanca.`
