import { createClient } from '@supabase/supabase-js';

// Hardcoded temporariamente para resolver o problema
const supabaseUrl = 'https://jrggwhlbvsyvcqvywrmy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZ2d3aGxidnN5dmNxdnl3cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg4MTEsImV4cCI6MjA3NjAzNDgxMX0.Y4bUnGmgGgPnwO1SVFbq6k2yZJN7wcY01JxKBAImQKk';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types para o banco
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
          role: 'admin' | 'member';
          work_hours: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          barbershop_id: string;
          role?: 'admin' | 'member';
          work_hours?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          barbershop_id?: string;
          role?: 'admin' | 'member';
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
    };
  };
}