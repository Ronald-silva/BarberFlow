# 🔧 Configuração de Variáveis de Ambiente

## ✅ Problema Resolvido

O erro `process is not defined` foi corrigido alterando as referências de `process.env` para `import.meta.env` (padrão do Vite).

## 📋 Variáveis de Ambiente Necessárias

### 1. **Criar arquivo `.env`**
```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

### 2. **Configurar Supabase (Obrigatório)**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui
```

### 3. **Configurar Pagamentos (Opcional)**
```env
# PIX
VITE_PIX_KEY=sua_chave_pix_aqui

# Bitcoin
VITE_BITCOIN_ADDRESS=seu_endereco_bitcoin_aqui
VITE_BLOCKCHAIN_API_KEY=sua_api_key_blockchain_aqui

# WhatsApp (Opcional)
VITE_WHATSAPP_TOKEN=seu_token_whatsapp_aqui
VITE_WHATSAPP_PHONE_ID=seu_phone_id_aqui
```

## 🚀 Como Obter as Configurações

### Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Vá em Settings > API
3. Copie a URL e a chave pública (anon key)

### PIX (Opcional)
- Use sua chave PIX (email, telefone, CPF ou chave aleatória)

### Bitcoin (Opcional)
- Crie uma carteira Bitcoin
- Use APIs como Blockchain.info ou BlockCypher

### WhatsApp Business (Opcional)
- Configure WhatsApp Business API
- Obtenha token e phone ID

## ⚠️ Importante

- **Nunca** commite o arquivo `.env` no Git
- Use apenas a chave **pública** (anon) do Supabase
- As variáveis com `VITE_` são expostas no browser
- Para dados sensíveis, use backend/serverless functions

## 🧪 Testar Configuração

```bash
# Executar em desenvolvimento
npm run dev

# Verificar no console do navegador
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

## 🔒 Segurança

- ✅ Chaves públicas do Supabase são seguras no frontend
- ✅ PIX key pode ser exposta (é pública mesmo)
- ❌ Nunca exponha chaves privadas ou tokens sensíveis
- ❌ Use backend para operações críticas de pagamento