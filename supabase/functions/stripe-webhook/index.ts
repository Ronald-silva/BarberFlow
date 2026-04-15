// =====================================================
// STRIPE WEBHOOK - Supabase Edge Function
// =====================================================
// This Edge Function handles Stripe webhook events and syncs
// subscription data with the database
//
// Events handled:
// - checkout.session.completed
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
//
// Deploy: supabase functions deploy stripe-webhook
// Test: supabase functions serve stripe-webhook
//
// Created: 2025-12-30
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno';

type SupabaseAdmin = ReturnType<typeof createClient>;

async function registerWebhookEvent(
  supabase: SupabaseAdmin,
  event: Stripe.Event
): Promise<{ alreadyProcessed: boolean }> {
  const payload = {
    provider: 'stripe',
    event_id: event.id,
    event_type: event.type,
    status: 'received',
    payload: event,
  };

  const { error } = await supabase.from('webhook_events').insert(payload);
  if (!error) {
    return { alreadyProcessed: false };
  }

  if ((error as { code?: string }).code === '23505') {
    return { alreadyProcessed: true };
  }

  throw error;
}

async function finalizeWebhookEvent(
  supabase: SupabaseAdmin,
  eventId: string,
  status: 'processed' | 'failed',
  errorMessage?: string
) {
  await supabase
    .from('webhook_events')
    .update({
      status,
      error_message: errorMessage || null,
      processed_at: new Date().toISOString(),
    })
    .eq('provider', 'stripe')
    .eq('event_id', eventId);
}

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  try {
    // 1. Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET não configurada');
    }

    // 2. Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 3. Initialize Supabase client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Get webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Stripe signature não encontrada');
    }

    // 5. Verify webhook signature and parse event
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log(`Received event: ${event.type}`);
    const { alreadyProcessed } = await registerWebhookEvent(supabaseAdmin, event);
    if (alreadyProcessed) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 6. Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, supabaseAdmin);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription, supabaseAdmin);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, supabaseAdmin);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice, supabaseAdmin);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice, supabaseAdmin);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await finalizeWebhookEvent(supabaseAdmin, event.id, 'processed');

    // 7. Return success response
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const parsedBody = await req.clone().text();
      const eventIdMatch = parsedBody.match(/"id"\s*:\s*"([^"]+)"/);
      if (eventIdMatch?.[1]) {
        await finalizeWebhookEvent(
          supabaseAdmin,
          eventIdMatch[1],
          'failed',
          error instanceof Error ? error.message : 'Webhook error'
        );
      }
    } catch {
      // noop
    }

    return new Response(
      JSON.stringify({
        error: error.message || 'Webhook error',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

// =====================================================
// EVENT HANDLERS
// =====================================================

/**
 * Handle checkout.session.completed event
 * Creates or updates subscription in database
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const barbershopId = session.metadata?.barbershop_id;
  const planId = session.metadata?.plan_id;
  const billingCycle = session.metadata?.billing_cycle;

  if (!barbershopId || !planId || !billingCycle) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Get subscription from Stripe
  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error('No subscription ID in checkout session');
    return;
  }

  // Get Stripe customer ID
  const { data: stripeCustomer } = await supabase
    .from('stripe_customers')
    .select('id')
    .eq('barbershop_id', barbershopId)
    .single();

  if (!stripeCustomer) {
    console.error('Stripe customer not found');
    return;
  }

  console.log(`Checkout completed for barbershop ${barbershopId}, subscription ${subscriptionId}`);
}

/**
 * Handle customer.subscription.created or customer.subscription.updated
 * Syncs subscription data with database
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: any) {
  const barbershopId = subscription.metadata?.barbershop_id;
  const planId = subscription.metadata?.plan_id;
  const billingCycle = subscription.metadata?.billing_cycle;

  if (!barbershopId || !planId) {
    console.error('Missing metadata in subscription');
    return;
  }

  // Get Stripe customer ID
  const { data: stripeCustomer } = await supabase
    .from('stripe_customers')
    .select('id')
    .eq('barbershop_id', barbershopId)
    .single();

  if (!stripeCustomer) {
    console.error('Stripe customer not found');
    return;
  }

  // Prepare subscription data
  const subscriptionData = {
    barbershop_id: barbershopId,
    plan_id: planId,
    provider: 'stripe',
    provider_customer_id: subscription.customer as string,
    provider_subscription_id: subscription.id,
    provider_price_id: subscription.items.data[0]?.price.id || null,
    stripe_customer_id: stripeCustomer.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price.id || null,
    billing_cycle: billingCycle || 'monthly',
    amount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
    currency: subscription.currency.toUpperCase(),
    status: subscription.status,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    ended_at: subscription.ended_at
      ? new Date(subscription.ended_at * 1000).toISOString()
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    metadata: subscription.metadata || {},
  };

  // Upsert subscription
  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'stripe_subscription_id',
    });

  if (error) {
    console.error('Error upserting subscription:', error);
  } else {
    console.log(`Subscription ${subscription.id} synced successfully`);
  }
}

/**
 * Handle customer.subscription.deleted
 * Marks subscription as cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      ended_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  } else {
    console.log(`Subscription ${subscription.id} marked as cancelled`);
  }
}

/**
 * Handle invoice.payment_succeeded
 * Records successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log('Invoice not related to a subscription');
    return;
  }

  // Get subscription from database
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, barbershop_id, stripe_customer_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!subscription) {
    console.error('Subscription not found for invoice');
    return;
  }

  // Get Stripe customer from database
  const { data: stripeCustomer } = await supabase
    .from('stripe_customers')
    .select('id')
    .eq('id', subscription.stripe_customer_id)
    .single();

  // Prepare payment history data
  const paymentData = {
    barbershop_id: subscription.barbershop_id,
    subscription_id: subscription.id,
    provider: 'stripe',
    provider_customer_id: invoice.customer as string,
    provider_invoice_id: invoice.id,
    provider_payment_id: invoice.payment_intent as string,
    provider_charge_id: invoice.charge as string,
    stripe_customer_id: stripeCustomer?.id || null,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: invoice.payment_intent as string,
    stripe_charge_id: invoice.charge as string,
    amount: (invoice.amount_paid || 0) / 100,
    currency: invoice.currency.toUpperCase(),
    status: 'succeeded',
    payment_method_type: invoice.payment_intent
      ? 'card' // Can extract from payment intent if needed
      : null,
    payment_date: new Date((invoice.status_transitions?.paid_at || 0) * 1000).toISOString(),
    invoice_url: invoice.hosted_invoice_url,
    invoice_pdf: invoice.invoice_pdf,
    description: invoice.description || `Pagamento assinatura`,
    metadata: invoice.metadata || {},
  };

  // Insert payment history
  const { error } = await supabase.from('payment_history').insert(paymentData);

  if (error) {
    console.error('Error inserting payment history:', error);
  } else {
    console.log(`Payment ${invoice.id} recorded successfully`);
  }
}

/**
 * Handle invoice.payment_failed
 * Records failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log('Invoice not related to a subscription');
    return;
  }

  // Get subscription from database
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id, barbershop_id, stripe_customer_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (!subscription) {
    console.error('Subscription not found for invoice');
    return;
  }

  // Get Stripe customer from database
  const { data: stripeCustomer } = await supabase
    .from('stripe_customers')
    .select('id')
    .eq('id', subscription.stripe_customer_id)
    .single();

  // Prepare payment history data
  const paymentData = {
    barbershop_id: subscription.barbershop_id,
    subscription_id: subscription.id,
    provider: 'stripe',
    provider_customer_id: invoice.customer as string,
    provider_invoice_id: invoice.id,
    provider_payment_id: invoice.payment_intent as string,
    stripe_customer_id: stripeCustomer?.id || null,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: invoice.payment_intent as string,
    amount: (invoice.amount_due || 0) / 100,
    currency: invoice.currency.toUpperCase(),
    status: 'failed',
    payment_date: new Date().toISOString(),
    failure_code: invoice.last_finalization_error?.code || null,
    failure_message: invoice.last_finalization_error?.message || 'Falha no pagamento',
    invoice_url: invoice.hosted_invoice_url,
    description: invoice.description || `Pagamento assinatura falhou`,
    metadata: invoice.metadata || {},
  };

  // Insert payment history
  const { error } = await supabase.from('payment_history').insert(paymentData);

  if (error) {
    console.error('Error inserting payment history:', error);
  } else {
    console.log(`Failed payment ${invoice.id} recorded successfully`);
  }
}
