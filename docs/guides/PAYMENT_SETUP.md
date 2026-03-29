# Configuração do Sistema de Pagamento PIX + Bitcoin

## 🚀 Visão Geral

O sistema implementa pagamentos via PIX e Bitcoin com as seguintes funcionalidades:

- ✅ Pagamento PIX com QR Code automático
- ✅ Pagamento Bitcoin com monitoramento blockchain
- ✅ Interface moderna com countdown timer
- ✅ Confirmação automática de pagamentos
- ✅ Notificações WhatsApp (opcional)

## 📋 Configuração Necessária

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e configure:

```bash
# PIX Configuration
REACT_APP_PIX_KEY=sua_chave_pix_aqui
# Exemplos:
# CPF: 12345678901
# CNPJ: 12345678000195  
# Email: pagamento@barbearia.com
# Telefone: +5511999999999

# Bitcoin Configuration  
REACT_APP_BITCOIN_ADDRESS=seu_endereco_bitcoin_aqui
# Exemplo: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh

# Opcional - API Blockchain para monitoramento avançado
REACT_APP_BLOCKCHAIN_API_KEY=sua_chave_blockchain_api_aqui
```

### 2. Banco de Dados

Execute o script SQL no Supabase:

```sql
-- Execute o arquivo supabase-payment-schema.sql
```

## 🔧 Como Funciona

### Fluxo PIX
1. Cliente escolhe PIX como método de pagamento
2. Sistema gera código PIX (BR Code) automaticamente
3. QR Code é criado via API pública
4. Cliente escaneia e paga
5. Confirmação manual ou via webhook bancário

### Fluxo Bitcoin  
1. Cliente escolhe Bitcoin como método de pagamento
2. Sistema consulta cotação atual (CoinDesk API)
3. Calcula valor em BTC
4. Gera QR Code Bitcoin URI
5. Monitora blockchain automaticamente (Blockstream API)
6. Confirma pagamento quando recebido

## 💡 Vantagens Implementadas

### PIX
- ✅ Zero taxas para o estabelecimento
- ✅ Recebimento instantâneo
- ✅ Disponível 24/7
- ✅ QR Code automático
- ✅ Compatível com todos os bancos

### Bitcoin
- ✅ Taxas muito baixas
- ✅ Atrai clientes tech-savvy
- ✅ Pagamento global
- ✅ Monitoramento automático
- ✅ Cotação em tempo real

## 🛠️ Personalização

### Modificar Tempo de Expiração
```typescript
// Em paymentService.ts
const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min PIX
const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 min Bitcoin
```

### Adicionar Novos Métodos
```typescript
// Estender PaymentMethod type
export type PaymentMethod = 'pix' | 'bitcoin' | 'credit_card' | 'debit_card';

// Implementar no paymentService.ts
async createCreditCardPayment(data: PaymentData): Promise<PaymentResponse> {
  // Integração com Stripe/Mercado Pago
}
```

## 🔒 Segurança

- ✅ Endereços Bitcoin únicos por transação (recomendado)
- ✅ Validação de valores recebidos
- ✅ Timeout automático para pagamentos
- ✅ RLS policies no Supabase
- ✅ Sanitização de dados de entrada

## 📱 Interface do Usuário

- ✅ Modal responsivo e moderno
- ✅ Seleção visual de método de pagamento
- ✅ QR Codes grandes e claros
- ✅ Countdown timer visível
- ✅ Status em tempo real
- ✅ Botões de copiar código/endereço
- ✅ Feedback visual de confirmação

## 🚀 Próximos Passos

1. **Configurar chaves PIX e Bitcoin** nos arquivos de ambiente
2. **Executar migration** do banco de dados
3. **Testar pagamentos** em ambiente de desenvolvimento
4. **Configurar webhooks** para confirmação automática PIX (opcional)
5. **Implementar HD Wallet** para endereços Bitcoin únicos (produção)

## 📞 Suporte

Para dúvidas sobre configuração:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme que o schema do banco foi executado
3. Teste com valores pequenos primeiro
4. Monitore logs do console para erros

## 🎯 Benefícios para o Negócio

- **Redução de custos**: PIX elimina taxas de cartão
- **Aumento de conversão**: Métodos de pagamento modernos
- **Diferenciação**: Bitcoin atrai público tech
- **Automação**: Confirmação sem intervenção manual
- **Experiência**: Interface profissional e intuitiva