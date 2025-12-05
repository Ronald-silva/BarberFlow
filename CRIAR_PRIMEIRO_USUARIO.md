# 🔑 Criar Primeiro Usuário - Guia Completo

## ✅ Problema Atual

Você configurou as variáveis de ambiente corretamente (✅), mas recebe:
```
Erro de autenticação: Invalid login credentials
```

**Causa:** O usuário `admin@barber.com` não existe no Supabase Auth.

---

## 🎯 Escolha uma Opção

### **Opção 1: Cadastrar pelo Site** ⭐ RECOMENDADO

É a forma mais fácil e segura!

#### Passo a Passo:

1. **Abra o site do Vercel**
2. **Na página de login, limpe os campos** (remova admin@barber.com)
3. **Clique em "Cadastrar Nova Barbearia"**
4. **Preencha TODOS os dados:**

   **Passo 1 - Informações da Barbearia:**
   - Nome da Barbearia: `Minha Barbearia`
   - URL da Barbearia: `minha-barbearia` (será gerado automaticamente)
   - Endereço Completo: `Rua Exemplo, 123 - Centro`
   - Telefone: `(11) 99999-9999`
   - Email da Barbearia: `contato@minhabarbearia.com`
   - **Clique em "Próximo Passo"**

   **Passo 2 - Dados do Administrador:**
   - Nome Completo: `Seu Nome`
   - Email de Login: `seu@email.com` ← **USE UM EMAIL REAL SEU!**
   - Senha: `senha123` (mínimo 6 caracteres)
   - **Clique em "Criar Barbearia"**

5. **Aguarde a mensagem de sucesso**
6. **Faça login** com o email e senha que você cadastrou

---

### **Opção 2: Criar Manualmente no Supabase**

Se quiser usar especificamente `admin@barber.com`:

#### 1. Criar Usuário no Supabase Auth

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Authentication → Users**
4. Clique em **"Add User"** ou **"Invite User"**
5. Preencha:
   - **Email:** `admin@barber.com`
   - **Password:** `123456`
   - **Confirm Password:** `123456`
   - ☑️ **Auto Confirm User** ← **IMPORTANTE: Marque esta opção!**
6. Clique em **"Create User"** ou **"Send Invitation"**
7. **Copie o UUID** do usuário criado (você vai precisar)

#### 2. Criar Barbearia e Vincular Usuário

1. No Supabase, vá em **SQL Editor**
2. Clique em **"New Query"**
3. Cole o conteúdo do arquivo **[criar-usuario-admin.sql](criar-usuario-admin.sql)**
4. **SUBSTITUA** os valores:
   - `SEU_UUID_AQUI` → UUID do usuário (passo 1)
   - `SEU_BARBERSHOP_ID_AQUI` → ID da barbearia (será gerado)
5. Execute o script **EM PARTES** (siga os comentários no arquivo)

#### 3. Teste o Login

- Email: `admin@barber.com`
- Senha: `123456`

---

## 🔍 Verificar Se Funcionou

### No Supabase Dashboard:

1. **Authentication → Users**
   - ✅ Deve aparecer seu usuário
   - ✅ Status: **Confirmed** (não "Waiting for verification")

2. **Table Editor → users**
   - ✅ Deve ter um registro com seu email
   - ✅ Coluna `barbershop_id` preenchida

3. **Table Editor → barbershops**
   - ✅ Deve ter sua barbearia

---

## ⚠️ IMPORTANTE: Confirmação de Email

Se você criou o usuário mas ainda dá erro de login:

### Opção A: Desabilitar Confirmação de Email (Desenvolvimento)

1. Supabase Dashboard → **Authentication → Settings**
2. Procure: **"Enable email confirmations"**
3. **DESABILITE** esta opção
4. Clique em **Save**
5. Tente fazer login novamente

### Opção B: Confirmar Email Manualmente

1. Supabase Dashboard → **Authentication → Users**
2. Encontre seu usuário
3. Clique nos **3 pontinhos (...)**
4. Clique em **"Confirm Email"**
5. Tente fazer login novamente

---

## 🐛 Troubleshooting

### Erro: "Invalid login credentials"

**Possíveis causas:**

1. **Email não confirmado**
   - Solução: Desabilite confirmação de email OU confirme manualmente (ver acima)

2. **Usuário não existe no Supabase Auth**
   - Verifique: Authentication → Users
   - Se não aparecer, crie o usuário novamente

3. **Senha incorreta**
   - Use exatamente a senha que você configurou
   - Mínimo 6 caracteres

4. **Usuário existe no Auth mas não na tabela `users`**
   - Execute o script SQL para vincular (Opção 2, passo 2)

### Erro: "Email rate limit exceeded"

Se você tentou várias vezes:
- Aguarde 1 hora
- Ou use outro email

### Erro: Cadastro não funciona

1. **Verifique o console (F12)**
2. **Procure erros vermelhos**
3. **Verifique se desabilitou "Email confirmations"**
4. **Tente com outro email**

---

## 📊 Checklist de Verificação

Antes de tentar fazer login, verifique:

- [ ] Variáveis de ambiente configuradas no Vercel (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
- [ ] Fiz redeploy após configurar as variáveis
- [ ] Não aparece mais "placeholder.supabase.co" no console
- [ ] Confirmação de email DESABILITADA no Supabase (ou usuário confirmado manualmente)
- [ ] Usuário existe em Authentication → Users
- [ ] Usuário está com status "Confirmed" (não "Waiting for verification")
- [ ] Tentei cadastrar uma nova barbearia pelo site (Opção 1)

---

## 🎯 Recomendação Final

**Use a Opção 1** (cadastrar pelo site). É:
- ✅ Mais fácil
- ✅ Mais segura
- ✅ Testa o fluxo completo de cadastro
- ✅ Cria todos os dados necessários automaticamente

Se ainda assim não funcionar:
1. Abra o console (F12)
2. Copie TODOS os erros vermelhos
3. Envie para análise

---

**Boa sorte! 🚀**
