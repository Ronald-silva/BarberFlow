// pages/api/create-checkout-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../../src/services/supabase';

// Inicialize o cliente Stripe com a chave secreta.
// As chaves virão de variáveis de ambiente.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { priceId, barbershopId } = req.body;
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Não autorizado: Token não fornecido.' });
    }

    // Verifique o token com o Supabase para garantir que o usuário está autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ message: 'Não autorizado: Token inválido.' });
    }

    // Verifique se o usuário pertence à barbearia
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('barbershop_id')
      .eq('user_id', user.id)
      .eq('barbershop_id', barbershopId)
      .single();

    if (roleError || !roleData) {
        return res.status(403).json({ message: 'Acesso negado: Usuário não pertence à barbearia.' });
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('barbershop_id', barbershopId)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Se o cliente ainda não existir no Stripe, crie um.
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: barbershopId, // Apenas para referência
            metadata: {
                barbershop_id: barbershopId,
            },
        });
        customerId = customer.id;

        // Salve o ID do cliente no nosso banco para uso futuro
        await supabase
          .from('barbershops') // Assumindo que você tem uma coluna stripe_customer_id na tabela barbershops
          .update({ stripe_customer_id: customerId })
          .eq('id', barbershopId);
    }
    
    // Crie a Sessão de Checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: customerId,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?payment_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?payment_cancelled=true`,
      metadata: {
        barbershop_id: barbershopId,
      }
    });

    res.status(200).json({ sessionId: session.id, url: session.url });

  } catch (error: any) {
    console.error('Stripe Error:', error.message);
    res.status(500).json({ message: `Erro do servidor: ${error.message}` });
  }
};

export default handler;
