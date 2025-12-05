# Configuração do Supabase para Login e Cadastro

## ⚠️ IMPORTANTE: Configuração de Autenticação

Para que o login e cadastro funcionem corretamente, você precisa configurar o Supabase corretamente:

## 1. Desabilitar Confirmação de Email (Desenvolvimento)

Por padrão, o Supabase exige que os usuários confirmem o email antes de fazer login. Para desenvolvimento e testes, você pode desabilitar essa confirmação:

### Passos:
1. Acesse o **Supabase Dashboard**: https://app.supabase.com
2. Selecione seu projeto: `jrggwhlbvsyvcqvywrmy`
3. No menu lateral, vá em **Authentication** → **Settings**
4. Procure por **"Email Auth"**
5. **DESABILITE** a opção: **"Enable email confirmations"**
6. Clique em **Save**

## 2. Configurar URL de Redirecionamento (Site URLs)

Configure as URLs permitidas para redirecionamento após autenticação:

### Passos:
1. No Supabase Dashboard, vá em **Authentication** → **URL Configuration**
2. Em **"Site URL"**, adicione: `http://localhost:5173`
3. Em **"Redirect URLs"**, adicione:
   - `http://localhost:5173/login`
   - `http://localhost:5173/dashboard`
   - `https://seu-dominio-de-producao.com` (quando fizer deploy)

## 3. Verificar Políticas RLS (Row Level Security)

Certifique-se de que as políticas de segurança permitem inserção de dados:

### Tabela `users`:
```sql
-- Permitir INSERT para usuários autenticados
CREATE POLICY "Permitir INSERT para novos usuários"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Permitir SELECT para o próprio usuário
CREATE POLICY "Usuários podem ver seus próprios dados"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### Tabela `barbershops`:
```sql
-- Permitir INSERT para usuários autenticados
CREATE POLICY "Permitir INSERT de barbearias"
ON barbershops FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir SELECT para todos
CREATE POLICY "Qualquer um pode ver barbearias"
ON barbershops FOR SELECT
TO authenticated
USING (true);
```

### Tabela `services`:
```sql
-- Permitir INSERT para admin da barbearia
CREATE POLICY "Admin pode inserir serviços"
ON services FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.barbershop_id = barbershop_id
    AND users.role = 'admin'
  )
);
```

## 4. Testar a Configuração

### Teste de Cadastro:
1. Acesse: `http://localhost:5173/register`
2. Preencha todos os dados da barbearia
3. Preencha os dados do administrador
4. Clique em "Criar Barbearia"
5. **Abra o Console do Navegador (F12)** e verifique se há erros

### Teste de Login:
1. Acesse: `http://localhost:5173/login`
2. Use o email e senha que você cadastrou
3. Clique em "Entrar"
4. Você deve ser redirecionado para `/dashboard`

## 5. Verificar Erros Comuns

### Erro: "Email confirmations required"
- **Solução**: Desabilite a confirmação de email (passo 1)

### Erro: "Invalid email or password"
- **Solução**: Verifique se o email e senha estão corretos
- **Solução**: Verifique se o usuário foi criado no Supabase Auth (Authentication → Users)

### Erro: "Row level security policy violation"
- **Solução**: Configure as políticas RLS (passo 3)
- **Solução**: Temporariamente, desabilite RLS para testes (não recomendado para produção)

### Erro: "User already registered"
- **Solução**: Use outro email ou faça login com o email existente

## 6. Verificar Dados no Supabase

### No Supabase Dashboard:
1. **Authentication → Users**: Verifique se o usuário foi criado
2. **Table Editor → barbershops**: Verifique se a barbearia foi criada
3. **Table Editor → users**: Verifique se o registro do usuário foi criado
4. **Table Editor → services**: Verifique se os serviços padrão foram criados

## 7. Deploy em Produção

Quando fizer deploy:
1. Atualize as **Site URLs** no Supabase com a URL de produção
2. **HABILITE** a confirmação de email para segurança
3. Configure um servidor SMTP para envio de emails (Settings → Auth → SMTP Settings)
4. Teste o fluxo completo de cadastro e login

## 🔧 Scripts SQL Úteis

### Verificar se um usuário existe:
```sql
SELECT * FROM auth.users WHERE email = 'seu@email.com';
```

### Verificar dados do usuário na tabela users:
```sql
SELECT * FROM users WHERE email = 'seu@email.com';
```

### Deletar usuário (caso precise começar do zero):
```sql
-- CUIDADO: Isso deleta permanentemente!
DELETE FROM users WHERE email = 'seu@email.com';
DELETE FROM auth.users WHERE email = 'seu@email.com';
```

## 📞 Suporte

Se ainda estiver com problemas:
1. Verifique os logs do navegador (F12 → Console)
2. Verifique os logs do Supabase (Logs → Edge Functions)
3. Revise as configurações acima
4. Verifique se as variáveis de ambiente estão corretas no arquivo `.env`
