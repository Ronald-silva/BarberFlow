// pages/api/create-customer-portal-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../../src/services/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { barbershopId } = req.body;
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Não autorizado: Token não fornecido.' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ message: 'Não autorizado: Token inválido.' });
    }

    // Busque o ID do cliente Stripe do nosso banco de dados
    const { data: barbershop, error: dbError } = await supabase
      .from('barbershops')
      .select('stripe_customer_id')
      .eq('id', barbershopId)
      .single();

    if (dbError || !barbershop || !barbershop.stripe_customer_id) {
      return res.status(404).json({ message: 'Cliente não encontrado no sistema de pagamento.' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: barbershop.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings`,
    });

    res.status(200).json({ url: portalSession.url });

  } catch (error: any) {
    console.error('Stripe Portal Error:', error.message);
    res.status(500).json({ message: `Erro do servidor: ${error.message}` });
  }
};

export default handler;
