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
    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      barbershops: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          brand_primary_color?: string | null;
          cpf_cnpj?: string | null;
          require_payment_before_booking?: boolean | null;
          working_hours?: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          brand_primary_color?: string | null;
          cpf_cnpj?: string | null;
          require_payment_before_booking?: boolean | null;
          working_hours?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          brand_primary_color?: string | null;
          cpf_cnpj?: string | null;
          require_payment_before_booking?: boolean | null;
          working_hours?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          barbershop_id: string | null;
          role: 'admin' | 'member' | 'platform_admin';
          work_hours: any/* Json */;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          barbershop_id: string | null;
          role?: 'admin' | 'member' | 'platform_admin';
          work_hours?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          barbershop_id?: string | null;
          role?: 'admin' | 'member' | 'platform_admin';
          work_hours?: any;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
          status: 'confirmed' | 'pending' | 'canceled' | 'completed' | 'cancelled';
          payment_status?: string | null;
          payment_method?: string | null;
          payment_required?: boolean | null;
          total_amount?: number | null;
          mp_payment_id?: string | null;
          mp_qr_code?: string | null;
          mp_qr_code_base64?: string | null;
          mp_ticket_url?: string | null;
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
          status?: 'confirmed' | 'pending' | 'canceled' | 'completed' | 'cancelled';
          payment_status?: string | null;
          payment_method?: string | null;
          payment_required?: boolean | null;
          total_amount?: number | null;
          mp_payment_id?: string | null;
          mp_qr_code?: string | null;
          mp_qr_code_base64?: string | null;
          mp_ticket_url?: string | null;
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
          status?: 'confirmed' | 'pending' | 'canceled' | 'completed' | 'cancelled';
          payment_status?: string | null;
          payment_method?: string | null;
          payment_required?: boolean | null;
          total_amount?: number | null;
          mp_payment_id?: string | null;
          mp_qr_code?: string | null;
          mp_qr_code_base64?: string | null;
          mp_ticket_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price_monthly: number;
          price_yearly: number | null;
          currency: string;
          stripe_price_id_monthly: string | null;
          stripe_price_id_yearly: string | null;
          stripe_product_id: string | null;
          asaas_plan_id_monthly: string | null;
          asaas_plan_id_yearly: string | null;
          max_professionals: number | null;
          max_services: number | null;
          max_monthly_appointments: number | null;
          features: Json;
          is_active: boolean;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price_monthly: number;
          price_yearly?: number | null;
          currency?: string;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
          stripe_product_id?: string | null;
          asaas_plan_id_monthly?: string | null;
          asaas_plan_id_yearly?: string | null;
          max_professionals?: number | null;
          max_services?: number | null;
          max_monthly_appointments?: number | null;
          features?: Json;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number | null;
          currency?: string;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
          stripe_product_id?: string | null;
          asaas_plan_id_monthly?: string | null;
          asaas_plan_id_yearly?: string | null;
          max_professionals?: number | null;
          max_services?: number | null;
          max_monthly_appointments?: number | null;
          features?: Json;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          barbershop_id: string;
          plan_id: string;
          stripe_customer_id: string | null;
          provider: 'stripe' | 'asaas';
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          provider_price_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          billing_cycle: 'monthly' | 'yearly';
          amount: number;
          currency: string;
          status: string;
          trial_start: string | null;
          ended_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean | null;
          canceled_at: string | null;
          cancellation_reason: string | null;
          metadata: Json | null;
          trial_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          barbershop_id: string;
          plan_id: string;
          stripe_customer_id?: string | null;
          provider?: 'stripe' | 'asaas';
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          provider_price_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          billing_cycle: 'monthly' | 'yearly';
          amount: number;
          currency?: string;
          status?: string;
          trial_start?: string | null;
          ended_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          cancellation_reason?: string | null;
          metadata?: Json | null;
          trial_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          barbershop_id?: string;
          plan_id?: string;
          stripe_customer_id?: string | null;
          provider?: 'stripe' | 'asaas';
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          provider_price_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          billing_cycle?: 'monthly' | 'yearly';
          amount?: number;
          currency?: string;
          status?: string;
          trial_start?: string | null;
          ended_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          cancellation_reason?: string | null;
          metadata?: Json | null;
          trial_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      consent_logs: {
        Row: {
          id: string;
          user_id: string;
          consent_type: string;
          consent_version: string;
          consent_action: string;
          ip_address: string | null;
          user_agent: string | null;
          device_info: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          consent_type: string;
          consent_version: string;
          consent_action: string;
          ip_address?: string | null;
          user_agent?: string | null;
          device_info?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          consent_type?: string;
          consent_version?: string;
          consent_action?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          device_info?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          payment_id: string;
          appointment_id: string;
          amount: number | null;
          status: string;
          payment_method: string;
          payment_data: Json | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          payment_id: string;
          appointment_id: string;
          amount?: number | null;
          status: string;
          payment_method: string;
          payment_data?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          payment_id?: string;
          appointment_id?: string;
          amount?: number | null;
          status?: string;
          payment_method?: string;
          payment_data?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      stripe_customers: {
        Row: {
          id: string;
          barbershop_id: string;
          user_id: string;
          stripe_customer_id: string;
          email: string | null;
          name: string | null;
          default_payment_method_id: string | null;
          payment_method_type: string | null;
          card_last4: string | null;
          card_brand: string | null;
          card_exp_month: number | null;
          card_exp_year: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          barbershop_id: string;
          user_id: string;
          stripe_customer_id: string;
          email?: string | null;
          name?: string | null;
          default_payment_method_id?: string | null;
          payment_method_type?: string | null;
          card_last4?: string | null;
          card_brand?: string | null;
          card_exp_month?: number | null;
          card_exp_year?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          barbershop_id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          email?: string | null;
          name?: string | null;
          default_payment_method_id?: string | null;
          payment_method_type?: string | null;
          card_last4?: string | null;
          card_brand?: string | null;
          card_exp_month?: number | null;
          card_exp_year?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_provider_configs: {
        Row: {
          id: string;
          barbershop_id: string;
          subscription_provider: 'stripe' | 'asaas';
          booking_provider: 'stripe' | 'asaas';
          fallback_provider: 'stripe' | 'asaas';
          rollout_enabled: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          barbershop_id: string;
          subscription_provider?: 'stripe' | 'asaas';
          booking_provider?: 'stripe' | 'asaas';
          fallback_provider?: 'stripe' | 'asaas';
          rollout_enabled?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          barbershop_id?: string;
          subscription_provider?: 'stripe' | 'asaas';
          booking_provider?: 'stripe' | 'asaas';
          fallback_provider?: 'stripe' | 'asaas';
          rollout_enabled?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payment_customers: {
        Row: {
          id: string;
          barbershop_id: string;
          user_id: string | null;
          provider: 'stripe' | 'asaas';
          provider_customer_id: string;
          email: string | null;
          name: string | null;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          barbershop_id: string;
          user_id?: string | null;
          provider: 'stripe' | 'asaas';
          provider_customer_id: string;
          email?: string | null;
          name?: string | null;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          barbershop_id?: string;
          user_id?: string | null;
          provider?: 'stripe' | 'asaas';
          provider_customer_id?: string;
          email?: string | null;
          name?: string | null;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          provider: 'stripe' | 'asaas';
          event_id: string;
          event_type: string;
          status: 'received' | 'processed' | 'failed';
          payload: Json;
          error_message: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider: 'stripe' | 'asaas';
          event_id: string;
          event_type: string;
          status?: 'received' | 'processed' | 'failed';
          payload?: Json;
          error_message?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider?: 'stripe' | 'asaas';
          event_id?: string;
          event_type?: string;
          status?: 'received' | 'processed' | 'failed';
          payload?: Json;
          error_message?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payment_history: {
        Row: {
          id: string;
          barbershop_id: string;
          subscription_id: string | null;
          provider: 'stripe' | 'asaas';
          provider_customer_id: string | null;
          provider_invoice_id: string | null;
          provider_payment_id: string | null;
          provider_charge_id: string | null;
          stripe_customer_id: string | null;
          stripe_invoice_id: string | null;
          stripe_payment_intent_id: string | null;
          stripe_charge_id: string | null;
          amount: number | null;
          currency: string;
          status: string | null;
          payment_method_type: string | null;
          card_last4: string | null;
          card_brand: string | null;
          payment_date: string | null;
          failure_code: string | null;
          failure_message: string | null;
          invoice_url: string | null;
          invoice_pdf: string | null;
          description: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          barbershop_id: string;
          subscription_id?: string | null;
          provider?: 'stripe' | 'asaas';
          provider_customer_id?: string | null;
          provider_invoice_id?: string | null;
          provider_payment_id?: string | null;
          provider_charge_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_invoice_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          amount?: number | null;
          currency?: string;
          status?: string | null;
          payment_method_type?: string | null;
          card_last4?: string | null;
          card_brand?: string | null;
          payment_date?: string | null;
          failure_code?: string | null;
          failure_message?: string | null;
          invoice_url?: string | null;
          invoice_pdf?: string | null;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          barbershop_id?: string;
          subscription_id?: string | null;
          provider?: 'stripe' | 'asaas';
          provider_customer_id?: string | null;
          provider_invoice_id?: string | null;
          provider_payment_id?: string | null;
          provider_charge_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_invoice_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          amount?: number | null;
          currency?: string;
          status?: string | null;
          payment_method_type?: string | null;
          card_last4?: string | null;
          card_brand?: string | null;
          payment_date?: string | null;
          failure_code?: string | null;
          failure_message?: string | null;
          invoice_url?: string | null;
          invoice_pdf?: string | null;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      email_logs: {
        Row: {
          id: string;
          barbershop_id: string | null;
          status: 'pending' | 'sent' | 'failed' | 'bounced';
          created_at: string;
        };
        Insert: {
          id?: string;
          barbershop_id?: string | null;
          status?: 'pending' | 'sent' | 'failed' | 'bounced';
          created_at?: string;
        };
        Update: {
          id?: string;
          barbershop_id?: string | null;
          status?: 'pending' | 'sent' | 'failed' | 'bounced';
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      revoke_consent: {
        Args: {
          p_user_id: string;
          p_consent_type: string;
          p_revocation_reason: string | null;
        };
        Returns: boolean;
      };
      has_active_consent: {
        Args: {
          p_user_id: string;
          p_consent_type: string;
          p_consent_version: string | null;
        };
        Returns: boolean;
      };
      has_active_subscription: {
        Args: { p_barbershop_id: string };
        Returns: boolean;
      };
      get_subscription_limits: {
        Args: { p_barbershop_id: string };
        Returns: {
          max_professionals: number | null;
          max_services: number | null;
          max_monthly_appointments: number | null;
        }[];
      };
      get_public_barbershop_by_slug: {
        Args: { p_slug: string };
        Returns: {
          id: string;
          name: string;
          slug: string;
          address: string | null;
          logo_url: string | null;
          phone: string | null;
          email: string | null;
          brand_primary_color: string | null;
          require_payment_before_booking: boolean | null;
          working_hours: unknown | null;
        }[];
      };
      is_barbershop_slug_available: {
        Args: { p_slug: string };
        Returns: boolean;
      };
    };
  };
}
