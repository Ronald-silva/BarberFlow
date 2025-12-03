// Tipos TypeScript para Subscriptions e Plans

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number; // em centavos
  interval: 'month' | 'year';
  maxProfessionals: number | null; // null = ilimitado
  features: string[];
  stripePriceId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  barbershopId: string;
  planId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
}

// Adicionar ao final do arquivo types/index.ts existente
