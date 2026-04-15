// =====================================================
// SUBSCRIPTION SERVICE
// =====================================================
// This service handles all subscription-related operations
// including fetching plans, creating checkouts, and managing subscriptions
//
// Created: 2025-12-30
// =====================================================

import { supabase } from './supabase';

// =====================================================
// 1. TYPES
// =====================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  stripe_price_id_monthly: string;
  stripe_price_id_yearly: string;
  stripe_product_id: string;
  max_professionals: number | null;
  max_services: number | null;
  max_monthly_appointments: number | null;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  barbershop_id: string;
  plan_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  billing_cycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  status: 'incomplete' | 'active' | 'past_due' | 'canceled' | 'trialing';
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string;
  current_period_end: string;
  canceled_at: string | null;
  ended_at: string | null;
  cancel_at_period_end: boolean;
  cancellation_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StripeCustomer {
  id: string;
  barbershop_id: string;
  user_id: string;
  stripe_customer_id: string;
  email: string;
  name: string;
  default_payment_method_id: string | null;
  payment_method_type: string | null;
  card_last4: string | null;
  card_brand: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  barbershop_id: string;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  payment_method_type: string | null;
  card_last4: string | null;
  card_brand: string | null;
  payment_date: string | null;
  failure_code: string | null;
  failure_message: string | null;
  invoice_url: string | null;
  invoice_pdf: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// =====================================================
// 2. FETCH SUBSCRIPTION PLANS
// =====================================================

/**
 * Fetch all active subscription plans
 * @returns Array of subscription plans ordered by sort_order
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching subscription plans:', error);
    throw new Error('Não foi possível carregar os planos de assinatura');
  }

  return data || [];
}

/**
 * Fetch a specific plan by slug
 * @param slug - Plan slug (basic, professional, premium)
 */
export async function getSubscriptionPlanBySlug(
  slug: string
): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching subscription plan:', error);
    return null;
  }

  return data;
}

// =====================================================
// 3. SUBSCRIPTION MANAGEMENT
// =====================================================

/**
 * Get active subscription for a barbershop
 * @param barbershopId - Barbershop UUID
 */
export async function getActiveSubscription(
  barbershopId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching active subscription:', error);
    throw new Error('Não foi possível carregar a assinatura ativa');
  }

  return data as Subscription;
}

/**
 * Get subscription with plan details
 * @param barbershopId - Barbershop UUID
 */
export async function getSubscriptionWithPlan(barbershopId: string): Promise<{
  subscription: Subscription | null;
  plan: SubscriptionPlan | null;
}> {
  const subscription = await getActiveSubscription(barbershopId);

  if (!subscription) {
    return { subscription: null, plan: null };
  }

  const { data: plan, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', subscription.plan_id)
    .single();

  if (error) {
    console.error('Error fetching subscription plan:', error);
    return { subscription, plan: null };
  }

  return { subscription, plan };
}

/**
 * Check if barbershop has an active subscription
 * @param barbershopId - Barbershop UUID
 */
export async function hasActiveSubscription(
  barbershopId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_active_subscription', {
    p_barbershop_id: barbershopId,
  });

  if (error) {
    console.error('Error checking active subscription:', error);
    return false;
  }

  return data || false;
}

/**
 * Get subscription limits for a barbershop
 * @param barbershopId - Barbershop UUID
 */
export async function getSubscriptionLimits(barbershopId: string): Promise<{
  max_professionals: number | null;
  max_services: number | null;
  max_monthly_appointments: number | null;
} | null> {
  const { data, error } = await supabase.rpc('get_subscription_limits', {
    p_barbershop_id: barbershopId,
  });

  if (error) {
    console.error('Error fetching subscription limits:', error);
    return null;
  }

  return data?.[0] || null;
}

// =====================================================
// 4. STRIPE CUSTOMER MANAGEMENT
// =====================================================

/**
 * Get Stripe customer for a barbershop
 * @param barbershopId - Barbershop UUID
 */
export async function getStripeCustomer(
  barbershopId: string
): Promise<StripeCustomer | null> {
  const { data, error } = await supabase
    .from('stripe_customers')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching Stripe customer:', error);
    return null;
  }

  return data as unknown as StripeCustomer;
}

/**
 * Create or update Stripe customer
 * @param customerId - Stripe customer UUID
 * @param customerData - Customer data to update
 */
export async function updateStripeCustomer(
  customerId: string,
  customerData: Partial<StripeCustomer>
): Promise<StripeCustomer | null> {
  const { data, error } = await supabase
    .from('stripe_customers')
    .update(customerData as Record<string, unknown>)
    .eq('id', customerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating Stripe customer:', error);
    return null;
  }

  return data as unknown as StripeCustomer;
}

// =====================================================
// 5. PAYMENT HISTORY
// =====================================================

/**
 * Get payment history for a barbershop
 * @param barbershopId - Barbershop UUID
 * @param limit - Number of records to fetch (default: 10)
 */
export async function getPaymentHistory(
  barbershopId: string,
  limit = 10
): Promise<PaymentHistory[]> {
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('payment_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching payment history:', error);
    throw new Error('Não foi possível carregar o histórico de pagamentos');
  }

  return (data || []) as PaymentHistory[];
}

/**
 * Get latest successful payment
 * @param barbershopId - Barbershop UUID
 */
export async function getLatestPayment(
  barbershopId: string
): Promise<PaymentHistory | null> {
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .eq('status', 'succeeded')
    .order('payment_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching latest payment:', error);
    return null;
  }

  return data as PaymentHistory;
}

// =====================================================
// 6. CHECKOUT (Frontend → Backend)
// =====================================================

/**
 * Create Stripe checkout session
 * This should call an Edge Function or API endpoint
 *
 * @param planId - Subscription plan ID
 * @param billingCycle - monthly or yearly
 * @param barbershopId - Barbershop UUID
 * @returns Checkout session URL
 */
export async function createCheckoutSession(
  planId: string,
  billingCycle: 'monthly' | 'yearly',
  barbershopId: string
): Promise<string> {
  try {
    // Call Supabase Edge Function (to be created)
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        plan_id: planId,
        billing_cycle: billingCycle,
        barbershop_id: barbershopId,
      },
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Não foi possível criar a sessão de pagamento');
    }

    if (!data?.url) {
      throw new Error('URL de checkout não retornada');
    }

    return data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Erro ao criar sessão de checkout. Tente novamente.');
  }
}

/**
 * Create Stripe Customer Portal session
 * Allows users to manage their subscription, payment methods, etc.
 *
 * @param barbershopId - Barbershop UUID
 * @returns Customer portal URL
 */
export async function createCustomerPortalSession(
  barbershopId: string
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: {
        barbershop_id: barbershopId,
      },
    });

    if (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Não foi possível criar a sessão do portal');
    }

    if (!data?.url) {
      throw new Error('URL do portal não retornada');
    }

    return data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new Error('Erro ao criar sessão do portal. Tente novamente.');
  }
}

// =====================================================
// 7. UTILITY FUNCTIONS
// =====================================================

/**
 * Format subscription status to Portuguese
 */
export function formatSubscriptionStatus(status: Subscription['status']): string {
  const statusMap: Record<Subscription['status'], string> = {
    incomplete: 'Incompleta',
    active: 'Ativa',
    past_due: 'Pagamento Pendente',
    canceled: 'Cancelada',
    trialing: 'Período de Teste',
  };

  return statusMap[status] || status;
}

/**
 * Get status color for UI
 */
export function getSubscriptionStatusColor(status: Subscription['status']): string {
  const colorMap: Record<Subscription['status'], string> = {
    incomplete: '#FFA500', // Orange
    active: '#4CAF50', // Green
    past_due: '#FF5722', // Red
    canceled: '#9E9E9E', // Gray
    trialing: '#2196F3', // Blue
  };

  return colorMap[status] || '#000000';
}

/**
 * Calculate days until subscription end
 */
export function getDaysUntilEnd(currentPeriodEnd: string): number {
  const endDate = new Date(currentPeriodEnd);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Format date to Portuguese
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
