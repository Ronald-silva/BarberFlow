import { beforeEach, describe, expect, it, vi } from 'vitest';

const { invoke, getSession, refreshSession } = vi.hoisted(() => ({
  invoke: vi.fn(),
  getSession: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getSession,
      refreshSession,
    },
    functions: { invoke },
  },
}));

import { createCheckoutSession } from '../subscriptionService';
import { supabase } from '../supabase';

function sessionWithToken(access_token: string, expiresInSec = 3600) {
  return {
    data: {
      session: {
        access_token,
        expires_at: Math.floor(Date.now() / 1000) + expiresInSec,
      },
    },
  };
}

describe('fluxo de checkout (mockado, sem Asaas / sem sandbox)', () => {
  beforeEach(() => {
    invoke.mockReset();
    getSession.mockReset();
    refreshSession.mockReset();
    getSession.mockResolvedValue(sessionWithToken('fake-user-jwt'));
  });

  it('createCheckoutSession devolve a URL da Edge Function (Asaas)', async () => {
    invoke.mockResolvedValue({
      data: { url: 'https://example.com/fake-checkout-asaas' },
      error: null,
    });

    const url = await createCheckoutSession(
      '11111111-1111-4111-8111-111111111111',
      'monthly',
      '22222222-2222-4222-8222-222222222222',
      'asaas',
    );

    expect(url).toBe('https://example.com/fake-checkout-asaas');
    expect(invoke).toHaveBeenCalledWith(
      'create-checkout-session',
      expect.objectContaining({
        body: {
          plan_id: '11111111-1111-4111-8111-111111111111',
          billing_cycle: 'monthly',
          barbershop_id: '22222222-2222-4222-8222-222222222222',
          provider: 'asaas',
        },
        headers: { Authorization: 'Bearer fake-user-jwt' },
      }),
    );
  });

  it('createCheckoutSession devolve a URL da Edge Function (Stripe)', async () => {
    invoke.mockResolvedValue({
      data: { url: 'https://checkout.stripe.com/c/pay/cs_test_fake' },
      error: null,
    });

    const url = await createCheckoutSession(
      '11111111-1111-4111-8111-111111111111',
      'yearly',
      '22222222-2222-4222-8222-222222222222',
      'stripe',
    );

    expect(url).toContain('stripe.com');
    expect(invoke).toHaveBeenCalledWith(
      'create-checkout-session',
      expect.objectContaining({
        body: expect.objectContaining({
          provider: 'stripe',
          billing_cycle: 'yearly',
        }),
      }),
    );
  });

  it('usa o cliente supabase mockado (sem rede)', () => {
    expect(supabase.functions.invoke).toBe(invoke);
  });
});
