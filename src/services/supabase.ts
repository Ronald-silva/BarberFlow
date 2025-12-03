import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERRO: Variáveis de ambiente do Supabase não configuradas!');
  console.error('Por favor, configure o arquivo .env na raiz do projeto:');
  console.error('VITE_SUPABASE_URL=sua_url_aqui');
  console.error('VITE_SUPABASE_ANON_KEY=sua_chave_aqui');
  console.error('\n📝 Dica: Copie .env.example para .env e preencha os valores corretos.');
}

// Criar cliente (com valores fake se não configurado, para não quebrar a app)
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient<Database>(url, key);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      barbershops: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          barbershop_id: string;
          role: 'admin' | 'member' | 'platform_admin';
          work_hours: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          barbershop_id: string;
          role?: 'admin' | 'member' | 'platform_admin';
          work_hours?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          barbershop_id?: string;
          role?: 'admin' | 'member' | 'platform_admin';
          work_hours?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          price: number;
          duration: number;
          barbershop_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          duration: number;
          barbershop_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          duration?: number;
          barbershop_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          whatsapp: string;
          barbershop_id: string;
          last_visit: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          whatsapp: string;
          barbershop_id: string;
          last_visit?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          whatsapp?: string;
          barbershop_id?: string;
          last_visit?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          professional_id: string;
          barbershop_id: string;
          service_ids: string[];
          start_datetime: string;
          end_datetime: string;
          status: 'confirmed' | 'pending' | 'canceled' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          professional_id: string;
          barbershop_id: string;
          service_ids: string[];
          start_datetime: string;
          end_datetime: string;
          status?: 'confirmed' | 'pending' | 'canceled' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          professional_id?: string;
          barbershop_id?: string;
          service_ids?: string[];
          start_datetime?: string;
          end_datetime?: string;
          status?: 'confirmed' | 'pending' | 'canceled' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          interval: string;
          max_professionals: number | null;
          features: Json | null;
          active: boolean;
          stripe_price_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          interval?: string;
          max_professionals?: number | null;
          features?: Json | null;
          active?: boolean;
          stripe_price_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          interval?: string;
          max_professionals?: number | null;
          features?: Json | null;
          active?: boolean;
          stripe_price_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          barbershop_id: string;
          plan_id: string;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean | null;
          canceled_at: string | null;
          trial_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          barbershop_id: string;
          plan_id: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          trial_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          barbershop_id?: string;
          plan_id?: string;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          trial_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
