# 🚀 Configuração do Supabase - BarberFlow

## Passos para Finalizar a Integração

### 1. **Configurar Variáveis de Ambiente**
1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings** → **API**
3. Copie a **URL** e **anon public key**
4. Edite o arquivo `.env.local` e substitua:

```env
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 2. **Criar as Tabelas no Banco**
1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute o conteúdo do arquivo `supabase-schema.sql`
3. Depois execute o conteúdo do arquivo `supabase-seed.sql`

### 3. **Configurar RLS (Row Level Security)**
No SQL Editor, execute também:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo por enquanto)
CREATE POLICY "Allow all operations" ON barbershops FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON services FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON appointments FOR ALL USING (true);
```

### 4. **Testar a Aplicação**
1. Execute `npm run dev`
2. Acesse `http://localhost:5173`
3. Faça login com: `admin@barber.com` (qualquer senha)
4. Teste o agendamento em: `http://localhost:5173/#/book/navalha-dourada`

### 5. **Credenciais de Teste**
- **Admin:** admin@barber.com
- **Profissional 1:** thiago@barber.com  
- **Profissional 2:** felipe@barber.com
- **Barbearia:** navalha-dourada

## ✅ Funcionalidades Agora Disponíveis

- ✅ Login real com banco de dados
- ✅ Agendamentos persistentes
- ✅ Clientes salvos automaticamente
- ✅ Dashboard com dados reais
- ✅ Gestão de serviços e profissionais
- ✅ Validação de conflitos de horários

## 🔧 Próximos Passos

1. **Autenticação Real:** Implementar Supabase Auth
2. **Validações:** Adicionar validações de horários
3. **Notificações:** Integrar WhatsApp API
4. **Deploy:** Fazer deploy no Vercel/Netlify

## 🆘 Problemas Comuns

**Erro de CORS:** Verifique se as URLs estão corretas no .env.local
**Erro 401:** Verifique se a chave anon está correta
**Tabelas não encontradas:** Execute os scripts SQL no Supabase