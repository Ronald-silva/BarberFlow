# Deploy do Shafar na Vercel

## ⚠️ AVISO CRÍTICO

**Este projeto NÃO está pronto para produção real.** Use apenas para:
- ✅ Demos para investidores/clientes
- ✅ Testes de interface
- ✅ Validação de mercado
- ❌ **NÃO para clientes reais pagantes**

Ver [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) para detalhes completos.

---

## 📋 Pré-requisitos

- Conta na Vercel (grátis: https://vercel.com)
- Conta no Supabase (grátis: https://supabase.com)
- Git instalado
- Repositório do projeto no GitHub/GitLab/Bitbucket

---

## 🚀 Passo 1: Preparar o Repositório

```bash
# 1. Inicializar Git (se ainda não fez)
git init

# 2. Adicionar tudo
git add .

# 3. Commit inicial
git commit -m "feat: deploy inicial para Vercel"

# 4. Criar repositório no GitHub e conectar
git remote add origin https://github.com/seu-usuario/shafar.git
git branch -M main
git push -u origin main
```

---

## 🔧 Passo 2: Configurar Supabase

### 2.1 Garantir que o banco está acessível

No painel do Supabase (https://supabase.com/dashboard):

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** (exemplo: https://jrggwhlbvsyvcqvywrmy.supabase.co)
   - **anon public key**

### 2.2 Verificar tabelas criadas

Execute as migrations se ainda não fez:

```sql
-- Ver schema-detailed.sql para criar todas as tabelas
-- Ver fix-platform-admin-role.sql para adicionar role platform_admin
```

---

## 🌐 Passo 3: Deploy na Vercel

### 3.1 Conectar o repositório

1. Acesse https://vercel.com
2. Clique em **Add New** → **Project**
3. Selecione seu repositório do GitHub
4. A Vercel detecta automaticamente que é um projeto Vite

### 3.2 Configurar Build Settings

A Vercel detecta automaticamente:
- **Framework Preset:** Vite
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

✅ **Não precisa alterar nada**, o `vercel.json` já está configurado corretamente.

### 3.3 Configurar Environment Variables

Na seção **Environment Variables**, adicione:

#### **Obrigatórias (Supabase):**
```env
VITE_SUPABASE_URL=https://jrggwhlbvsyvcqvywrmy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Opcionais (para funcionalidades futuras):**
```env
# Pagamentos (quando implementar)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_PIX_KEY=sua_chave_pix

# Notificações WhatsApp (quando implementar)
VITE_TWILIO_ACCOUNT_SID=...
VITE_TWILIO_AUTH_TOKEN=...

# Monitoramento (quando implementar)
VITE_SENTRY_DSN=...
VITE_ENVIRONMENT=production
```

### 3.4 Deploy

Clique em **Deploy** e aguarde 2-3 minutos.

✅ **Seu site estará disponível em:** `https://shafar.vercel.app` (ou URL customizada)

---

## 🔄 Passo 4: Deploys Automáticos

A partir de agora, cada push para `main` faz deploy automático:

```bash
# Fazer alterações
git add .
git commit -m "feat: nova funcionalidade"
git push

# Vercel detecta e faz deploy automaticamente
```

---

## 🌍 Passo 5: Domínio Customizado (Opcional)

1. Na Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio (exemplo: `shafar.com.br`)
3. Configure o DNS conforme instruções da Vercel
4. SSL é configurado automaticamente

---

## ✅ Verificar se está funcionando

Após o deploy, teste:

### 1. Landing Page
- Acesse: `https://seu-site.vercel.app`
- ✅ Deve carregar a página principal

### 2. Booking Page
- Acesse: `https://seu-site.vercel.app/#/booking`
- ✅ Deve carregar o formulário de agendamento

### 3. Login como Platform Admin
- Acesse: `https://seu-site.vercel.app/#/login`
- Use: `admin@barber.com` / qualquer senha
- ✅ Deve redirecionar para `/platform`

### 4. Dashboard Admin
- ✅ Analytics, Suporte e Configurações devem carregar

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch"

**Causa:** Environment variables do Supabase não configuradas

**Solução:**
1. Vá em **Settings** → **Environment Variables**
2. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Faça **Redeploy**

### Erro: "This route does not exist"

**Causa:** Vercel não está servindo o SPA corretamente

**Solução:**
- Verifique que o `vercel.json` existe na raiz
- Deve ter a rota catch-all: `{"src": "/(.*)", "dest": "/index.html"}`

### Build falha com "command not found"

**Causa:** Node version incompatível

**Solução:**
1. Vá em **Settings** → **General**
2. Altere **Node.js Version** para `20.x` (LTS)

---

## 📊 Monitoramento (Futuro)

Quando estiver pronto para produção, configure:

1. **Sentry** (erro tracking)
2. **Google Analytics** (uso)
3. **Vercel Analytics** (performance)

---

## 💰 Custos

### Plano Gratuito da Vercel

✅ **Suficiente para demos/MVPs:**
- 100GB bandwidth/mês
- 100 builds/dia
- SSL grátis
- Domínio customizado grátis

### Plano Pro ($20/mês)

Necessário quando tiver:
- >100GB bandwidth
- >1000 builds/mês
- Precisa de analytics avançados

---

## 🔐 Segurança CRÍTICA

### ⚠️ ANTES DE IR PARA PRODUÇÃO REAL

1. **Implementar autenticação real**
   - Atualmente qualquer senha funciona!
   - Ver [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md#1-autentica%C3%A7%C3%A3o-e-seguran%C3%A7a)

2. **Implementar pagamentos reais**
   - Integrar Stripe
   - Integrar PIX via Mercado Pago/Asaas

3. **Configurar RLS no Supabase**
   - Proteger dados sensíveis
   - Ver `database/rls-policies.sql`

4. **Conformidade LGPD**
   - Termos de uso
   - Política de privacidade
   - Consentimento de dados

---

## 📝 Próximos Passos

1. ✅ **Deploy feito** - Site rodando na Vercel
2. ⏳ **Implementar autenticação real** (crítico!)
3. ⏳ **Integrar pagamentos** (Stripe + PIX)
4. ⏳ **Configurar RLS** (segurança de dados)
5. ⏳ **Documentos legais** (LGPD)

**Tempo estimado até produção:** 2-3 meses de desenvolvimento

---

## 📚 Documentação Relacionada

- [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) - Análise completa de prontidão
- [SIMPLIFICACAO_PAGAMENTOS.md](./SIMPLIFICACAO_PAGAMENTOS.md) - Decisão sobre métodos de pagamento
- [ARQUITETURA_MULTI_TENANT.md](./ARQUITETURA_MULTI_TENANT.md) - Como funciona o multi-tenant
- [ADMIN_PLATFORM_SETUP.md](./ADMIN_PLATFORM_SETUP.md) - Setup do admin platform

---

## 🆘 Suporte

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Issues do projeto: [Criar um issue no GitHub]
