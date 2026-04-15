/**
 * API de checkout para barbearias: principais gateways BR + opção PIX manual.
 *
 * Uso:
 * 1. Liste opções com `listCheckoutProviderOptions()`.
 * 2. Barbearia escolhe `provider` + `enabledMethods` (validado com `validateBarbershopPaymentSettings`).
 * 3. No momento do pagamento, chame `prepareBarbershopCheckout(settings, order)` e envie o retorno
 *    ao seu backend / Edge Function (nunca exponha secrets de MP/Asaas/Stripe no front).
 *
 * Referências oficiais:
 * - Stripe BR: https://stripe.com/docs/payments/pix
 * - Mercado Pago Preferences: https://www.mercadopago.com.br/developers/pt/reference/preferences/_checkout_preferences/post
 * - Asaas Cobranças: https://docs.asaas.com/reference/criar-nova-cobranca
 */

import type {
  BarbershopPaymentSettings,
  CheckoutMethod,
  CheckoutOrderInput,
  CheckoutProviderId,
} from '../types/barbershopPayments';
import { supabase } from './supabase';

// ─── Registro de capacidades (o que cada API suporta) ─────────────────────────

export interface CheckoutProviderDefinition {
  id: CheckoutProviderId;
  label: string;
  /** Métodos que a API deste provider consegue processar */
  supportedMethods: CheckoutMethod[];
  /**
   * Variáveis típicas — secrets só no servidor.
   * Prefixo VITE_ só para chaves publicáveis no front.
   */
  envHints: string[];
  docsUrl: string;
}

export const CHECKOUT_PROVIDER_REGISTRY: Record<CheckoutProviderId, CheckoutProviderDefinition> = {
  stripe: {
    id: 'stripe',
    label: 'Stripe',
    supportedMethods: ['card', 'debit_card', 'pix', 'wallet'],
    envHints: [
      'VITE_STRIPE_PUBLISHABLE_KEY (front)',
      'STRIPE_SECRET_KEY (servidor / Edge Function)',
      'STRIPE_WEBHOOK_SECRET (webhook)',
    ],
    docsUrl: 'https://stripe.com/docs/payments/checkout',
  },
  mercadopago: {
    id: 'mercadopago',
    label: 'Mercado Pago',
    supportedMethods: ['card', 'debit_card', 'pix', 'boleto', 'wallet'],
    envHints: [
      'VITE_MERCADOPAGO_PUBLIC_KEY (front — opcional, Checkout Bricks)',
      'MERCADOPAGO_ACCESS_TOKEN (servidor — Preferences / API)',
    ],
    docsUrl: 'https://www.mercadopago.com.br/developers/pt/docs/checkout-api/overview',
  },
  asaas: {
    id: 'asaas',
    label: 'Asaas',
    supportedMethods: ['card', 'debit_card', 'pix', 'boleto'],
    envHints: ['ASAAS_API_KEY ($aact_...) servidor apenas', 'ASAAS_ENV (production | sandbox)'],
    docsUrl: 'https://docs.asaas.com/docs/payments',
  },
  manual_pix: {
    id: 'manual_pix',
    label: 'PIX manual (chave da barbearia)',
    supportedMethods: ['pix'],
    envHints: ['Chave PIX cadastrada na barbearia (dados, sem API de gateway)'],
    docsUrl: 'https://www.bcb.gov.br/estabilidadefinanceira/pix',
  },
};

export function listCheckoutProviderOptions(): CheckoutProviderDefinition[] {
  return Object.values(CHECKOUT_PROVIDER_REGISTRY);
}

export function getProviderDefinition(id: CheckoutProviderId): CheckoutProviderDefinition {
  return CHECKOUT_PROVIDER_REGISTRY[id];
}

/** Retorna sugestão de métodos típicos no Brasil para um provider */
export function suggestedMethodsForBrazil(provider: CheckoutProviderId): CheckoutMethod[] {
  switch (provider) {
    case 'stripe':
      return ['pix', 'card'];
    case 'mercadopago':
      return ['pix', 'card', 'boleto'];
    case 'asaas':
      return ['pix', 'card', 'boleto'];
    case 'manual_pix':
      return ['pix'];
    default:
      return [];
  }
}

export function validateBarbershopPaymentSettings(
  settings: BarbershopPaymentSettings
): { ok: true } | { ok: false; error: string } {
  const def = CHECKOUT_PROVIDER_REGISTRY[settings.provider];
  if (!def) {
    return { ok: false, error: 'Provedor inválido.' };
  }
  if (!settings.enabledMethods.length) {
    return { ok: false, error: 'Selecione ao menos um método de pagamento.' };
  }
  const unsupported = settings.enabledMethods.filter((m) => !def.supportedMethods.includes(m));
  if (unsupported.length) {
    return {
      ok: false,
      error: `Métodos não suportados por ${def.label}: ${unsupported.join(', ')}`,
    };
  }
  if (settings.provider === 'manual_pix' && !settings.manualPixKey?.trim()) {
    return { ok: false, error: 'Informe a chave PIX para o modo manual.' };
  }
  return { ok: true };
}

/** Filtra métodos habilitados para os tipos aceitos pelo Stripe (payment_method_types) */
export function toStripePaymentMethodTypes(methods: CheckoutMethod[]): Array<'card' | 'pix'> {
  const types = new Set<'card' | 'pix'>();
  for (const m of methods) {
    if (m === 'pix') types.add('pix');
    if (m === 'card' || m === 'debit_card' || m === 'wallet') types.add('card');
    // boleto no Stripe BR pode ser habilitado na conta; incluir se você usar 'boleto' no painel Stripe
  }
  return types.size ? [...types] : ['card'];
}

export type MercadoPagoPreferenceBody = {
  /** Brasil: BRL */
  currency_id?: string;
  items: Array<{ title: string; quantity: number; unit_price: number }>;
  payer?: { name?: string; email?: string };
  back_urls?: { success?: string; failure?: string; pending?: string };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
  payment_methods?: {
    excluded_payment_types?: Array<{ id: string }>;
    excluded_payment_methods?: Array<{ id: string }>;
    installments?: number;
  };
  metadata?: Record<string, string>;
};

export type AsaasBillingType = 'UNDEFINED' | 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'DEBIT_CARD';

/** Quando o cliente já escolheu o método (fluxo Asaas: uma cobrança por billingType) */
export function checkoutMethodToAsaasBillingType(method: CheckoutMethod): AsaasBillingType {
  switch (method) {
    case 'pix':
      return 'PIX';
    case 'boleto':
      return 'BOLETO';
    case 'card':
      return 'CREDIT_CARD';
    case 'debit_card':
      return 'DEBIT_CARD';
    default:
      return 'UNDEFINED';
  }
}

function brlToCents(amountBrl: number): number {
  return Math.round(amountBrl * 100);
}

function mpItemUnitPrice(amountBrl: number): number {
  // Mercado Pago preference unit_price em moeda local com decimais conforme doc
  return Number(amountBrl.toFixed(2));
}

// ─── Resultado unificado (front envia ao backend / Edge Function) ─────────────

export type PreparedBarbershopCheckout =
  | {
      provider: 'stripe';
      stripe: {
        paymentMethodTypes: Array<'card' | 'pix'>;
        amountCents: number;
        currency: 'brl';
        metadata: Record<string, string>;
        /** Indicador para sua Edge Function já existente ou nova */
        intent: 'payment_intent' | 'checkout_session';
      };
    }
  | {
      provider: 'mercadopago';
      mercadoPago: {
        preference: MercadoPagoPreferenceBody;
        http: { method: 'POST'; url: 'https://api.mercadopago.com/checkout/preferences' };
      };
    }
  | {
      provider: 'asaas';
      asaas: {
        /** billingType deve refletir o método que o cliente escolheu na UI */
        billingType: AsaasBillingType;
        body: {
          customer?: string;
          billingType: AsaasBillingType;
          value: number;
          dueDate: string;
          description: string;
          externalReference: string;
          callback?: { successUrl?: string };
        };
        http: { method: 'POST'; url: 'https://api.asaas.com/v3/payments' };
      };
    }
  | {
      provider: 'manual_pix';
      manualPix: {
        pixKey: string;
        amountBrl: number;
        description: string;
        /** Instrução: gerar BR Code no servidor ou app com biblioteca EMC / PIX */
        note: string;
      };
    };

export type PrepareCheckoutOptions = {
  /** Para Asaas, obrigatório quando há mais de um método ou sempre que criar cobrança */
  selectedMethod?: CheckoutMethod;
  /** ID do cliente Asaas (cadastrado previamente na API Asaas) */
  asaasCustomerId?: string;
};

/**
 * Monta o payload específico do provedor escolhido pela barbearia.
 * Não faz chamadas HTTP — apenas estrutura dados para o backend seguro.
 */
export function prepareBarbershopCheckout(
  settings: BarbershopPaymentSettings,
  order: CheckoutOrderInput,
  options: PrepareCheckoutOptions = {}
): PreparedBarbershopCheckout {
  const validation = validateBarbershopPaymentSettings(settings);
  if (validation.ok === false) {
    throw new Error(validation.error);
  }

  const meta: Record<string, string> = {
    barbershop_id: order.barbershopId,
    external_reference: order.externalReference,
  };
  if (order.appointmentId) meta.appointment_id = order.appointmentId;

  switch (settings.provider) {
    case 'stripe': {
      return {
        provider: 'stripe',
        stripe: {
          paymentMethodTypes: toStripePaymentMethodTypes(settings.enabledMethods),
          amountCents: brlToCents(order.amountBrl),
          currency: 'brl',
          metadata: meta,
          intent: 'payment_intent',
        },
      };
    }
    case 'mercadopago': {
      const preference: MercadoPagoPreferenceBody = {
        currency_id: 'BRL',
        items: [
          {
            title: order.description.slice(0, 200) || 'Serviço',
            quantity: 1,
            unit_price: mpItemUnitPrice(order.amountBrl),
          },
        ],
        payer: {
          name: order.customerName,
          email: order.customerEmail,
        },
        back_urls: {
          success: order.successUrl,
          failure: order.failureUrl ?? order.cancelUrl,
          pending: order.pendingUrl ?? order.successUrl,
        },
        auto_return: 'approved',
        external_reference: order.externalReference,
        notification_url: order.webhookUrl,
        metadata: meta,
      };
      return {
        provider: 'mercadopago',
        mercadoPago: {
          preference,
          http: { method: 'POST', url: 'https://api.mercadopago.com/checkout/preferences' },
        },
      };
    }
    case 'asaas': {
      const method =
        options.selectedMethod ??
        (settings.enabledMethods.length === 1 ? settings.enabledMethods[0] : undefined);
      if (!method) {
        throw new Error(
          'Asaas: informe selectedMethod nas opções quando a barbearia oferece mais de um método.'
        );
      }
      if (!options.asaasCustomerId?.trim()) {
        throw new Error('Asaas: informe asaasCustomerId (customer id na API Asaas).');
      }
      const billingType = checkoutMethodToAsaasBillingType(method);
      if (billingType === 'UNDEFINED') {
        throw new Error('Método não suportado para cobrança Asaas direta (use card, pix ou boleto).');
      }
      const due = new Date();
      due.setDate(due.getDate() + 3);
      const dueDate = due.toISOString().slice(0, 10);
      return {
        provider: 'asaas',
        asaas: {
          billingType,
          body: {
            customer: options.asaasCustomerId,
            billingType,
            value: Number(order.amountBrl.toFixed(2)),
            dueDate,
            description: order.description.slice(0, 500),
            externalReference: order.externalReference,
            callback: { successUrl: order.successUrl },
          },
          http: { method: 'POST', url: 'https://api.asaas.com/v3/payments' },
        },
      };
    }
    case 'manual_pix': {
      return {
        provider: 'manual_pix',
        manualPix: {
          pixKey: settings.manualPixKey!.trim(),
          amountBrl: order.amountBrl,
          description: order.description,
          note:
            'Gerar EMV/BR Code no backend com biblioteca PIX ou exibir chave para transferência manual.',
        },
      };
    }
    default: {
      const _exhaustive: never = settings.provider;
      throw new Error(`Provedor não implementado: ${_exhaustive}`);
    }
  }
}

/**
 * Serializa o prepared checkout para JSON (ex.: corpo de Edge Function).
 */
export function serializePreparedCheckout(prepared: PreparedBarbershopCheckout): string {
  return JSON.stringify(prepared);
}

/**
 * Executa checkout preparado via Edge Function segura.
 * Mantém o front sem exposição de secrets dos gateways.
 */
export async function executeBarbershopCheckout(
  prepared: PreparedBarbershopCheckout,
  appointmentId: string
): Promise<{
  provider: CheckoutProviderId;
  paymentId: string;
  paymentUrl?: string;
  qrCode?: string;
  pixCode?: string;
  status: string;
}> {
  let providerForBackend: 'stripe' | 'asaas';
  let method: 'pix' | 'credit_card' | 'debit_card' | 'boleto';
  let amount: number;
  let description: string;

  switch (prepared.provider) {
    case 'stripe':
      providerForBackend = 'stripe';
      method = prepared.stripe.paymentMethodTypes.includes('pix') ? 'pix' : 'credit_card';
      amount = prepared.stripe.amountCents / 100;
      description = 'Pagamento de serviço';
      break;
    case 'asaas':
      providerForBackend = 'asaas';
      method =
        prepared.asaas.billingType === 'PIX'
          ? 'pix'
          : prepared.asaas.billingType === 'BOLETO'
          ? 'boleto'
          : prepared.asaas.billingType === 'DEBIT_CARD'
          ? 'debit_card'
          : 'credit_card';
      amount = prepared.asaas.body.value;
      description = prepared.asaas.body.description;
      break;
    case 'mercadopago':
      // Mantemos fallback operacional para Stripe até existir função dedicada de MP.
      providerForBackend = 'stripe';
      method = 'credit_card';
      amount = prepared.mercadoPago.preference.items[0]?.unit_price || 0;
      description = prepared.mercadoPago.preference.items[0]?.title || 'Pagamento de serviço';
      break;
    case 'manual_pix':
      providerForBackend = 'asaas';
      method = 'pix';
      amount = prepared.manualPix.amountBrl;
      description = prepared.manualPix.description;
      break;
    default:
      throw new Error('Checkout não suportado para execução');
  }

  const { data, error } = await supabase.functions.invoke('create-booking-payment', {
    body: {
      appointment_id: appointmentId,
      provider: providerForBackend,
      method,
      amount,
      description,
    },
  });

  if (error) {
    throw new Error(error.message || 'Falha ao executar checkout');
  }

  return {
    provider: prepared.provider,
    paymentId: data.paymentId,
    paymentUrl: data.paymentUrl,
    qrCode: data.qrCode,
    pixCode: data.pixCode,
    status: data.status,
  };
}
