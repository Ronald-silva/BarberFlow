
export enum UserRole {
  PLATFORM_ADMIN = 'platform_admin',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum AppointmentStatus {
  CONFIRMED = 'Confirmado',
  PENDING = 'Pendente',
  CANCELED = 'Cancelado',
}

export interface Barbershop {
  id: string;
  name: string;
  logoUrl: string;
  address: string;
  slug: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  barbershopId: string | null; // null para platform admins
  role: UserRole;
  workHours: { day: number, start: string, end: string }[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  barbershopId: string;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  lastVisit: string; // ISO date string
  barbershopId: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceIds: string[];
  startDateTime: string; // ISO date string
  endDateTime: string; // ISO date string
  status: AppointmentStatus;
}

export interface PlanFeatures {
  max_professionals: number | null;
  sms_notifications: boolean;
  email_notifications: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number; // em centavos
  interval: 'month' | 'year';
  price_id?: string; // Stripe price ID
  max_professionals: number | null; // null = ilimitado
  features: string[]; // Lista de features em texto
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  barbershop_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  canceled_at?: string;
  trial_end?: string;
  created_at?: string;
  updated_at?: string;
}

