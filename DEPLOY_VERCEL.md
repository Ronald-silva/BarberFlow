# 🚀 Guia de Deploy no Vercel - Configuração das Variáveis de Ambiente

## ⚠️ PROBLEMA: "placeholder.supabase.co" - Variáveis Não Configuradas

Se você está vendo este erro no console:
```
POST https://placeholder.supabase.co/auth/v1/token net::ERR_NAME_NOT_RESOLVED
⚠️ ERRO: Variáveis de ambiente do Supabase não configuradas!
```

**Causa:** As variáveis de ambiente do arquivo `.env` **NÃO são enviadas** automaticamente no deploy. Você precisa configurá-las manualmente no Vercel.

---

## 📋 Passo a Passo - Configurar Variáveis de Ambiente no Vercel

### 1. Acesse o Dashboard do Vercel
1. Vá para: https://vercel.com/dashboard
2. Faça login com sua conta
3. Selecione o projeto **BarberFlow**

### 2. Configure as Variáveis de Ambiente
1. No projeto, clique na aba **"Settings"** (Configurações)
2. No menu lateral, clique em **"Environment Variables"**
3. Adicione as seguintes variáveis **UMA POR UMA**:

#### ✅ Variáveis OBRIGATÓRIAS (Supabase):

**Nome:** `VITE_SUPABASE_URL`
**Valor:** `https://jrggwhlbvsyvcqvywrmy.supabase.co`
**Ambiente:** ☑️ Production ☑️ Preview ☑️ Development

**Nome:** `VITE_SUPABASE_ANON_KEY`
**Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2d3aGxidnN5dmNxdnl3cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg4MTEsImV4cCI6MjA3NjAzNDgxMX0.Y4bUnGmgGgPnwO1SVFbq6k2yZJN7wcY01JxKBAImQKk`
**Ambiente:** ☑️ Production ☑️ Preview ☑️ Development

---

#### 📌 Como Adicionar Cada Variável:
1. Clique no botão **"Add New"** ou **"Add"**
2. Em **"Key"** (Nome), digite: `VITE_SUPABASE_URL`
3. Em **"Value"** (Valor), cole: `https://jrggwhlbvsyvcqvywrmy.supabase.co`
4. Marque todos os ambientes: **Production**, **Preview** e **Development**
5. Clique em **"Save"**
6. Repita para `VITE_SUPABASE_ANON_KEY`

---

### 3. Fazer Novo Deploy (Redeploy)

Após configurar as variáveis, você precisa fazer um novo deploy:

#### Opção A - Pelo Dashboard do Vercel:
1. Vá na aba **"Deployments"**
2. Clique nos **três pontinhos (...)** do último deploy
3. Clique em **"Redeploy"**
4. Aguarde o build terminar (1-2 minutos)

#### Opção B - Pelo Terminal (Push Git):
```bash
git add .
git commit -m "Atualizar configurações"
git push origin main
```

---

### 4. Verificar se Funcionou

Após o deploy terminar:

1. **Abra o site** no endereço do Vercel
2. **Abra o Console do Navegador** (F12 → Console)
3. **Recarregue a página** (F5)
4. **Verifique os logs:**
   - ✅ **CORRETO:** Não deve aparecer erro de "placeholder.supabase.co"
   - ✅ **CORRETO:** Não deve aparecer "Variáveis de ambiente não configuradas"
   - ❌ **ERRADO:** Se ainda aparecer "placeholder.supabase.co", volte ao passo 2

5. **Teste o login:**
   - Tente fazer login com um usuário cadastrado
   - Deve funcionar normalmente

6. **Teste o cadastro:**
   - Clique em "Cadastrar Nova Barbearia"
   - Preencha os dados e tente cadastrar
   - Deve funcionar normalmente

---

## 🔍 Verificar Variáveis Configuradas

Para ver se as variáveis foram configuradas corretamente:

1. Vá em **Settings → Environment Variables** no Vercel
2. Você deve ver:
   ```
   VITE_SUPABASE_URL          Production, Preview, Development
   VITE_SUPABASE_ANON_KEY     Production, Preview, Development
   ```

---

## ⚡ Variáveis Opcionais (Configure depois se necessário)

Estas variáveis são opcionais e podem ser configuradas mais tarde:

### Stripe (Pagamentos):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_seu_publishable_key_aqui
```

### Sentry (Monitoramento de Erros):
```
VITE_SENTRY_DSN=seu_sentry_dsn_aqui
VITE_ENVIRONMENT=production
```

### Twilio (WhatsApp e SMS):
```
VITE_TWILIO_ACCOUNT_SID=seu_twilio_account_sid_aqui
VITE_TWILIO_AUTH_TOKEN=seu_twilio_auth_token_aqui
VITE_TWILIO_WHATSAPP_NUMBER=+14155238886
VITE_TWILIO_PHONE_NUMBER=+15017122661
```

### PIX e Crypto (Pagamentos Alternativos):
```
VITE_PIX_KEY=sua_chave_pix_aqui
VITE_BITCOIN_ADDRESS=seu_endereco_bitcoin_aqui
VITE_BITCOIN_ENABLED=false
VITE_USDT_ADDRESS=seu_endereco_usdt_trc20_aqui
VITE_USDT_ENABLED=false
```

---

## 🛠️ Comandos Úteis

### Build local para testar antes do deploy:
```bash
npm run build
```

### Testar o build localmente:
```bash
npm run preview
```

### Ver logs do Vercel:
```bash
vercel logs
```

---

## 📱 URLs do Projeto

Após configurar e fazer deploy, adicione estas URLs no Supabase:

1. Acesse: https://app.supabase.com
2. Vá em **Authentication → URL Configuration**
3. Adicione em **"Redirect URLs"**:
   - `https://seu-projeto.vercel.app/login`
   - `https://seu-projeto.vercel.app/dashboard`
   - `http://localhost:5173/login` (para desenvolvimento)

---

## ❌ Erros Comuns

### Erro: "Module not found" após deploy
**Solução:** Rode `npm install` localmente e faça commit do `package-lock.json`

### Erro: Variáveis ainda não aparecem
**Solução:**
1. Certifique-se de marcar todos os ambientes (Production, Preview, Development)
2. Faça um novo deploy (Redeploy)
3. Aguarde 1-2 minutos para o build terminar
4. Limpe o cache do navegador (Ctrl+Shift+Del)

### Erro: "Failed to fetch" mesmo com variáveis configuradas
**Solução:**
1. Verifique se as variáveis estão com os nomes EXATOS (com `VITE_` no início)
2. Verifique se não há espaços antes/depois dos valores
3. Verifique se o Supabase está online: https://status.supabase.com

---

## 📞 Suporte

Se ainda estiver com problemas:
1. Verifique os logs no Vercel: **Deployments → Ver último deploy → Function Logs**
2. Verifique o console do navegador (F12)
3. Certifique-se de que seguiu TODOS os passos acima
4. Verifique se o Supabase está configurado corretamente (veja `CONFIGURACAO_SUPABASE_AUTH.md`)

---

## ✅ Checklist Completo

- [ ] Configurei `VITE_SUPABASE_URL` no Vercel
- [ ] Configurei `VITE_SUPABASE_ANON_KEY` no Vercel
- [ ] Marquei todos os ambientes (Production, Preview, Development)
- [ ] Fiz redeploy no Vercel
- [ ] Aguardei o build terminar
- [ ] Abri o site e verifiquei que não há erro de "placeholder.supabase.co"
- [ ] Testei o login e funcionou
- [ ] Testei o cadastro e funcionou
- [ ] Configurei as URLs no Supabase (Authentication → URL Configuration)

**Pronto! Seu BarberFlow está no ar! 🎉**
