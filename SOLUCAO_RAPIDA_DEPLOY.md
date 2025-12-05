# ⚡ Solução Rápida - Login e Cadastro Não Funcionam no Deploy

## 🔴 Problema

Você fez deploy no Vercel mas o login e cadastro não funcionam. No console do navegador (F12) você vê:

```
POST https://placeholder.supabase.co/auth/v1/token net::ERR_NAME_NOT_RESOLVED
⚠️ ERRO: Variáveis de ambiente do Supabase não configuradas!
```

---

## ✅ Solução em 5 Passos

### 1️⃣ Acesse o Vercel Dashboard

Abra: https://vercel.com/dashboard

- Faça login
- Selecione o projeto **BarberFlow**

---

### 2️⃣ Configure as Variáveis de Ambiente

1. Clique na aba **"Settings"** (Configurações)
2. No menu lateral, clique em **"Environment Variables"**
3. Clique em **"Add New"**

**Adicione estas 2 variáveis:**

#### Variável 1:
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://jrggwhlbvsyvcqvywrmy.supabase.co`
- **Environments:** ☑️ Production ☑️ Preview ☑️ Development
- Clique em **Save**

#### Variável 2:
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2d3aGxidnN5dmNxdnl3cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg4MTEsImV4cCI6MjA3NjAzNDgxMX0.Y4bUnGmgGgPnwO1SVFbq6k2yZJN7wcY01JxKBAImQKk`
- **Environments:** ☑️ Production ☑️ Preview ☑️ Development
- Clique em **Save**

---

### 3️⃣ Faça Redeploy

1. Vá na aba **"Deployments"**
2. No último deploy, clique nos **3 pontinhos (...)**
3. Clique em **"Redeploy"**
4. Aguarde 1-2 minutos até o build terminar

---

### 4️⃣ Configure o Supabase (Importante!)

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Authentication → Settings**
4. Procure por **"Enable email confirmations"**
5. **DESABILITE** esta opção (para desenvolvimento)
6. Clique em **Save**

---

### 5️⃣ Teste o Site

1. Abra o site do Vercel
2. Pressione **F12** para abrir o Console
3. Recarregue a página (F5)
4. **Verifique que NÃO aparece mais:**
   - ❌ "placeholder.supabase.co"
   - ❌ "Variáveis de ambiente não configuradas"
5. **Teste o login** com um usuário existente
6. **Teste o cadastro** de uma nova barbearia

---

## 🎯 Checklist de Verificação

- [ ] Configurei `VITE_SUPABASE_URL` no Vercel
- [ ] Configurei `VITE_SUPABASE_ANON_KEY` no Vercel
- [ ] Marquei TODOS os ambientes (Production, Preview, Development)
- [ ] Fiz Redeploy
- [ ] Aguardei o build terminar (não tem mais "Building...")
- [ ] Desabilitei "Enable email confirmations" no Supabase
- [ ] Abri o site e verifiquei o console (F12)
- [ ] NÃO aparece mais erro de "placeholder.supabase.co"
- [ ] Login funciona ✅
- [ ] Cadastro funciona ✅

---

## 🆘 Ainda Não Funciona?

### Se ainda vê "placeholder.supabase.co":

1. **Verifique se as variáveis estão salvas:**
   - Vercel Dashboard → Settings → Environment Variables
   - Deve mostrar as 2 variáveis configuradas

2. **Limpe o cache:**
   - Pressione Ctrl+Shift+Del
   - Marque "Cached images and files"
   - Clique em "Clear data"
   - Recarregue a página (F5)

3. **Verifique o nome das variáveis:**
   - Deve ser EXATAMENTE: `VITE_SUPABASE_URL` (com `VITE_` no início)
   - Deve ser EXATAMENTE: `VITE_SUPABASE_ANON_KEY` (com `VITE_` no início)
   - Vite só reconhece variáveis que começam com `VITE_`

---

### Se vê "Invalid login credentials" ou erro de senha:

1. **Cadastre um novo usuário:**
   - Clique em "Cadastrar Nova Barbearia"
   - Preencha TODOS os campos
   - Use um email que você nunca usou antes
   - Senha com pelo menos 6 caracteres

2. **Se o cadastro não funcionar:**
   - Verifique se desabilitou "Enable email confirmations" no Supabase
   - Veja [CONFIGURACAO_SUPABASE_AUTH.md](CONFIGURACAO_SUPABASE_AUTH.md)

---

### Se aparecer erro de "Failed to fetch":

1. **Verifique se o Supabase está online:**
   - Acesse: https://status.supabase.com
   - Deve estar tudo verde

2. **Verifique se a URL do Supabase está correta:**
   - Deve ser: `https://jrggwhlbvsyvcqvywrmy.supabase.co`
   - SEM barra `/` no final

---

## 📚 Documentação Completa

Se precisar de mais detalhes:

- **Deploy no Vercel:** [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)
- **Configuração do Supabase:** [CONFIGURACAO_SUPABASE_AUTH.md](CONFIGURACAO_SUPABASE_AUTH.md)
- **README Geral:** [README.md](README.md)

---

## ⚡ Script Automático (Opcional)

Se preferir configurar via linha de comando:

**Windows:**
```bash
setup-vercel-env.bat
```

**Linux/Mac:**
```bash
chmod +x setup-vercel-env.sh
./setup-vercel-env.sh
```

---

**🎉 Pronto! Agora seu BarberFlow deve estar funcionando perfeitamente!**
