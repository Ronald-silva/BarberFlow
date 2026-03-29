# 🗂️ Configuração Manual do Storage - Supabase Dashboard

## ⚠️ Problema com SQL

Se você recebeu o erro "deve ser proprietário dos objetos da tabela", use este método manual através da interface do Supabase.

## 🎯 Configuração via Dashboard

### 1. **Acessar Storage**
1. Abra o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral

### 2. **Criar Bucket**
1. Clique em **"New bucket"**
2. Configure:
   - **Name:** `barbershop-assets`
   - **Public bucket:** ✅ Habilitado
   - **File size limit:** `5 MB`
   - **Allowed MIME types:** 
     - `image/jpeg`
     - `image/png` 
     - `image/gif`
     - `image/webp`
3. Clique em **"Create bucket"**

### 3. **Configurar Políticas RLS**
1. Ainda no Storage, clique no bucket `barbershop-assets`
2. Vá na aba **"Policies"**
3. Clique em **"New policy"**

#### Política 1: Upload (INSERT)
- **Policy name:** `Allow authenticated upload`
- **Allowed operation:** `INSERT`
- **Target roles:** `authenticated`
- **USING expression:** 
  ```sql
  bucket_id = 'barbershop-assets'
  ```

#### Política 2: Visualização (SELECT)
- **Policy name:** `Allow public view`
- **Allowed operation:** `SELECT`
- **Target roles:** `public`
- **USING expression:**
  ```sql
  bucket_id = 'barbershop-assets'
  ```

#### Política 3: Atualização (UPDATE)
- **Policy name:** `Allow authenticated update`
- **Allowed operation:** `UPDATE`
- **Target roles:** `authenticated`
- **USING expression:**
  ```sql
  bucket_id = 'barbershop-assets'
  ```

#### Política 4: Exclusão (DELETE)
- **Policy name:** `Allow authenticated delete`
- **Allowed operation:** `DELETE`
- **Target roles:** `authenticated`
- **USING expression:**
  ```sql
  bucket_id = 'barbershop-assets'
  ```

## 🚀 Método Alternativo (Mais Simples)

### Opção 1: Bucket Público Simples
1. Crie o bucket como **público**
2. **NÃO** configure políticas RLS
3. O sistema funcionará, mas com menos segurança

### Opção 2: Usar SQL Simples
Execute apenas este comando no SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('barbershop-assets', 'barbershop-assets', true)
ON CONFLICT (id) DO NOTHING;
```

## 🧪 Testar Configuração

### 1. **Verificar Bucket**
```sql
SELECT * FROM storage.buckets WHERE id = 'barbershop-assets';
```

### 2. **Testar Upload**
1. Execute `npm run dev`
2. Acesse configurações
3. Tente fazer upload de uma imagem
4. Verifique se aparece no bucket

### 3. **Verificar Políticas**
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'barbershop-assets';
```

## 🔧 Troubleshooting

### Erro: "Bucket não encontrado"
- Verifique se o bucket foi criado
- Confirme o nome exato: `barbershop-assets`

### Erro: "Acesso negado"
- Verifique se o bucket é público
- Verifique as políticas RLS
- Teste sem políticas primeiro

### Erro: "Arquivo muito grande"
- Verifique o limite de 5MB
- Comprima a imagem antes do upload

## 💡 Dicas Importantes

1. **Bucket público** é mais simples mas menos seguro
2. **Políticas RLS** oferecem mais controle
3. **Teste sempre** após configurar
4. **Backup** das configurações importantes

## 🎯 Resultado Esperado

Após a configuração, você deve conseguir:
- ✅ Fazer upload de imagens
- ✅ Visualizar imagens públicamente
- ✅ Atualizar/remover imagens
- ✅ Ver arquivos no dashboard do Supabase