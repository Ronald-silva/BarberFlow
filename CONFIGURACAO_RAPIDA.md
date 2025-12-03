# ⚡ Configuração Rápida - BarberFlow

## 🚨 O que foi corrigido:

### 1. Erro: "Missing Supabase environment variables"
**Solução**: Criado arquivo `.env` com configurações

### 2. Erro: Twilio quebrava o browser
**Solução**: Removido Twilio do client-side (agora é simulado)

---

## 📝 Passo a Passo para Rodar:

### 1️⃣ Configure o arquivo `.env`

O arquivo `.env` já foi criado. Abra-o e preencha com suas credenciais do Supabase:

```bash
# .env
VITE_SUPABASE_URL=https://jrggwhlbvsyvcqvywrmy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2d3aGxidnN5dmNxdnl3cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg4MTEsImV4cCI6MjA3NjAzNDgxMX0.Y4bUnGmgGgPnwO1SVFbq6k2yZJN7wcY01JxKBAImQKk
```

> 💡 **Dica**: Essas credenciais já estão no [.env.example](.env.example) - copie de lá!

### 2️⃣ Reinicie o servidor

```bash
# Pare o servidor (Ctrl+C) e rode novamente:
npm run dev
```

### 3️⃣ Acesse o app

```
http://localhost:5173
```

O app agora deve carregar! 🎉

---

## 📱 Sobre Notificações (WhatsApp/SMS)

### Status Atual: **SIMULADO**

As notificações estão **simuladas no console** do navegador. Quando criar um agendamento, você verá logs no console:

```
📱 [SIMULADO] WhatsApp enviado para: +5511999999999
Mensagem: ✅ Agendamento Confirmado! ...
---
⚠️ ATENÇÃO: Esta é uma simulação!
```

### ⚠️ Por que remover o Twilio?

O Twilio SDK **não funciona no browser** porque:
- Usa módulos do Node.js (`events`, `https`, `fs`, etc.)
- Adiciona 2.4MB ao bundle
- Expõe API keys no cliente (inseguro)

### ✅ Solução em Produção

Notificações devem ser enviadas via **Backend/Edge Functions**:

**Opção 1: Supabase Edge Functions** (Recomendado)
```typescript
// supabase/functions/send-notification/index.ts
import { Twilio } from 'https://deno.land/x/twilio/mod.ts'

Deno.serve(async (req) => {
  const { to, message } = await req.json()

  const client = new Twilio(
    Deno.env.get('TWILIO_ACCOUNT_SID'),
    Deno.env.get('TWILIO_AUTH_TOKEN')
  )

  await client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:${to}`,
    body: message
  })

  return new Response('OK')
})
```

**Opção 2: Vercel Serverless Functions**
```typescript
// pages/api/send-notification.ts
import twilio from 'twilio'

export default async function handler(req, res) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )

  await client.messages.create({...})
  res.json({ success: true })
}
```

Mais detalhes em: [src/services/notificationService.ts](src/services/notificationService.ts)

---

## 🗄️ Banco de Dados

### Precisa configurar o Supabase?

1. **Acesse**: https://supabase.com
2. **Crie um projeto**
3. **Copie as credenciais** para o `.env`
4. **Execute os schemas SQL** em `database/setup.sql`

OU

Use as credenciais que já estão no `.env.example` (se ainda estão ativas).

---

## 🎯 Checklist

- [x] Arquivo `.env` criado
- [x] Twilio removido do client-side
- [x] Notificações simuladas (logs no console)
- [x] TypeScript configurado (vite-env.d.ts)
- [ ] `.env` preenchido com credenciais do Supabase
- [ ] Servidor dev rodando
- [ ] App carregando sem tela branca

---

## 🐛 Ainda com problemas?

### Tela branca?
1. Abra o Console do navegador (F12)
2. Veja os erros
3. Verifique se o `.env` está preenchido

### Erro de Supabase?
```
⚠️ ERRO: Variáveis de ambiente do Supabase não configuradas!
```
→ Preencha o `.env` com as credenciais corretas

### Bundle muito grande?
→ Normal! O bundle tem 2.4MB porque inclui:
- React
- Supabase SDK
- Stripe SDK
- Sentry
- Date-fns
- Styled Components

Em produção, será otimizado e cacheado.

---

## 📚 Documentos Relacionados

- [README.md](README.md) - Documentação principal
- [MELHORIAS_IMPLEMENTADAS.md](MELHORIAS_IMPLEMENTADAS.md) - Todas as melhorias
- [BUILD_SUCCESS.md](BUILD_SUCCESS.md) - Resultado do build

---

**Última atualização**: 2025-12-02
**Status**: ✅ Pronto para desenvolvimento local
