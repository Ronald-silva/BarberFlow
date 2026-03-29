// Serviço de Integração com Stripe - Completo
// Gerencia assinaturas, pagamentos e checkout

import Stripe from 'stripe';

// Inicializar Stripe (server-side)
const stripeSecretKey = (import.meta.env as any).STRIPE_SECRET_KEY || '';

if (!stripeSecretKey && typeof window === 'undefined') {
  console.warn('⚠️ STRIPE_SECRET_KEY não configurado. Pagamentos não funcionarão.');
}

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
}) : null;

// Planos de assinatura
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // em centavos (R$ 79,00 = 7900)
  interval: 'month' | 'year';
  features: string[];
  maxProfessionals: number | null; // null = ilimitado
  stripePriceId?: string; // ID do preço no Stripe
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Ideal para barbearias pequenas',
    price: 2990, // R$ 29,90
    interval: 'month',
    maxProfessionals: 2,
    features: [
      'Até 2 profissionais',
      'Agendamentos ilimitados',
      'Notificações WhatsApp',
      'Gestão de clientes',
      'Catálogo de serviços',
      'Pagamentos PIX',
      'Suporte por email',
    ],
  },
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Para barbearias em crescimento',
    price: 5990, // R$ 59,90
    interval: 'month',
    maxProfessionals: 5,
    features: [
      'Até 5 profissionais',
      'Agendamentos ilimitados',
      'Notificações WhatsApp + SMS',
      'Gestão completa de clientes',
      'Catálogo avançado',
      'Pagamentos PIX com desconto',
      'Relatórios avançados',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Para grandes barbearias',
    price: 9990, // R$ 99,90
    interval: 'month',
    maxProfessionals: null,
    features: [
      'Profissionais ilimitados',
      'Agendamentos ilimitados',
      'Todas as notificações',
      'CRM completo',
      'Recursos premium',
      'Todos os métodos de pagamento',
      'Relatórios personalizados',
    ],
  },
];

// Criar sessão de checkout do Stripe
export async function createCheckoutSession(
  barbershopId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string } | null> {
  if (!stripe) {
    console.error('Stripe não inicializado');
    return null;
  }

  try {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Shafar - ${plan.name}`,
              description: plan.description,
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        barbershopId,
        planId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: barbershopId,
    });

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return null;
  }
}

// Criar portal de gerenciamento de assinatura
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string | null> {
  if (!stripe) {
    console.error('Stripe não inicializado');
    return null;
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  } catch (error) {
    console.error('Erro ao criar portal do cliente:', error);
    return null;
  }
}

// Verificar status da assinatura
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    console.error('Stripe não inicializado');
    return null;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return null;
  }
}

// Cancelar assinatura
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<boolean> {
  if (!stripe) {
    console.error('Stripe não inicializado');
    return false;
  }

  try {
    if (immediately) {
      await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Cancelar no final do período
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
    return true;
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    return false;
  }
}

// Processar webhook do Stripe
export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<{ success: boolean; event?: Stripe.Event }> {
  if (!stripe) {
    return { success: false };
  }

  const webhookSecret = (import.meta.env as any).VITE_STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Webhook secret não configurado');
    return { success: false };
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        // Assinatura criada com sucesso
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Assinatura criada:', session.id);
        // TODO: Atualizar banco de dados
        break;

      case 'customer.subscription.updated':
        // Assinatura atualizada
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Assinatura atualizada:', subscription.id);
        // TODO: Atualizar banco de dados
        break;

      case 'customer.subscription.deleted':
        // Assinatura cancelada
        const deletedSub = event.data.object as Stripe.Subscription;
        console.log('❌ Assinatura cancelada:', deletedSub.id);
        // TODO: Atualizar banco de dados
        break;

      case 'invoice.payment_succeeded':
        // Pagamento bem-sucedido
        const invoice = event.data.object as Stripe.Invoice;
        console.log('💰 Pagamento recebido:', invoice.id);
        // TODO: Enviar notificação
        break;

      case 'invoice.payment_failed':
        // Pagamento falhou
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log('⚠️ Pagamento falhou:', failedInvoice.id);
        // TODO: Notificar cliente
        break;

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return { success: true, event };
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return { success: false };
  }
}

// Criar pagamento único (para agendamentos)
export async function createPaymentIntent(
  amount: number, // em centavos
  description: string,
  metadata: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  if (!stripe) {
    console.error('Stripe não inicializado');
    return null;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      description,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret || '',
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Erro ao criar payment intent:', error);
    return null;
  }
}
