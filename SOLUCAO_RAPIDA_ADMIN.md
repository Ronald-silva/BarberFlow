# 🚀 Solução Rápida: Acessar Painel Administrativo

## 🎯 TL;DR - Execute Isso Agora

**No Supabase SQL Editor, execute em ordem:**

```sql
-- 1. Corrigir constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
CHECK (role IN ('platform_admin', 'admin', 'member', 'professional', 'receptionist'));

-- 2. Atualizar usuário
UPDATE users
SET role = 'platform_admin', barbershop_id = NULL, updated_at = NOW()
WHERE email = 'admin@barber.com';

-- 3. Verificar
SELECT id, email, name, role, barbershop_id FROM users WHERE email = 'admin@barber.com';
```

**Depois no navegador (F12 → Console):**
```javascript
localStorage.clear(); location.reload();
```

**Login:** `admin@barber.com` / `123456` → Você vai para `/platform` ✅

---

## ❌ Problema Atual
Você está fazendo login com `admin@barber.com` e sendo redirecionado para `/dashboard` (dashboard de barbearia) ao invés de `/platform` (painel administrativo da plataforma).

## ✅ Solução em 3 Passos

> **⚠️ Importante:** Seu banco de dados tem uma constraint que não permite o role `platform_admin`. Vamos corrigi-la primeiro!

### Passo 1: Execute o SQL no Supabase

1. Abra o **Supabase Dashboard**: https://app.supabase.com
2. Selecione seu projeto **BarberFlow**
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Cole e execute este comando:

**Opção A: Atualizar usuário existente (MAIS FÁCIL)** ⭐

**Passo 1: Corrigir a constraint de role**
```sql
-- Remover constraint antiga
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Adicionar nova constraint permitindo platform_admin
ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('platform_admin', 'admin', 'member', 'professional', 'receptionist'));
```

**Passo 2: Atualizar o usuário**
```sql
-- Transformar admin@barber.com em platform_admin
UPDATE users
SET
  role = 'platform_admin',
  barbershop_id = NULL,
  updated_at = NOW()
WHERE email = 'admin@barber.com';

-- Verificar
SELECT id, email, name, role, barbershop_id
FROM users
WHERE email = 'admin@barber.com';
```

**Opção B: Criar novo usuário platform admin**
```sql
-- Criar novo platform admin
INSERT INTO users (
  id,
  email,
  name,
  role,
  barbershop_id,
  work_hours,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'platform@barberflow.com',
  'Platform Administrator',
  'platform_admin',
  NULL,
  '[]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (email)
DO UPDATE SET
  role = 'platform_admin',
  barbershop_id = NULL;

-- Verificar
SELECT id, email, name, role, barbershop_id
FROM users
WHERE role = 'platform_admin';
```

5. Clique em **RUN** (ou pressione `Ctrl+Enter`)
6. Você deve ver uma linha retornada com `role: 'platform_admin'`

---

### Passo 2: Limpar o Cache do Navegador

Abra o **Console do Navegador** (`F12` ou `Ctrl+Shift+I`) e execute:

```javascript
localStorage.clear();
location.reload();
```

---

### Passo 3: Fazer Login com Platform Admin

1. Vá para: `http://localhost:5173/#/login`
2. Digite:
   - **Opção A:** `admin@barber.com` + senha `123456`
   - **Opção B:** `platform@barberflow.com` + qualquer senha
3. Clique em **Entrar**

✅ **Você será redirecionado para `/platform`** (painel administrativo)!

---

## 🎯 O Que Você Verá

### Painel Platform Admin (`/platform`)
- 📊 **Visão Geral**: Métricas de todas as barbearias
- 💈 **Barbearias**: Lista de todas as barbearias cadastradas
- 📈 **Analytics**: (futuro)
- ⚙️ **Configurações**: (futuro)

### Sidebar Diferente
- Badge: **"Platform Admin"** (ao invés de nome da barbearia)
- Menu focado em gerenciar a plataforma inteira

---

## ⚠️ Possível Erro: Foreign Key Constraint

Se você receber este erro ao criar novo usuário:
```
ERROR: insert or update on table "users" violates foreign key constraint
```

Isso significa que a tabela `users` requer que o `id` exista na tabela `auth.users` (Supabase Auth).

**Solução:** Use a **Opção A** (atualizar usuário existente) ao invés de criar novo.

---

## 🆘 Se Não Funcionar

### 1. Verificar se o SQL rodou corretamente:
```sql
SELECT * FROM users WHERE role = 'platform_admin';
```

Se retornar vazio, o SQL não funcionou.

### 2. Verificar redirecionamento no Console:

No `LoginPage.tsx` (linha 131), adicione temporariamente:

```typescript
console.log('User data:', userData);
console.log('Role:', userData.role);
console.log('Is platform admin?', userData.role === 'platform_admin');
```

### 3. Verificar localStorage:

No console do navegador:

```javascript
JSON.parse(localStorage.getItem('barberflow_user'))
```

Deve mostrar `role: "platform_admin"`.

---

## 📚 Documentação Completa

Para entender a arquitetura completa, veja:
- [docs/ADMIN_PLATFORM_SETUP.md](docs/ADMIN_PLATFORM_SETUP.md) - Documentação detalhada
- [database/seed-platform-admin.sql](database/seed-platform-admin.sql) - Script SQL completo

---

## ✅ Checklist

- [ ] SQL executado no Supabase
- [ ] Verificado que retornou uma linha com `role: 'platform_admin'`
- [ ] localStorage limpo (`localStorage.clear()`)
- [ ] Login feito com `platform@barberflow.com`
- [ ] Redirecionado para `/platform` ✅
- [ ] Vendo dashboard com métricas da plataforma

---

**Pronto!** Agora você tem acesso ao painel administrativo da plataforma para gerenciar todas as barbearias cadastradas no seu SaaS. 🎉
