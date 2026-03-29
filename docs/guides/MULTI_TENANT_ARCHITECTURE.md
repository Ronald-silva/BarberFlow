# 🏢 Arquitetura Multi-Tenant - Shafar

## 🎯 **Como Funciona o Sistema de Múltiplas Barbearias**

O Shafar usa uma arquitetura **multi-tenant** onde cada barbearia é um "tenant" independente, mas compartilha a mesma aplicação e infraestrutura.

## 🗄️ **Estrutura do Banco de Dados**

### **1. Tabela Principal: `barbershops`**
```sql
CREATE TABLE barbershops (
  id UUID PRIMARY KEY,           -- ID único da barbearia
  name TEXT NOT NULL,            -- Nome da barbearia
  slug TEXT UNIQUE NOT NULL,     -- URL amigável (ex: navalha-dourada)
  logo_url TEXT,                 -- Logo da barbearia
  address TEXT,                  -- Endereço
  phone TEXT,                    -- Telefone
  email TEXT                     -- Email de contato
);
```

### **2. Isolamento por `barbershop_id`**
Todas as outras tabelas têm uma referência à barbearia:

```sql
-- Usuários/Profissionais
users.barbershop_id → barbershops.id

-- Serviços
services.barbershop_id → barbershops.id

-- Clientes  
clients.barbershop_id → barbershops.id

-- Agendamentos
appointments.barbershop_id → barbershops.id
```

## 👥 **Sistema de Perfis e Permissões**

### **Tipos de Usuário:**#
### **1. Admin (Dono da Barbearia)**
- ✅ Gerenciar profissionais (adicionar/remover)
- ✅ Configurar serviços e preços
- ✅ Ver todos os agendamentos
- ✅ Acessar relatórios financeiros
- ✅ Configurações da barbearia

#### **2. Member (Barbeiro/Profissional)**
- ✅ Ver seus próprios agendamentos
- ✅ Gerenciar clientes
- ✅ Criar novos agendamentos
- ❌ Não pode alterar preços/serviços
- ❌ Não pode gerenciar outros profissionais

### **Controle de Acesso:**
```sql
-- Exemplo: Buscar apenas dados da barbearia do usuário
SELECT * FROM appointments 
WHERE barbershop_id = current_user_barbershop_id;
```

## 🔐 **Isolamento de Dados**

### **Row Level Security (RLS)**
O Supabase implementa RLS para garantir que cada barbearia só acesse seus dados:

```sql
-- Política de segurança exemplo
CREATE POLICY "Users can only see their barbershop data" 
ON appointments FOR ALL 
USING (barbershop_id = auth.jwt() ->> 'barbershop_id');
```

### **Filtros Automáticos**
Todas as consultas incluem automaticamente o `barbershop_id`:

```typescript
// Exemplo no código
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('barbershop_id', userBarbershopId);
```

## 🏗️ **Fluxo de Cadastro de Nova Barbearia**

### **1. Criação da Barbearia**
```sql
INSERT INTO barbershops (name, slug, address, phone, email)
VALUES ('Barbearia Nova', 'barbearia-nova', 'Rua X, 123', '11999999999', 'contato@nova.com');
```

### **2. Criação do Admin**
```sql
INSERT INTO users (email, name, barbershop_id, role)
VALUES ('admin@nova.com', 'João Silva', barbershop_id, 'admin');
```

### **3. Configuração Inicial**
- Serviços padrão
- Horários de funcionamento
- Configurações básicas

## 📊 **Exemplos Práticos**

### **Cenário: 3 Barbearias no Sistema**

#### **Barbearia A: "Navalha Dourada"**
- ID: `123e4567-e89b-12d3-a456-426614174000`
- Admin: Roberto Silva
- Profissionais: Thiago, Felipe
- Clientes: 150 clientes
- Serviços: Corte (R$ 40), Barba (R$ 30)

#### **Barbearia B: "Corte & Estilo"**
- ID: `987fcdeb-51a2-43d1-b789-123456789abc`
- Admin: Maria Santos
- Profissionais: Carlos, Ana
- Clientes: 200 clientes  
- Serviços: Corte (R$ 35), Barba (R$ 25)

#### **Barbearia C: "Barbershop Premium"**
- ID: `456789ab-cdef-1234-5678-90abcdef1234`
- Admin: Pedro Costa
- Profissionais: Lucas, Rafael, Bruno
- Clientes: 300 clientes
- Serviços: Corte (R$ 60), Barba (R$ 45)

### **Isolamento Garantido:**
- Roberto (Barbearia A) nunca vê dados da Barbearia B ou C
- Cada barbearia tem seus próprios clientes, agendamentos e relatórios
- Preços e serviços são independentes

## 🔄 **Fluxo de Autenticação**

### **1. Login do Usuário**
```typescript
const { user } = await supabase.auth.signIn({
  email: 'thiago@barber.com',
  password: 'senha123'
});
```

### **2. Identificação da Barbearia**
```typescript
const { data: userData } = await supabase
  .from('users')
  .select('barbershop_id, role')
  .eq('email', user.email)
  .single();
```

### **3. Contexto da Sessão**
```typescript
// Todas as operações usam este contexto
const userContext = {
  userId: user.id,
  barbershopId: userData.barbershop_id,
  role: userData.role
};
```

## 🚀 **Vantagens da Arquitetura**

### **Para o Negócio:**
- ✅ **Escalabilidade**: Adicionar novas barbearias é simples
- ✅ **Isolamento**: Dados 100% separados
- ✅ **Customização**: Cada barbearia pode ter preços diferentes
- ✅ **Relatórios**: Métricas independentes por barbearia

### **Para o Desenvolvimento:**
- ✅ **Código Único**: Uma aplicação serve todas as barbearias
- ✅ **Manutenção**: Updates aplicados a todos os tenants
- ✅ **Segurança**: RLS garante isolamento automático
- ✅ **Performance**: Índices otimizados por barbearia

## 📱 **Interface Multi-Tenant**

### **Identificação Visual:**
- Logo da barbearia no header
- Cores personalizadas (futuro)
- Nome da barbearia no título

### **Dados Contextuais:**
- Dashboard mostra apenas dados da barbearia atual
- Relatórios filtrados automaticamente
- Agendamentos isolados por barbearia

## 🔧 **Implementação Técnica**

### **Context Provider:**
```typescript
const BarbershopContext = createContext({
  barbershopId: null,
  barbershopData: null,
  userRole: null
});
```

### **Hook Personalizado:**
```typescript
const useBarbershop = () => {
  const context = useContext(BarbershopContext);
  return context;
};
```

### **Filtros Automáticos:**
```typescript
const useAppointments = () => {
  const { barbershopId } = useBarbershop();
  
  return useQuery(['appointments', barbershopId], () =>
    supabase
      .from('appointments')
      .select('*')
      .eq('barbershop_id', barbershopId)
  );
};
```

## 🎯 **Resumo**

O Shafar é um **SaaS multi-tenant** onde:

1. **Cada barbearia é independente** (dados isolados)
2. **Usuários têm perfis específicos** (admin/member)
3. **Segurança por RLS** (automática no Supabase)
4. **Interface contextual** (mostra apenas dados relevantes)
5. **Escalável** (fácil adicionar novas barbearias)

**Uma aplicação, múltiplas barbearias, dados 100% isolados!** 🏢✨