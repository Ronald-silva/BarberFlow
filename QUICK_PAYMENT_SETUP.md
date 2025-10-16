# 🚀 Setup Rápido - PIX + Bitcoin

## ⚡ Configuração em 5 Minutos

### 1. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite com suas chaves
nano .env.local
```

**Configurações mínimas necessárias:**

```env
# PIX - Use sua chave PIX (CPF, CNPJ, email ou telefone)
REACT_APP_PIX_KEY=seu_cpf_ou_email@exemplo.com

# Bitcoin - Use um endereço Bitcoin válido
REACT_APP_BITCOIN_ADDRESS=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
```

### 2. Execute o Schema do Banco

No Supabase SQL Editor, execute:

```sql
-- Cole o conteúdo do arquivo supabase-payment-schema.sql
```

### 3. Teste o Sistema

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Acesse: http://localhost:5173
# Vá para uma barbearia e teste um agendamento
```

## 🎯 Fluxo de Teste

1. **Acesse uma barbearia** (ex: `/booking/barbearia-exemplo`)
2. **Selecione serviços** e horário
3. **Preencha dados** do cliente
4. **Clique em "Confirmar Agendamento"**
5. **Modal de pagamento** abrirá automaticamente
6. **Escolha PIX ou Bitcoin**
7. **Escaneie o QR Code** ou copie o código
8. **Pagamento será confirmado** automaticamente

## 💡 Dicas Importantes

### PIX
- ✅ Use uma chave PIX real para testes
- ✅ QR Code é gerado automaticamente
- ✅ Confirmação manual (por enquanto)

### Bitcoin
- ✅ Use endereço Bitcoin de teste
- ✅ Cotação em tempo real
- ✅ Monitoramento automático via blockchain
- ⚠️ Para testes, use valores pequenos (R$ 1-5)

## 🔧 Personalização Rápida

### Alterar Tempo de Expiração
```typescript
// Em services/paymentService.ts, linha ~45
const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
```

### Alterar Valores de Teste
```typescript
// Em pages/BookingPage.tsx, use valores pequenos para teste
const testAmount = 5.00; // R$ 5,00 para testes
```

### Desabilitar Bitcoin (só PIX)
```typescript
// Em components/PaymentModal.tsx, remova o botão Bitcoin
// Ou defina selectedMethod como 'pix' por padrão
```

## 🚨 Troubleshooting

### Erro: "PIX Key não configurada"
```bash
# Verifique se a variável está definida
echo $REACT_APP_PIX_KEY
```

### Erro: "Bitcoin address inválido"
```bash
# Use um endereço Bitcoin válido (bc1... ou 1... ou 3...)
```

### QR Code não aparece
```bash
# Verifique conexão com internet (usa API pública)
# Ou implemente geração local de QR Code
```

## 🎉 Pronto!

Agora você tem um sistema completo de pagamento PIX + Bitcoin funcionando!

**Próximos passos:**
- Configure webhooks para confirmação automática PIX
- Implemente HD Wallet para Bitcoin
- Adicione notificações WhatsApp
- Configure ambiente de produção

**Suporte:** Verifique os logs do console para debugging.