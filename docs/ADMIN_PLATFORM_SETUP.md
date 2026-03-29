# Configuração do Admin da Plataforma - Shafar

## 🎯 Problema Identificado

Você está tentando acessar o **painel administrativo da plataforma** (para gerenciar todas as barbearias do SaaS), mas está sendo redirecionado para o **dashboard de barbearia** (como se fosse dono de uma barbearia específica).

---

## 🏗️ Arquitetura Atual (CORRETO)

O sistema já está **corretamente estruturado** com dois níveis de acesso:

### 1. **Platform Admin** (Você - Dono do Shafar)
- **Rota:** `/platform`
- **Role necessária:** `platform_admin`
- **Páginas:**
  - `PlatformLayout` - Layout do painel administrativo
  - `PlatformDashboardPage` - Overview de todas as barbearias
  - `PlatformBarbershopsPage` - Lista e gerenciamento de barbearias
- **Redirecionamento após login:** `navigate('/platform')`

### 2. **Barbershop Admin/Professional** (Donos de Barbearias)
- **Rota:** `/dashboard`
- **Roles:** `admin`, `professional`, `receptionist`
- **Páginas:**
  - `DashboardLayout` - Layout do dashboard da barbearia
  - `DashboardPage`, `SchedulePage`, `ClientsPage`, etc.
- **Redirecionamento após login:** `navigate('/dashboard')`

---

## ❌ Causa do Problema

O usuário `admin@barber.com` provavelmente **NÃO tem a role `platform_admin`** no banco de dados.

**Lógica de redirecionamento (LoginPage.tsx:131-136):**
```typescript
const userData = JSON.parse(localStorage.getItem('shafar_user') || '{}');
if (userData.role === 'platform_admin') {
    navigate('/platform');  // ← Você precisa chegar aqui
} else {
    navigate('/dashboard'); // ← Você está indo para cá
}
```

---

## ✅ Solução: Criar/Atualizar Platform Admin

### Opção 1: Atualizar Usuário Existente (MAIS FÁCIL) ⭐

Execute este SQL no **Supabase SQL Editor**:

```sql
-- 1. Transformar admin@barber.com em platform_admin
UPDATE users
SET
  role = 'platform_admin',
  barbershop_id = NULL,
  updated_at = NOW()
WHERE email = 'admin@barber.com';

-- 2. Verificar se foi atualizado
SELECT id, email, name, role, barbershop_id
FROM users
WHERE email = 'admin@barber.com';
```

**Credenciais de login:**
- **Email:** `admin@barber.com`
- **Senha:** `123456`

---

### Opção 2: Criar Novo Usuário Platform Admin

**ATENÇÃO:** Esta opção pode dar erro de Foreign Key se você não tiver configurado Supabase Auth.

Execute este SQL no **Supabase SQL Editor**:

```sql
-- 1. Criar usuário platform admin
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
  'platform@shafar.com',
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

-- 2. Verificar se foi criado
SELECT id, email, name, role, barbershop_id
FROM users
WHERE role = 'platform_admin';
```

**Credenciais de login:**
- **Email:** `platform@shafar.com`
- **Senha:** (qualquer senha, não está validando)

---

## 🔄 Após Aplicar a Solução

1. **Execute o SQL** no Supabase SQL Editor
2. **Faça logout** (se estiver logado): `localStorage.clear()`
3. **Faça login novamente** com as credenciais:
   - Email: `platform@shafar.com` (ou `admin@barber.com` se usou Opção 2)
   - Senha: qualquer (não está validando por enquanto)
4. **Você será redirecionado para** `/platform` ✅

---

## 📊 Estrutura de Roles no Shafar

| Role | Acesso | Escopo | Exemplo |
|------|--------|--------|---------|
| `platform_admin` | Painel da Plataforma (`/platform`) | **Todas** as barbearias | Você (dono do Shafar) |
| `admin` | Dashboard Barbershop (`/dashboard`) | **Sua** barbearia | Dono de uma barbearia |
| `professional` | Dashboard Barbershop (`/dashboard`) | **Sua** barbearia | Barbeiro/cabeleireiro |
| `receptionist` | Dashboard Barbershop (`/dashboard`) | **Sua** barbearia | Recepcionista |

---

## 🚀 Próximos Passos Recomendados

### 1. Implementar Autenticação Real

Atualmente, o sistema não valida senha. Para produção, você deve:

```typescript
// src/services/supabaseApi.ts
export const api = {
  login: async (email: string, password: string): Promise<User | null> => {
    // Use Supabase Auth real
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) return null;

    // Buscar dados do usuário
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return data as User;
  },
};
```

### 2. Criar Seed Script

Crie um arquivo `database/seed-platform-admin.sql`:

```sql
-- Seed: Platform Administrator
INSERT INTO users (
  id,
  email,
  name,
  role,
  barbershop_id,
  phone,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- UUID fixo para platform admin
  'platform@shafar.com',
  'Platform Administrator',
  'platform_admin',
  NULL,
  '+55 11 99999-8888',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

### 3. Adicionar Row Level Security (RLS)

```sql
-- RLS: Platform admin pode ver TODAS as barbearias
CREATE POLICY "Platform admins can view all barbershops"
  ON barbershops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'platform_admin'
    )
  );

-- RLS: Platform admin pode ver TODOS os usuários
CREATE POLICY "Platform admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'platform_admin'
    )
  );
```

---

## ✅ Checklist

- [ ] Execute o SQL para criar/atualizar platform admin
- [ ] Limpe o localStorage: `localStorage.clear()`
- [ ] Faça login com credenciais do platform admin
- [ ] Verifique se foi redirecionado para `/platform`
- [ ] Teste acesso às páginas platform (overview, barbershops)

---

## 🆘 Troubleshooting

### "Ainda está indo para /dashboard"

1. Verifique se o SQL foi executado:
```sql
SELECT email, role, barbershop_id FROM users WHERE role = 'platform_admin';
```

2. Limpe completamente o localStorage:
```javascript
// No console do navegador
localStorage.clear();
location.reload();
```

3. Verifique o redirecionamento no console:
```javascript
// No LoginPage, adicione console.log
console.log('User data:', userData);
console.log('Role:', userData.role);
console.log('Is platform admin?', userData.role === 'platform_admin');
```

### "Página /platform não carrega"

Verifique se os arquivos existem:
- `src/pages/PlatformLayout.tsx`
- `src/pages/PlatformDashboardPage.tsx`
- `src/pages/PlatformBarbershopsPage.tsx`

Se não existirem, precisaremos criá-los.

---

**Decisão correta!** A arquitetura multi-tenant com platform admin separado é o padrão correto para SaaS. 🎯
