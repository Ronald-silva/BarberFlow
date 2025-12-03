# 🚀 Configuração do Supabase para BarberFlow

Este guia te ajudará a configurar o Supabase para usar dados reais ao invés do sistema mock.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto BarberFlow já configurado localmente

## 🛠️ Passo a Passo

### 1. Configurar o Banco de Dados

1. **Acesse seu projeto no Supabase**
2. **Vá para SQL Editor**
3. **Execute o script de setup:**
   - Copie todo o conteúdo de `database/setup.sql`
   - Cole no SQL Editor e execute

4. **Execute o script de dados iniciais:**
   - Copie todo o conteúdo de `database/seed.sql`
   - Cole no SQL Editor e execute

### 2. Criar Usuários de Teste

#### Platform Admin (VOCÊ)
1. **Vá para Authentication > Users**
2. **Clique em "Add user"**
3. **Preencha:**
   - Email: `platform@barberflow.com`
   - Password: `123456` (ou sua preferência)
   - Confirm: ✅

4. **Copie o UUID gerado**
5. **No SQL Editor, execute:**
```sql
INSERT INTO users (id, email, name, barbershop_id, role, work_hours) VALUES 
('SEU-UUID-AQUI', 'platform@barberflow.com', 'Admin BarberFlow', NULL, 'platform_admin', '[]');
```

#### Barbershop Admin (Cliente de Teste)
1. **Adicione outro usuário:**
   - Email: `admin@barber.com`
   - Password: `123456`

2. **Copie o UUID e execute:**
```sql
INSERT INTO users (id, email, name, barbershop_id, role, work_hours) VALUES 
('UUID-DO-ADMIN', 'admin@barber.com', 'Roberto Silva', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'admin', 
 '[{"day": 1, "start": "09:00", "end": "18:00"}, {"day": 2, "start": "09:00", "end": "18:00"}]');
```

### 3. Configurar Row Level Security (RLS)

O script `setup.sql` já configura as políticas de segurança, mas verifique se estão ativas:

1. **Vá para Database > Tables**
2. **Para cada tabela, verifique se RLS está habilitado**
3. **Vá para Authentication > Policies para ver as regras**

### 4. Testar a Configuração

1. **Execute `npm run dev`**
2. **Acesse `http://localhost:3000`**
3. **Faça login com:**
   - **Platform Admin:** `platform@barberflow.com` / `123456`
   - **Barbershop Admin:** `admin@barber.com` / `123456`

## 🔧 Configurações Avançadas

### Adicionar Mais Barbearias

```sql
INSERT INTO barbershops (name, slug, logo_url, address) VALUES 
('Sua Barbearia', 'sua-barbearia', 'https://picsum.photos/100', 'Seu Endereço');
```

### Adicionar Profissionais

```sql
-- Primeiro crie o usuário no Authentication
-- Depois execute:
INSERT INTO users (id, email, name, barbershop_id, role, work_hours) VALUES 
('UUID-DO-PROFISSIONAL', 'profissional@barber.com', 'Nome do Profissional', 'ID-DA-BARBEARIA', 'member', 
 '[{"day": 1, "start": "09:00", "end": "18:00"}]');
```

### Adicionar Serviços

```sql
INSERT INTO services (name, price, duration, barbershop_id) VALUES 
('Novo Serviço', 50.00, 60, 'ID-DA-BARBEARIA');
```

## 🚨 Troubleshooting

### Erro de Autenticação
- Verifique se o usuário existe tanto no `auth.users` quanto na tabela `users`
- Confirme se o `id` é o mesmo nas duas tabelas

### Erro de Permissão
- Verifique se as políticas RLS estão configuradas
- Confirme se o usuário tem o `role` correto

### Dados Não Aparecem
- Verifique se o `barbershop_id` está correto
- Confirme se as foreign keys estão válidas

## 📊 Monitoramento

### Logs do Supabase
- Vá para **Logs** no painel do Supabase
- Monitore erros de API e autenticação

### Performance
- Use **Database > Performance** para monitorar queries
- Otimize índices se necessário

## 🔄 Migração do Mock para Supabase

O sistema já está configurado para usar o Supabase. Os arquivos atualizados:

- ✅ `src/services/supabaseApi.ts` - Nova API
- ✅ `src/contexts/AuthContext.tsx` - Autenticação atualizada  
- ✅ `src/pages/PlatformDashboardPage.tsx` - Dashboard atualizado

## 🎯 Próximos Passos

1. **Configure o banco seguindo este guia**
2. **Teste o login como platform admin**
3. **Verifique se os dados aparecem no dashboard**
4. **Adicione mais barbearias e usuários conforme necessário**

---

**💡 Dica:** Mantenha o `mockApi.ts` como backup caso precise voltar ao sistema mock temporariamente.