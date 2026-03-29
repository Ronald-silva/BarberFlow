// =====================================================
// STRIPE CONFIGURATION
// =====================================================
// This file configures Stripe for the Shafar application
//
// IMPORTANT: Never expose your Secret Key in frontend code!
// Only use the Publishable Key here.
//
// Created: 2025-12-30
// =====================================================

import { loadStripe, Stripe } from '@stripe/stripe-js';

// =====================================================
// 1. STRIPE PUBLISHABLE KEY
// =====================================================
// Get from Vite environment variables
// Format: pk_test_... (Test mode) or pk_live_... (Production)

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn(
    '⚠️  VITE_STRIPE_PUBLISHABLE_KEY não está configurada. ' +
    'Adicione-a ao arquivo .env para habilitar pagamentos.'
  );
}

// =====================================================
// 2. STRIPE INSTANCE
// =====================================================
// Singleton instance - load only once

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise && STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise || Promise.resolve(null);
};

// =====================================================
// 3. STRIPE CONFIGURATION
// =====================================================

export const stripeConfig = {
  // Publishable Key (safe to expose in frontend)
  publishableKey: STRIPE_PUBLISHABLE_KEY,

  // Currency
  currency: 'BRL' as const,

  // Locale
  locale: 'pt-BR' as const,

  // Payment Methods Enabled
  paymentMethods: ['card'] as const, // Can add 'pix', 'boleto' later

  // Test mode check
  isTestMode: STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') || false,

  // Checkout settings
  checkout: {
    // Where to redirect after successful payment
    successUrl: `${window.location.origin}/dashboard?payment=success`,

    // Where to redirect after cancelled payment
    cancelUrl: `${window.location.origin}/pricing?payment=cancelled`,
  },
};

// =====================================================
// 4. PRICE IDs MAPPING (Optional)
// =====================================================
// Map plan slugs to Stripe Price IDs
// These should match the stripe_price_id_monthly/yearly in database

export const STRIPE_PRICE_IDS = {
  // Básico Plan
  basic_monthly: import.meta.env.VITE_STRIPE_PRICE_BASIC_MONTHLY || '',
  basic_yearly: import.meta.env.VITE_STRIPE_PRICE_BASIC_YEARLY || '',

  // Profissional Plan
  professional_monthly: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY || '',
  professional_yearly: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL_YEARLY || '',

  // Premium Plan
  premium_monthly: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY || '',
  premium_yearly: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_YEARLY || '',
} as const;

// =====================================================
// 5. HELPER FUNCTIONS
// =====================================================

/**
 * Format price in BRL currency
 * @param amount - Amount in cents or decimal (e.g., 4990 or 49.90)
 * @param inCents - Whether the amount is in cents (default: false)
 */
export function formatPrice(amount: number, inCents = false): string {
  const value = inCents ? amount / 100 : amount;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return Boolean(STRIPE_PUBLISHABLE_KEY);
}

/**
 * Get Stripe Price ID for a plan
 * @param planSlug - Plan slug (basic, professional, premium)
 * @param billingCycle - Billing cycle (monthly, yearly)
 */
export function getStripePriceId(
  planSlug: 'basic' | 'professional' | 'premium',
  billingCycle: 'monthly' | 'yearly'
): string {
  const key = `${planSlug}_${billingCycle}` as keyof typeof STRIPE_PRICE_IDS;
  return STRIPE_PRICE_IDS[key] || '';
}

// =====================================================
// 6. TYPE EXPORTS
// =====================================================

export type BillingCycle = 'monthly' | 'yearly';
export type PlanSlug = 'basic' | 'professional' | 'premium';

export interface StripeCheckoutParams {
  priceId: string;
  barbershopId: string;
  customerId?: string;
  successUrl?: string;
  cancelUrl?: string;
}
