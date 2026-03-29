# ✅ Checklist de Deploy - RLS Policies

## 🎯 Objetivo

Garantir que as políticas RLS sejam aplicadas corretamente em produção para **evitar vazamento de dados** entre barbearias.

---

## 📋 Pré-Requisitos

- [ ] Acesso ao Supabase Dashboard
- [ ] Projeto Supabase criado e ativo
- [ ] Tabelas já criadas (barbershops, users, services, clients, appointments, plans, subscriptions)
- [ ] **BACKUP do banco feito** (muito importante!)

---

## 🚀 Passo a Passo (5-10 minutos)

### 1️⃣ Fazer Backup

⚠️ **CRÍTICO: Sempre faça backup antes de aplicar RLS!**

1. Supabase Dashboard → Project Settings
2. Database → Backups
3. Clique em "Create Backup"
4. Aguarde conclusão

---

### 2️⃣ Aplicar Políticas RLS

1. **Abra o SQL Editor**
   - Supabase Dashboard → SQL Editor
   - Clique em "New Query"

2. **Cole o script completo**
   - Arquivo: `database/rls-policies-complete.sql`
   - Cole TODO o conteúdo

3. **Execute**
   - Clique em "Run" ou `Ctrl+Enter`
   - Aguarde 10-30 segundos

4. **Verifique resultado**
   - Deve aparecer uma tabela com as políticas criadas
   - Se houver erros, leia a mensagem com atenção

---

### 3️⃣ Verificar RLS Habilitado

Execute esta query no SQL Editor:

```sql
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'barbershops',
    'users',
    'services',
    'clients',
    'appointments',
    'plans',
    'subscriptions'
  )
ORDER BY tablename;
```

**✅ Esperado**: Todas as 7 tabelas com `rls_enabled = true`

**❌ Se alguma tiver `false`**: Execute manualmente:
```sql
ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;
```

---

### 4️⃣ Contar Políticas

Execute esta query:

```sql
SELECT
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'barbershops',
    'users',
    'services',
    'clients',
    'appointments',
    'plans',
    'subscriptions'
  )
GROUP BY tablename
ORDER BY tablename;
```

**✅ Esperado**:
- `barbershops`: 4 políticas
- `users`: 4 políticas
- `services`: 4 políticas
- `clients`: 4 políticas
- `appointments`: 4 políticas
- `plans`: 2 políticas
- `subscriptions`: 2 políticas

**Total**: ~26 políticas

---

### 5️⃣ Testar Isolamento (Opcional mas Recomendado)

#### Teste Rápido (2 minutos)

1. **Criar duas barbearias de teste**:
```sql
INSERT INTO barbershops (id, name, slug) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Teste A', 'teste-a'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Teste B', 'teste-b')
ON CONFLICT DO NOTHING;
```

2. **Criar serviços para cada uma**:
```sql
INSERT INTO services (name, price, duration, barbershop_id) VALUES
  ('Corte A', 40.00, 45, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('Corte B', 50.00, 45, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT DO NOTHING;
```

3. **Verificar que RLS está filtrando**:
```sql
-- Tentar ver todos os serviços (sem autenticação)
SELECT * FROM services;

-- ✅ ESPERADO: Vê os 2 serviços (SELECT é público)

-- Contar por barbearia
SELECT barbershop_id, COUNT(*) as total
FROM services
GROUP BY barbershop_id;

-- ✅ ESPERADO: 1 serviço por barbearia
```

4. **Limpar dados de teste**:
```sql
DELETE FROM services WHERE barbershop_id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

DELETE FROM barbershops WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);
```

#### Teste Completo (10 minutos)

Execute o arquivo completo de testes:

- Arquivo: `database/rls-tests.sql`
- Siga as instruções dentro do arquivo

---

### 6️⃣ Testar no Frontend

1. **Faça login na aplicação**

2. **Abra o Console do Navegador** (F12)

3. **Execute**:
```javascript
// Tentar ler clientes
const { data, error } = await supabase
  .from('clients')
  .select('*')

console.log('Total:', data?.length)
console.log('Clientes:', data)
```

**✅ Esperado**: Apenas clientes da barbearia autenticada

**❌ Se ver clientes de outras barbearias**: RLS não está funcionando!

---

## 🔍 Verificações de Segurança

Execute estas queries e verifique os resultados:

### ✅ Verificação 1: Funções Auxiliares

```sql
SELECT proname
FROM pg_proc
WHERE proname IN (
  'is_barbershop_admin',
  'is_barbershop_member',
  'is_platform_admin',
  'current_user_barbershop_id'
);
```

**Esperado**: 4 funções encontradas

---

### ✅ Verificação 2: Políticas de SELECT

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'SELECT'
ORDER BY tablename;
```

**Esperado**: Pelo menos 1 política SELECT por tabela

---

### ✅ Verificação 3: Políticas de INSERT

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'INSERT'
ORDER BY tablename;
```

**Esperado**: Pelo menos 1 política INSERT por tabela

---

## ⚠️ Problemas Comuns

### Erro: "permission denied for table"

**Causa**: Usando Service Role ao invés de Anon Key

**Solução**: No código, verificar:
```javascript
// ❌ ERRADO
const supabase = createClient(url, SERVICE_ROLE_KEY)

// ✅ CORRETO
const supabase = createClient(url, ANON_KEY)
```

---

### Erro: "new row violates row-level security policy"

**Causa**: Tentando inserir dados em barbearia diferente

**Solução**: Isso é o RLS funcionando! É esperado.

Se acontece durante operação normal:
- Verificar se `barbershop_id` está correto
- Verificar se usuário está autenticado

---

### Vejo dados de outras barbearias

**Causa**: RLS não habilitado ou políticas incorretas

**Solução**:
1. Verificar se RLS está habilitado:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'clients';
```

2. Se `rowsecurity = false`:
```sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
```

3. Re-executar `rls-policies-complete.sql`

---

## 📊 Checklist Final

Antes de considerar CONCLUÍDO:

- [ ] ✅ Backup feito
- [ ] ✅ Script `rls-policies-complete.sql` executado sem erros
- [ ] ✅ Todas as 7 tabelas com RLS habilitado
- [ ] ✅ ~26 políticas criadas
- [ ] ✅ 4 funções auxiliares criadas
- [ ] ✅ Teste de isolamento executado com sucesso
- [ ] ✅ Teste no frontend confirmou isolamento
- [ ] ✅ Nenhum erro de "permission denied" em operações normais
- [ ] ✅ Documentação lida ([docs/RLS_SECURITY_GUIDE.md](../docs/RLS_SECURITY_GUIDE.md))

---

## 🎯 Próximos Passos

Após aplicar RLS com sucesso:

1. **Monitorar logs** (primeiros dias):
   - Supabase Dashboard → Logs → Postgres
   - Procurar por "row-level security policy"
   - Investigar qualquer violação inesperada

2. **Testar em staging** antes de produção

3. **Documentar políticas customizadas** se adicionar novas tabelas

4. **Revisar RLS mensalmente** (adicione ao calendário)

---

## 📞 Precisa de Ajuda?

**Documentação completa**: [docs/RLS_SECURITY_GUIDE.md](../docs/RLS_SECURITY_GUIDE.md)

**Testes detalhados**: [database/rls-tests.sql](rls-tests.sql)

**Supabase Docs**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Status

- [ ] Não iniciado
- [ ] Em progresso
- [ ] Concluído e testado

**Data de aplicação**: ___/___/_____

**Aplicado por**: _________________

**Ambiente**: [ ] Desenvolvimento [ ] Staging [ ] Produção

---

**🔒 Lembre-se: RLS é a última linha de defesa contra vazamento de dados. Não pule esta etapa!**
