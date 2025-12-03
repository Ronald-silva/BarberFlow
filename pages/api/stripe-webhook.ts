// pages/api/stripe-webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../../src/services/supabase';
import { buffer } from 'micro';

// É necessário desabilitar o bodyParser padrão da Next.js
// para que possamos receber o evento raw do Stripe para verificação da assinatura.
export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Stripe webhook event received:', event.type);

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                const subscription = event.data.object as Stripe.Subscription;
                await upsertSubscription(subscription);
                break;
            
            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                // Se for um pagamento de assinatura, o 'subscription.updated' já cuidará disso.
                // Mas podemos usar este evento para confirmar a renovação.
                if (invoice.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
                    await upsertSubscription(subscription);
                }
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Error processing webhook:', error.message);
        res.status(500).json({ message: 'Internal Server Error while processing webhook.' });
    }
};

/**
 * Atualiza ou insere o registro de assinatura no nosso banco de dados.
 * @param sub - O objeto de assinatura do Stripe.
 */
const upsertSubscription = async (sub: Stripe.Subscription) => {
    const barbershopId = sub.metadata.barbershop_id;
    if (!barbershopId) {
        console.error('CRITICAL: Barbershop ID not found in subscription metadata.', sub.id);
        return;
    }

    const planId = sub.items.data[0].price.product as string; // ou o que fizer sentido
    const priceId = sub.items.data[0].price.id;

    // Buscar o ID do nosso plano baseado no price_id
    const { data: plan } = await supabase
        .from('plans')
        .select('id')
        .eq('price_id', priceId)
        .single();
    
    if (!plan) {
        console.error(`CRITICAL: Plan with price_id ${priceId} not found in DB.`);
        return;
    }

    const subscriptionData = {
        barbershop_id: barbershopId,
        plan_id: plan.id,
        stripe_subscription_id: sub.id,
        status: sub.status,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    };

    const { error } = await supabase
        .from('subscriptions')
        .upsert({ ...subscriptionData, id: undefined }, { onConflict: 'stripe_subscription_id' });

    if (error) {
        console.error('Failed to upsert subscription:', error);
        throw error;
    }
    console.log(`Subscription ${sub.id} for barbershop ${barbershopId} processed.`);
};

export default handler;
