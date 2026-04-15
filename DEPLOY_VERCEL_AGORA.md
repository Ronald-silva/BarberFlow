# 🚀 Deploy no Vercel - Guia Rápido

**Tempo**: 10 minutos
**Pré-requisito**: SQL executado no Supabase

---

## 📋 OPÇÃO 1: Deploy via Interface Web (Mais Fácil)

### 1. Acesse o Vercel

https://vercel.com/new

### 2. Conecte seu Repositório

- Se o projeto está no GitHub: Clique em **"Import Git Repository"**
- Se não está no Git ainda: Clique em **"Deploy from CLI"** (veja Opção 2)

### 3. Configure o Projeto

**Framework Preset**: Vite
**Root Directory**: `./` (raiz)
**Build Command**: `npm run build`
**Output Directory**: `dist`

### 4. Adicione as Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```
VITE_SUPABASE_URL=https://knlvbuucymqkzdxuvamy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubHZidXVjeW1xa3pkeHV2YW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NDkyOTgsImV4cCI6MjA5MDMyNTI5OH0.aAqy5k6yLY0rQe4yDjqC5fFja8mpnL5gRL-N86rDAeg
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SZOdSRploqdXT9ji9sUCxAp1ONUeAeE4IqgBZbiORfbHPOq66ESR7efd6mybAn5JVJVOFewizNN9dbMbnNz8Od5006OpHyuYJ
VITE_STRIPE_PRICE_BASIC_MONTHLY=price_price_1Sk2OkRwJh1khCyJZOHNcdiy
VITE_STRIPE_PRICE_BASIC_YEARLY=price_1Sk2AbRwJh1khCyJn1ezvWeH
VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_1Sk2NRRwJh1khCyJLLV99Zhv
VITE_STRIPE_PRICE_PROFESSIONAL_YEARLY=price_1Sk2CYRwJh1khCyJjREI6ZKF
VITE_STRIPE_PRICE_PREMIUM_MONTHLY=price_1Sk2LgRwJh1khCyJGWi58LW9
VITE_STRIPE_PRICE_PREMIUM_YEARLY=price_1Sk2E6RwJh1khCyJyYRpWtl4
VITE_EMAIL_FROM=noreply@shafar.com.br
VITE_EMAIL_FROM_NAME=Shafar
VITE_ENVIRONMENT=production
```

**Marque**: ✅ Production ✅ Preview ✅ Development

### 5. Deploy

Clique em **"Deploy"**

Aguarde 2-3 minutos. Você receberá uma URL tipo: `https://seu-projeto.vercel.app`

---

## 📋 OPÇÃO 2: Deploy via CLI (Mais Rápido)

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Deploy

```bash
vercel --prod
```

O CLI vai perguntar algumas coisas:
- **Set up and deploy?** → Yes
- **Which scope?** → Sua conta
- **Link to existing project?** → No
- **Project name?** → shafar (ou o que quiser)
- **Directory?** → ./ (Enter)
- **Override settings?** → No

### 4. Configurar Variáveis

Depois do primeiro deploy, configure as variáveis:

```bash
# Copie e cole cada linha (uma por vez)
vercel env add VITE_SUPABASE_URL production
# Cole o valor: https://knlvbuucymqkzdxuvamy.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Cole o valor do .env

vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Cole o valor do .env

# ... repita para todas as variáveis VITE_*
```

### 5. Redeploy

```bash
vercel --prod
```

---

## ✅ VERIFICAR SE FUNCIONOU

### 1. Acesse a URL do Vercel

Exemplo: `https://shafar.vercel.app`

### 2. Teste o Login

1. Clique em **"Entrar"**
2. Faça login com uma conta existente
3. ✅ Deve funcionar normalmente
4. Dê F5 na página
5. ✅ Deve continuar logado (sessão persiste)

### 3. Teste o Cadastro

1. Clique em **"Criar conta grátis"**
2. Preencha os dados
3. ✅ Deve criar a barbearia
4. ✅ Deve redirecionar para o dashboard

### 4. Teste o Agendamento

1. Acesse: `https://shafar.vercel.app/#/book/sua-barbearia`
2. Faça um agendamento de teste
3. ✅ Deve funcionar normalmente

---

## 🎯 O QUE VAI FUNCIONAR SEM O STRIPE

### ✅ Funcionando:
- Login e cadastro
- Dashboard completo
- Agendamentos
- Gestão de clientes
- Gestão de serviços
- Gestão de profissionais
- Upload de logo
- Configurações
- Logs LGPD
- Notificações por email (se configurou Resend)

### ⏳ Não vai funcionar (precisa Stripe):
- Página de pricing (vai mostrar os planos mas não vai processar pagamento)
- Checkout de assinaturas
- Portal do cliente
- Gestão de cobranças

**Mas isso não impede você de usar o sistema!** Você pode:
- Cadastrar barbearias manualmente
- Gerenciar tudo pelo dashboard
- Fazer demos e apresentações
- Validar o produto com clientes

---

## 🔧 DEPOIS DO DEPLOY

### Configurar Domínio Personalizado (Opcional)

1. No Vercel Dashboard, vá em **Settings** → **Domains**
2. Adicione seu domínio: `shafar.com.br`
3. Configure o DNS conforme instruções
4. Aguarde propagação (5-30 minutos)

### Configurar HTTPS (Automático)

O Vercel configura SSL automaticamente. Nada a fazer! ✅

---

## 📊 CHECKLIST

- [ ] Deploy executado (Vercel ou CLI)
- [ ] Variáveis de ambiente configuradas
- [ ] Site acessível na URL do Vercel
- [ ] Login testado e funcionando
- [ ] Cadastro testado e funcionando
- [ ] Dashboard acessível
- [ ] Agendamento funcionando

---

**Depois de deployar, me avise que eu te ajudo a testar tudo!** 🚀
