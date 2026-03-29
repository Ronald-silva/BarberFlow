# 🔒 Guia de Segurança RLS - Shafar

## 📋 Índice

1. [O que é RLS?](#o-que-é-rls)
2. [Por que RLS é CRÍTICO?](#por-que-rls-é-crítico)
3. [Arquitetura Multi-Tenant](#arquitetura-multi-tenant)
4. [Políticas Implementadas](#políticas-implementadas)
5. [Como Aplicar](#como-aplicar)
6. [Como Testar](#como-testar)
7. [Troubleshooting](#troubleshooting)

---

## O que é RLS?

**RLS (Row Level Security)** é um sistema de segurança do PostgreSQL que:

- **Filtra automaticamente** as linhas de uma tabela baseado no usuário autenticado
- **Funciona no nível do banco de dados**, não no código da aplicação
- **Não pode ser contornado** por bugs no frontend ou backend
- **É a última linha de defesa** contra vazamento de dados

### Analogia Simples

Imagine um prédio com vários apartamentos (barbearias):

❌ **SEM RLS**: Todas as portas ficam abertas. Qualquer morador pode entrar em qualquer apartamento.

✅ **COM RLS**: Cada morador só consegue abrir a porta do próprio apartamento. Impossível entrar em outros.

---

## Por que RLS é CRÍTICO?

### ⚠️ SEM RLS = VAZAMENTO DE DADOS GARANTIDO

Sem RLS, qualquer um desses cenários causa vazamento:

1. **Bug no Frontend**
   ```javascript
   // BUG: Esqueceu de filtrar por barbershop_id
   const { data } = await supabase.from('clients').select('*')
   // RESULTADO: Vê clientes de TODAS as barbearias! 🚨
   ```

2. **Bug no Backend**
   ```javascript
   // BUG: API esqueceu de validar barbershop_id
   app.get('/clients', (req, res) => {
     const clients = db.query('SELECT * FROM clients')
     // RESULTADO: Retorna clientes de todos! 🚨
   })
   ```

3. **Ataque Direto ao Supabase**
   ```javascript
   // HACKER: Usando console do navegador
   await supabase.from('clients').select('*')
   // SEM RLS: Vê todos os dados! 🚨
   // COM RLS: Vê apenas da própria barbearia ✅
   ```

### 📊 Impacto Real

| Cenário | Sem RLS | Com RLS |
|---------|---------|---------|
| Bug no código | ❌ Vazamento total | ✅ Apenas próprios dados |
| Ataque direto | ❌ Acesso total | ✅ Bloqueado |
| Desenvolvedor esquece filtro | ❌ Dados expostos | ✅ Filtrado automaticamente |
| **Compliance LGPD** | ❌ Violação grave | ✅ Conforme |

### 💰 Custo de um Vazamento

- **Multa LGPD**: Até R$ 50 milhões
- **Perda de clientes**: 100%
- **Processo judicial**: Certo
- **Reputação**: Destruída

**COM RLS: R$ 0 de custo + 100% de segurança**

---

## Arquitetura Multi-Tenant

### Modelo de Dados

```
┌─────────────────┐
│  auth.users     │ (Supabase Auth)
│  - id (UUID)    │
└────────┬────────┘
         │
         │ referencia
         ▼
┌─────────────────┐
│  barbershops    │ (Tenant principal)
│  - id           │
│  - name         │
│  - slug         │
└────────┬────────┘
         │
         │ barbershop_id (FK)
         ▼
┌─────────────────────────────────────────┐
│  Todas as tabelas:                      │
│  - users (barbershop_id)                │
│  - services (barbershop_id)             │
│  - clients (barbershop_id)              │
│  - appointments (barbershop_id)         │
│  - subscriptions (barbershop_id)        │
└─────────────────────────────────────────┘
```

### Princípio de Isolamento

**REGRA DE OURO**: Todo dado pertence a uma barbearia.

```sql
-- ✅ CORRETO: Sempre tem barbershop_id
INSERT INTO clients (name, whatsapp, barbershop_id)
VALUES ('João', '11999999999', '123e4567-...')

-- ❌ ERRADO: Sem barbershop_id
INSERT INTO clients (name, whatsapp)
VALUES ('João', '11999999999')  -- A qual barbearia pertence?
```

---

## Políticas Implementadas

### 📋 Resumo das Políticas

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `barbershops` | ✅ Público | ✅ Público/Platform | ✅ Admin próprio | ✅ Platform Admin |
| `users` | ✅ Mesma barbearia | ✅ Registro/Admin | ✅ Self/Admin | ✅ Admin |
| `services` | ✅ Público | ✅ Membros | ✅ Membros | ✅ Admin |
| `clients` | ✅ Membros | ✅ Público/Membros | ✅ Membros | ✅ Admin |
| `appointments` | ✅ Membros | ✅ Público/Membros | ✅ Membros | ✅ Admin |
| `plans` | ✅ Público (ativos) | ✅ Platform Admin | ✅ Platform Admin | ✅ Platform Admin |
| `subscriptions` | ✅ Própria | ✅ Platform Admin | ✅ Platform Admin | ✅ Platform Admin |

### 🔑 Funções Auxiliares

#### `is_barbershop_admin(barbershop_uuid UUID)`
Verifica se o usuário autenticado é admin da barbearia especificada.

```sql
-- Exemplo de uso
SELECT * FROM barbershops
WHERE is_barbershop_admin(id);
```

#### `is_barbershop_member(barbershop_uuid UUID)`
Verifica se o usuário autenticado pertence à barbearia (admin OU membro).

```sql
-- Exemplo de uso
SELECT * FROM services
WHERE is_barbershop_member(barbershop_id);
```

#### `is_platform_admin()`
Verifica se o usuário é admin da plataforma (SaaS).

```sql
-- Exemplo de uso
SELECT * FROM subscriptions
WHERE is_platform_admin();
```

#### `current_user_barbershop_id()`
Retorna o `barbershop_id` do usuário autenticado.

```sql
-- Exemplo de uso
SELECT * FROM clients
WHERE barbershop_id = current_user_barbershop_id();
```

### 📝 Detalhamento por Tabela

#### BARBERSHOPS
```sql
-- SELECT: Qualquer um pode ver (para landing page)
POLICY "barbershops_select_public"
  FOR SELECT USING (true)

-- INSERT: Registro público ou platform admin
POLICY "barbershops_insert_public"
  FOR INSERT WITH CHECK (
    auth.uid() IS NULL OR is_platform_admin()
  )

-- UPDATE: Apenas admin da própria barbearia
POLICY "barbershops_update_admin"
  FOR UPDATE USING (
    is_barbershop_admin(id) OR is_platform_admin()
  )

-- DELETE: Apenas platform admin
POLICY "barbershops_delete_platform_admin"
  FOR DELETE USING (is_platform_admin())
```

#### SERVICES
```sql
-- SELECT: Público (para página de agendamento)
POLICY "services_select_public"
  FOR SELECT USING (true)

-- INSERT/UPDATE: Membros da barbearia
POLICY "services_insert_barbershop_member"
  FOR INSERT WITH CHECK (is_barbershop_member(barbershop_id))

-- DELETE: Apenas admins
POLICY "services_delete_admin"
  FOR DELETE USING (is_barbershop_admin(barbershop_id))
```

#### CLIENTS & APPOINTMENTS
```sql
-- SELECT: Apenas membros veem
POLICY "clients_select_barbershop_member"
  FOR SELECT USING (is_barbershop_member(barbershop_id))

-- INSERT: Público (agendamento online) + Membros
POLICY "clients_insert_barbershop_or_public"
  FOR INSERT WITH CHECK (
    auth.uid() IS NULL OR is_barbershop_member(barbershop_id)
  )
```

---

## Como Aplicar

### Passo 1: Backup do Banco

⚠️ **SEMPRE faça backup antes de aplicar RLS!**

```bash
# No Supabase Dashboard:
# Project Settings → Database → Backups → Create Backup
```

### Passo 2: Aplicar Políticas

1. **Abra o Supabase Dashboard**
   - URL: https://app.supabase.com
   - Selecione seu projeto

2. **Vá em SQL Editor**
   - Menu lateral → SQL Editor
   - Clique em "New Query"

3. **Cole o conteúdo de `rls-policies-complete.sql`**
   - Arquivo: [database/rls-policies-complete.sql](../database/rls-policies-complete.sql)
   - Cole todo o conteúdo no editor

4. **Execute o Script**
   - Clique em "Run" ou pressione `Ctrl+Enter`
   - Aguarde conclusão (pode levar 10-30 segundos)

5. **Verifique Resultado**
   ```sql
   -- Deve retornar 7 tabelas com RLS habilitado
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename IN ('barbershops', 'users', 'services', 'clients', 'appointments', 'plans', 'subscriptions');
   ```

### Passo 3: Testar Isolamento

Execute o script de testes:

1. **Abra nova Query no SQL Editor**

2. **Cole o conteúdo de `rls-tests.sql`**
   - Arquivo: [database/rls-tests.sql](../database/rls-tests.sql)

3. **Siga as instruções no próprio script**
   - Criar dados de teste
   - Executar testes automáticos
   - Executar testes manuais

---

## Como Testar

### ✅ Teste 1: Verificar RLS Habilitado

```sql
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('barbershops', 'users', 'services', 'clients', 'appointments')
ORDER BY tablename;
```

**Resultado esperado**: `rls_enabled = true` para todas as tabelas.

---

### ✅ Teste 2: Contar Políticas

```sql
SELECT
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Resultado esperado**:
- `barbershops`: 4 políticas (SELECT, INSERT, UPDATE, DELETE)
- `users`: 4 políticas
- `services`: 4 políticas
- `clients`: 4 políticas
- `appointments`: 4 políticas
- `plans`: 2 políticas
- `subscriptions`: 2 políticas

---

### ✅ Teste 3: Simular Usuário Autenticado

```sql
-- Criar duas barbearias de teste
INSERT INTO barbershops (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Barbearia A', 'barbearia-a'),
  ('22222222-2222-2222-2222-222222222222', 'Barbearia B', 'barbearia-b');

-- Criar serviços para cada uma
INSERT INTO services (name, price, duration, barbershop_id) VALUES
  ('Corte A', 40.00, 45, '11111111-1111-1111-1111-111111111111'),
  ('Corte B', 50.00, 45, '22222222-2222-2222-2222-222222222222');

-- Simular login como usuário da Barbearia A
-- (Você precisa ter um usuário real criado no Auth)
SELECT set_config('request.jwt.claim.sub', 'UUID_DO_USUARIO_A', true);

-- Tentar ver serviços
SELECT * FROM services;
-- ✅ ESPERADO: Deve ver apenas "Corte A"

-- Simular login como usuário da Barbearia B
SELECT set_config('request.jwt.claim.sub', 'UUID_DO_USUARIO_B', true);

-- Tentar ver serviços
SELECT * FROM services;
-- ✅ ESPERADO: Deve ver apenas "Corte B"
```

---

### ✅ Teste 4: Tentar Ataque (DEVE FALHAR)

```sql
-- Simular login como usuário da Barbearia A
SELECT set_config('request.jwt.claim.sub', 'UUID_DO_USUARIO_A', true);

-- Tentar inserir serviço na Barbearia B (ataque)
INSERT INTO services (name, price, duration, barbershop_id)
VALUES ('Hack', 1.00, 1, '22222222-2222-2222-2222-222222222222');

-- ❌ ESPERADO: Erro "new row violates row-level security policy"
```

---

### ✅ Teste 5: Teste no Frontend

**No console do navegador (F12):**

```javascript
// 1. Fazer login normalmente
// 2. Abrir console (F12)
// 3. Tentar query direta

const { data, error } = await supabase
  .from('clients')
  .select('*')

console.log('Total de clientes:', data.length)
console.log('Clientes:', data)

// ✅ ESPERADO: Apenas clientes da própria barbearia
// ❌ SE VER TODOS: RLS não está funcionando!
```

**Teste de inserção cruzada:**

```javascript
// Tentar criar cliente em outra barbearia
const { data, error } = await supabase
  .from('clients')
  .insert({
    name: 'Hack Test',
    whatsapp: '11999999999',
    barbershop_id: 'OUTRA_BARBEARIA_ID' // ID diferente da sua
  })

console.log('Erro:', error)

// ✅ ESPERADO: Erro de violação de RLS
// ❌ SE FUNCIONAR: RLS com problema!
```

---

## Troubleshooting

### ❌ Problema: "permission denied for table"

**Causa**: Service role está sendo usada ao invés da anon key.

**Solução**:
```javascript
// ❌ ERRADO: Service role ignora RLS
const supabase = createClient(url, SERVICE_ROLE_KEY)

// ✅ CORRETO: Anon key respeita RLS
const supabase = createClient(url, ANON_KEY)
```

---

### ❌ Problema: Vejo dados de outras barbearias

**Possíveis causas**:

1. **RLS não está habilitado**
   ```sql
   -- Verificar
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE tablename = 'services';

   -- Se rowsecurity = false, habilitar:
   ALTER TABLE services ENABLE ROW LEVEL SECURITY;
   ```

2. **Políticas não foram criadas**
   ```sql
   -- Verificar
   SELECT * FROM pg_policies WHERE tablename = 'services';

   -- Se vazio, executar rls-policies-complete.sql
   ```

3. **Usando Service Role Key**
   - Service Role **IGNORA RLS** (é intencional)
   - Use apenas para admin interno
   - Frontend DEVE usar Anon Key

---

### ❌ Problema: Não consigo inserir dados

**Causa**: Política de INSERT muito restritiva.

**Solução**: Verificar qual política está bloqueando:

```sql
-- Ver políticas de INSERT da tabela
SELECT policyname, qual
FROM pg_policies
WHERE tablename = 'sua_tabela' AND cmd = 'INSERT';
```

---

### ❌ Problema: "infinite recursion detected in policy"

**Causa**: Política faz query na mesma tabela que está protegendo.

**Exemplo problemático**:
```sql
-- ❌ RECURSÃO: users faz query em users
CREATE POLICY "problematic" ON users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users  -- ← Recursão!
    WHERE id = auth.uid()
  )
);
```

**Solução**: Use `SECURITY DEFINER` nas funções auxiliares.

---

## 📊 Checklist Final

Antes de ir para produção, verifique:

- [ ] ✅ RLS habilitado em todas as tabelas
- [ ] ✅ Todas as tabelas têm políticas SELECT
- [ ] ✅ Todas as tabelas têm políticas INSERT
- [ ] ✅ Todas as tabelas têm políticas UPDATE
- [ ] ✅ Todas as tabelas têm políticas DELETE
- [ ] ✅ Funções auxiliares criadas (`is_barbershop_admin`, etc.)
- [ ] ✅ Testou isolamento entre duas barbearias
- [ ] ✅ Testou ataque de inserção cruzada (deve falhar)
- [ ] ✅ Testou no frontend com console (F12)
- [ ] ✅ Está usando ANON_KEY no frontend (não service role)

---

## 🎯 Conclusão

**RLS não é opcional. É OBRIGATÓRIO.**

### Por quê?

1. **Segurança**: Última linha de defesa contra vazamentos
2. **LGPD**: Compliance obrigatório
3. **Confiança**: Clientes confiam seus dados a você
4. **Custo**: Evita multas milionárias

### Próximos Passos

1. ✅ Aplicar políticas RLS (este guia)
2. ✅ Testar isolamento (rls-tests.sql)
3. ✅ Monitorar logs de violação (Supabase Dashboard)
4. ✅ Revisar políticas a cada nova tabela/feature

---

## 📞 Precisa de Ajuda?

Se encontrar problemas:

1. **Verifique os logs**: Supabase Dashboard → Logs → Postgres
2. **Teste com SQL direto**: SQL Editor para isolar o problema
3. **Revise as políticas**: `SELECT * FROM pg_policies WHERE tablename = 'sua_tabela'`
4. **Consulte docs oficiais**: https://supabase.com/docs/guides/auth/row-level-security

---

**🔒 Segurança em primeiro lugar. Sempre.**
