/**
 * Tipos para checkout de serviços da barbearia (pagamento do cliente final).
 * A barbearia escolhe o provedor e quais métodos oferecer; a API monta o payload correto.
 */

/** Provedores de pagamento suportados pela camada de API */
export type CheckoutProviderId =
  | 'stripe'
  | 'mercadopago'
  | 'asaas'
  /** PIX copia-e-cola com chave cadastrada pela barbearia (sem gateway) */
  | 'manual_pix';

/**
 * Métodos de pagamento normalizados (independente do gateway).
 * Cada provedor mapeia para o respectivo tipo na API deles.
 */
export type CheckoutMethod =
  | 'card'
  | 'debit_card'
  | 'pix'
  | 'boleto'
  | 'wallet';

/** Configuração por barbearia (persistir depois em JSON no banco, ex.: payment_settings) */
export interface BarbershopPaymentSettings {
  provider: CheckoutProviderId;
  /** Subconjunto dos métodos que o provider suporta */
  enabledMethods: CheckoutMethod[];
  /** Provider manual_pix: chave PIX (email, telefone, aleatória ou EVP) */
  manualPixKey?: string;
  /** Exibido no comprovante / descrição */
  merchantDisplayName?: string;
}

export interface CheckoutOrderInput {
  barbershopId: string;
  appointmentId?: string;
  /** Valor em reais (ex.: 85.5) */
  amountBrl: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerTaxId?: string;
  successUrl: string;
  failureUrl?: string;
  pendingUrl?: string;
  cancelUrl: string;
  webhookUrl?: string;
  /** Referência única (ex.: appointment id ou UUID) — idempotência / conciliação */
  externalReference: string;
}
