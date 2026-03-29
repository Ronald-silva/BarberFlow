# Arquitetura Multi-Tenant - Shafar

## 🏗️ Visão Geral da Arquitetura

O Shafar possui uma arquitetura **multi-tenant** com **2 níveis de acesso** separados:

```
┌─────────────────────────────────────────────────────────────┐
│                      Shafar SAAS                         │
│                 (Plataforma de Agendamentos)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   PLATFORM ADMIN          │   │   BARBERSHOP DASHBOARD    │
│   (Você - Dono do SaaS)   │   │   (Donos de Barbearias)   │
├───────────────────────────┤   ├───────────────────────────┤
│ Role: platform_admin      │   │ Roles: admin, professional│
│ URL: /platform            │   │ URL: /dashboard           │
│                           │   │                           │
│ • Ver TODAS barbearias    │   │ • Ver SUA barbearia       │
│ • Métricas da plataforma  │   │ • Agendamentos            │
│ • Gerenciar assinantes    │   │ • Clientes                │
│ • Receita total           │   │ • Serviços                │
│ • Suporte                 │   │ • Profissionais           │
└───────────────────────────┘   └───────────────────────────┘
```

---

## 👥 Hierarquia de Usuários

### 1️⃣ Platform Admin (Você)
- **Role:** `platform_admin`
- **Acessa:** `/platform/*`
- **Escopo:** **Todas** as barbearias da plataforma
- **Exemplos:**
  - Você (dono do Shafar)
  - Equipe de suporte do Shafar
  - CTO/administradores da plataforma

**Características:**
- `barbershop_id` é `NULL` (não pertence a nenhuma barbearia)
- Pode ver métricas de todas as barbearias
- Gerencia assinaturas e cobranças
- Não gerencia agendamentos diretamente

### 2️⃣ Barbershop Admin (Donos de Barbearias)
- **Role:** `admin`
- **Acessa:** `/dashboard/*`
- **Escopo:** **Apenas SUA** barbearia (`barbershop_id`)
- **Exemplos:**
  - João, dono da "Barbearia João Silva"
  - Maria, dona da "Barber Shop Maria"

**Características:**
- `barbershop_id` aponta para a barbearia específica
- Vê apenas dados da própria barbearia
- Gerencia serviços, profissionais, agendamentos
- Acessa configurações e relatórios da barbearia

### 3️⃣ Professional (Barbeiros/Cabeleireiros)
- **Role:** `professional`
- **Acessa:** `/dashboard/*` (limitado)
- **Escopo:** **Apenas seus agendamentos**
- **Exemplos:**
  - Pedro, barbeiro na "Barbearia João Silva"
  - Ana, cabeleireira na "Barber Shop Maria"

**Características:**
- `barbershop_id` aponta para a barbearia onde trabalha
- Vê apenas seus próprios agendamentos
- Não acessa configurações ou relatórios completos

---

## 🗂️ Estrutura de Arquivos

### Platform Admin (Você)
```
src/pages/
├── PlatformLayout.tsx              ← Layout com sidebar Platform
├── PlatformDashboardPage.tsx       ← Overview de todas barbearias
├── PlatformBarbershopsPage.tsx     ← Lista de barbearias
└── (futuro)
    ├── PlatformAnalyticsPage.tsx   ← Analytics da plataforma
    ├── PlatformSupportPage.tsx     ← Tickets de suporte
    └── PlatformSettingsPage.tsx    ← Configurações globais
```

### Barbershop Dashboard (Barbearias)
```
src/pages/
├── DashboardLayout.tsx             ← Layout com sidebar Barbershop
├── DashboardPage.tsx               ← Overview da barbearia
├── SchedulePage.tsx                ← Agenda de agendamentos
├── ClientsPage.tsx                 ← Gestão de clientes
├── ServicesPage.tsx                ← Catálogo de serviços
├── ProfessionalsPage.tsx           ← Equipe de profissionais
└── SettingsPage.tsx                ← Configurações da barbearia
```

---

## 🛣️ Roteamento (App.tsx)

### Rotas Platform (`/platform`)
```typescript
// Protegido por PlatformAdminRoute
// Verifica: user.role === 'platform_admin'

<Route path="/platform" element={<PlatformLayout />}>
  <Route path="overview" element={<PlatformDashboardPage />} />
  <Route path="barbershops" element={<PlatformBarbershopsPage />} />
  <Route path="analytics" element={<PlatformAnalyticsPage />} />
  <Route path="support" element={<PlatformSupportPage />} />
  <Route path="settings" element={<PlatformSettingsPage />} />
</Route>
```

### Rotas Dashboard (`/dashboard`)
```typescript
// Protegido por ProtectedRoute
// Verifica: user existe (qualquer role que não seja platform_admin)

<Route path="/dashboard" element={<DashboardLayout />}>
  <Route path="overview" element={<DashboardPage />} />
  <Route path="schedule" element={<SchedulePage />} />
  <Route path="clients" element={<ClientsPage />} />
  <Route path="services" element={<ServicesPage />} />  // Admin only
  <Route path="professionals" element={<ProfessionalsPage />} />  // Admin only
  <Route path="settings" element={<SettingsPage />} />  // Admin only
</Route>
```

---

## 🔐 Lógica de Autenticação

### LoginPage.tsx (Redirecionamento)
```typescript
const userData = JSON.parse(localStorage.getItem('shafar_user') || '{}');

if (userData.role === 'platform_admin') {
  navigate('/platform');  // ← Platform admin vai para painel da plataforma
} else {
  navigate('/dashboard'); // ← Barbershops vão para dashboard
}
```

### PlatformAdminRoute (Guard)
```typescript
const PlatformAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;  // Não autenticado
  }

  if (user.role !== 'platform_admin') {
    return <Navigate to="/dashboard" />;  // Não é platform admin
  }

  return children;  // ✅ É platform admin, pode acessar
};
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,  -- 'platform_admin', 'admin', 'professional', 'receptionist'
  barbershop_id UUID REFERENCES barbershops(id),  -- NULL para platform_admin
  phone VARCHAR(20),
  work_hours JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Exemplos:**
| email | name | role | barbershop_id |
|-------|------|------|---------------|
| platform@shafar.com | Platform Admin | platform_admin | **NULL** |
| joao@barbearia.com | João Silva | admin | uuid-barbearia-1 |
| pedro@barbearia.com | Pedro Santos | professional | uuid-barbearia-1 |

---

## 📊 APIs Platform Admin

### src/services/supabaseApi.ts

```typescript
// Buscar TODAS as barbearias (platform admin)
getAllBarbershops: async (): Promise<Barbershop[]> => {
  const { data, error } = await supabase
    .from('barbershops')
    .select('*')
    .order('created_at', { ascending: false });

  return data || [];
}

// Métricas da plataforma inteira
getPlatformMetrics: async () => {
  // Total de barbearias
  const { count: totalBarbershops } = await supabase
    .from('barbershops')
    .select('*', { count: 'exact', head: true });

  // Assinaturas ativas
  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .in('status', ['active', 'trialing']);

  // Receita mensal total
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('plan_price')
    .in('status', ['active', 'trialing']);

  const monthlyRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.plan_price || 0), 0) || 0;

  // Agendamentos de hoje (todas as barbearias)
  const { count: todayAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('start_datetime', new Date().toISOString());

  return {
    totalBarbershops,
    activeSubscriptions,
    monthlyRevenue,
    todayAppointments
  };
}
```

---

## 🔒 Row Level Security (RLS)

### Platform Admin pode ver TUDO:

```sql
-- Barbearias
CREATE POLICY "Platform admins can view all barbershops"
  ON barbershops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'platform_admin'
    )
  );

-- Usuários
CREATE POLICY "Platform admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'platform_admin'
    )
  );

-- Assinaturas
CREATE POLICY "Platform admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'platform_admin'
    )
  );
```

### Barbershop Admin vê apenas SUA barbearia:

```sql
-- Barbearias (apenas a sua)
CREATE POLICY "Barbershop admins can view their barbershop"
  ON barbershops FOR SELECT
  USING (
    id = (SELECT barbershop_id FROM users WHERE id = auth.uid())
  );

-- Agendamentos (apenas da sua barbearia)
CREATE POLICY "Users can view barbershop appointments"
  ON appointments FOR SELECT
  USING (
    barbershop_id = (SELECT barbershop_id FROM users WHERE id = auth.uid())
  );
```

---

## 🎨 Diferenças Visuais

### Platform Layout
```
┌────────────────────────────────────────────┐
│ Shafar                                 │
│ [PLATFORM ADMIN]                           │ ← Badge especial
│                                            │
│ 📊 Visão Geral                            │
│ 💈 Barbearias                             │
│ 📈 Analytics                              │
│ 💬 Suporte                                │
│ ⚙️ Configurações                          │
│                                            │
│ ─────────────────────                     │
│ 🚪 Sair                                   │
│ Platform Administrator                     │
│ platform@shafar.com                    │
│ Platform Administrator                     │ ← Texto em cinza
└────────────────────────────────────────────┘
```

### Barbershop Layout
```
┌────────────────────────────────────────────┐
│ Shafar                                 │
│ Barbearia João Silva                       │ ← Nome da barbearia
│                                            │
│ 📊 Dashboard                              │
│ 📅 Agenda                                 │
│ 👥 Clientes                               │
│ ✂️ Serviços                               │
│ 👨‍💼 Profissionais                         │
│ ⚙️ Configurações                          │
│                                            │
│ ─────────────────────                     │
│ 🚪 Sair                                   │
│ João Silva                                 │
│ joao@barbearia.com                         │
│ Administrador                              │ ← Role da barbearia
└────────────────────────────────────────────┘
```

---

## 🚀 Fluxo Completo: Cadastro até Uso

### 1. Você (Platform Admin)
1. Acessa `/platform`
2. Vê métricas de **TODAS** as barbearias
3. Gerencia assinaturas e cobranças
4. Provê suporte

### 2. Dono de Barbearia (Barbershop Admin)
1. Se registra em `/register` (landing page)
2. Cria conta da barbearia
3. É redirecionado para `/dashboard`
4. Configura serviços, profissionais, horários
5. Compartilha link de agendamento: `/book/barbearia-slug`

### 3. Profissional (Barbeiro)
1. É convidado pelo dono da barbearia
2. Faz login
3. Acessa `/dashboard/schedule` (apenas sua agenda)
4. Vê apenas seus agendamentos

### 4. Cliente Final
1. Acessa `/book/barbearia-slug` (link público)
2. Faz agendamento
3. Paga com PIX
4. Recebe confirmação

---

## ✅ Checklist de Implementação

### Platform Admin (✅ Completo)
- [x] `PlatformLayout.tsx` com sidebar especial
- [x] `PlatformDashboardPage.tsx` com métricas da plataforma
- [x] `PlatformBarbershopsPage.tsx` com lista de barbearias
- [x] `PlatformAdminRoute` guard para proteger rotas
- [x] `getAllBarbershops()` API
- [x] `getPlatformMetrics()` API
- [x] Redirecionamento baseado em role
- [x] Script SQL para criar platform admin

### Barbershop Dashboard (✅ Completo)
- [x] `DashboardLayout.tsx` com sidebar da barbearia
- [x] `DashboardPage.tsx` com métricas da barbearia
- [x] `SchedulePage.tsx` para agendamentos
- [x] `ClientsPage.tsx` para clientes
- [x] `ServicesPage.tsx` para serviços
- [x] `ProfessionalsPage.tsx` para equipe
- [x] `SettingsPage.tsx` para configurações

### Pendente (Melhorias Futuras)
- [ ] Autenticação real com Supabase Auth
- [ ] Row Level Security (RLS) completo
- [ ] Platform Analytics page
- [ ] Platform Support page
- [ ] Platform Settings page
- [ ] Convite de profissionais por email
- [ ] Multi-fator authentication (MFA)

---

## 📚 Documentação Relacionada

- [ADMIN_PLATFORM_SETUP.md](./ADMIN_PLATFORM_SETUP.md) - Setup detalhado do platform admin
- [SOLUCAO_RAPIDA_ADMIN.md](../SOLUCAO_RAPIDA_ADMIN.md) - Guia rápido para resolver problema de acesso
- [database/seed-platform-admin.sql](../database/seed-platform-admin.sql) - Script SQL completo

---

**Arquitetura correta!** Separação clara entre Platform (você) e Barbershops (clientes) é essencial para um SaaS bem estruturado. 🎯
