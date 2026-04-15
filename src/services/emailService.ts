// =====================================================
// EMAIL SERVICE
// =====================================================
// This service handles sending emails via Edge Functions
//
// Created: 2025-12-30
// =====================================================

import { supabase } from './supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// =====================================================
// TYPES
// =====================================================

export interface EmailOptions {
  to: string | string[];
  templateKey?: string;
  variables?: Record<string, string>;
  subject?: string;
  html?: string;
  text?: string;
  barbershopId?: string;
  userId?: string;
  appointmentId?: string;
}

export interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string | null;
  variables: string[];
  category: string;
}

export interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sent_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  created_at: string;
}

// =====================================================
// SEND EMAIL
// =====================================================

/**
 * Send an email via Edge Function
 * @param options - Email options
 * @returns Promise with message ID
 */
export async function sendEmail(options: EmailOptions): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: options.to,
        template_key: options.templateKey,
        variables: options.variables,
        subject: options.subject,
        html: options.html,
        text: options.text,
        barbershop_id: options.barbershopId,
        user_id: options.userId,
        appointment_id: options.appointmentId,
      },
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error('Não foi possível enviar o email');
    }

    if (!data?.message_id) {
      throw new Error('ID da mensagem não retornado');
    }

    return data.message_id;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Erro ao enviar email. Tente novamente.');
  }
}

// =====================================================
// APPOINTMENT EMAILS
// =====================================================

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmation(params: {
  clientEmail: string;
  clientName: string;
  barbershopName: string;
  serviceName: string;
  professionalName: string;
  appointmentDate: Date;
  appointmentTime: string;
  serviceDuration: number;
  servicePrice: string;
  barbershopUrl: string;
  barbershopAddress: string;
  barbershopPhone: string;
  barbershopId: string;
  appointmentId: string;
}): Promise<string> {
  return sendEmail({
    to: params.clientEmail,
    templateKey: 'appointment_confirmation',
    variables: {
      client_name: params.clientName,
      barbershop_name: params.barbershopName,
      service_name: params.serviceName,
      professional_name: params.professionalName,
      appointment_date: format(params.appointmentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      appointment_time: params.appointmentTime,
      service_duration: params.serviceDuration.toString(),
      service_price: params.servicePrice,
      barbershop_url: params.barbershopUrl,
      barbershop_address: params.barbershopAddress,
      barbershop_phone: params.barbershopPhone,
    },
    barbershopId: params.barbershopId,
    appointmentId: params.appointmentId,
  });
}

/**
 * Send appointment reminder (24h before)
 */
export async function sendAppointmentReminder(params: {
  clientEmail: string;
  clientName: string;
  barbershopName: string;
  serviceName: string;
  professionalName: string;
  appointmentDate: Date;
  appointmentTime: string;
  barbershopPhone: string;
  barbershopAddress: string;
  barbershopId: string;
  appointmentId: string;
}): Promise<string> {
  return sendEmail({
    to: params.clientEmail,
    templateKey: 'appointment_reminder',
    variables: {
      client_name: params.clientName,
      barbershop_name: params.barbershopName,
      service_name: params.serviceName,
      professional_name: params.professionalName,
      appointment_date: format(params.appointmentDate, "dd 'de' MMMM", { locale: ptBR }),
      appointment_time: params.appointmentTime,
      barbershop_phone: params.barbershopPhone,
      barbershop_address: params.barbershopAddress,
    },
    barbershopId: params.barbershopId,
    appointmentId: params.appointmentId,
  });
}

// =====================================================
// PAYMENT EMAILS
// =====================================================

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(params: {
  customerEmail: string;
  customerName: string;
  planName: string;
  amount: string;
  paymentDate: Date;
  nextPaymentDate: Date;
  dashboardUrl: string;
  barbershopId: string;
}): Promise<string> {
  return sendEmail({
    to: params.customerEmail,
    templateKey: 'payment_confirmed',
    variables: {
      customer_name: params.customerName,
      plan_name: params.planName,
      amount: params.amount,
      payment_date: format(params.paymentDate, "dd/MM/yyyy 'às' HH:mm"),
      next_payment_date: format(params.nextPaymentDate, "dd/MM/yyyy"),
      dashboard_url: params.dashboardUrl,
    },
    barbershopId: params.barbershopId,
  });
}

// =====================================================
// EMAIL TEMPLATES
// =====================================================

/**
 * Get all active email templates
 */
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('is_active', true)
    .order('category, name');

  if (error) {
    console.error('Error fetching email templates:', error);
    throw new Error('Não foi possível carregar os templates de email');
  }

  return data || [];
}

/**
 * Get email template by key
 */
export async function getEmailTemplate(templateKey: string): Promise<EmailTemplate | null> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching email template:', error);
    return null;
  }

  return data;
}

// =====================================================
// EMAIL LOGS
// =====================================================

/**
 * Get email logs for a barbershop
 */
export async function getEmailLogs(
  barbershopId: string,
  limit = 50
): Promise<EmailLog[]> {
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching email logs:', error);
    throw new Error('Não foi possível carregar o histórico de emails');
  }

  return (data || []) as unknown as EmailLog[];
}

/**
 * Get email stats for a barbershop
 */
export async function getEmailStats(barbershopId: string): Promise<{
  total: number;
  sent: number;
  failed: number;
  pending: number;
}> {
  const { data, error } = await supabase
    .from('email_logs')
    .select('status')
    .eq('barbershop_id', barbershopId);

  if (error) {
    console.error('Error fetching email stats:', error);
    return { total: 0, sent: 0, failed: 0, pending: 0 };
  }

  const stats = data.reduce(
    (acc, log) => {
      acc.total++;
      if (log.status === 'sent') acc.sent++;
      if (log.status === 'failed') acc.failed++;
      if (log.status === 'pending') acc.pending++;
      return acc;
    },
    { total: 0, sent: 0, failed: 0, pending: 0 }
  );

  return stats;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Format email status to Portuguese
 */
export function formatEmailStatus(status: EmailLog['status']): string {
  const statusMap: Record<EmailLog['status'], string> = {
    pending: 'Pendente',
    sent: 'Enviado',
    failed: 'Falhou',
    bounced: 'Rejeitado',
  };

  return statusMap[status] || status;
}

/**
 * Get status color for UI
 */
export function getEmailStatusColor(status: EmailLog['status']): string {
  const colorMap: Record<EmailLog['status'], string> = {
    pending: '#FFA500', // Orange
    sent: '#4CAF50', // Green
    failed: '#FF5722', // Red
    bounced: '#9E9E9E', // Gray
  };

  return colorMap[status] || '#000000';
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date for emails
 */
export function formatEmailDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
}
