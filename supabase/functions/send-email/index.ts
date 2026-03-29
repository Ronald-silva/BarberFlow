// =====================================================
// SEND EMAIL - Supabase Edge Function
// =====================================================
// This Edge Function sends emails using Resend
// and logs all attempts to the database
//
// Deploy: supabase functions deploy send-email
// Test: supabase functions serve send-email
//
// Created: 2025-12-30
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// =====================================================
// CORS HEADERS
// =====================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// TYPES
// =====================================================

interface SendEmailRequest {
  to: string | string[];
  template_key?: string;
  variables?: Record<string, string>;
  subject?: string;
  html?: string;
  text?: string;
  barbershop_id?: string;
  user_id?: string;
  appointment_id?: string;
}

interface ResendResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
}

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurada');
    }

    // 2. Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Parse request body
    const body: SendEmailRequest = await req.json();

    if (!body.to) {
      throw new Error('Campo "to" é obrigatório');
    }

    // Normalize "to" to array
    const recipients = Array.isArray(body.to) ? body.to : [body.to];

    // 4. Get email template if template_key is provided
    let emailSubject = body.subject || '';
    let emailHtml = body.html || '';
    let emailText = body.text || '';

    if (body.template_key) {
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('subject, html_body, text_body')
        .eq('template_key', body.template_key)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        throw new Error(`Template ${body.template_key} não encontrado`);
      }

      emailSubject = template.subject;
      emailHtml = template.html_body;
      emailText = template.text_body || '';

      // Replace variables in template
      if (body.variables) {
        for (const [key, value] of Object.entries(body.variables)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          emailSubject = emailSubject.replace(regex, value);
          emailHtml = emailHtml.replace(regex, value);
          if (emailText) {
            emailText = emailText.replace(regex, value);
          }
        }
      }
    }

    if (!emailSubject || !emailHtml) {
      throw new Error('Subject e HTML são obrigatórios');
    }

    // 5. Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BarberFlow <noreply@barberflow.com.br>',
        to: recipients,
        subject: emailSubject,
        html: emailHtml,
        text: emailText || undefined,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      throw new Error(errorData.message || 'Erro ao enviar email via Resend');
    }

    const resendData: ResendResponse = await resendResponse.json();

    // 6. Log successful email
    await supabase
      .from('email_logs')
      .insert({
        to_email: recipients[0],
        subject: emailSubject,
        template_key: body.template_key || null,
        template_variables: body.variables || null,
        status: 'sent',
        provider: 'resend',
        provider_message_id: resendData.id,
        barbershop_id: body.barbershop_id || null,
        user_id: body.user_id || null,
        appointment_id: body.appointment_id || null,
        sent_at: new Date().toISOString(),
      });

    // 7. Return success
    return new Response(
      JSON.stringify({
        success: true,
        message_id: resendData.id,
        recipients: recipients,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);

    // Try to log failed email
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const body: SendEmailRequest = await req.clone().json();

      await supabase
        .from('email_logs')
        .insert({
          to_email: Array.isArray(body.to) ? body.to[0] : body.to,
          subject: body.subject || 'Unknown',
          template_key: body.template_key || null,
          status: 'failed',
          error_message: error.message,
          barbershop_id: body.barbershop_id || null,
          user_id: body.user_id || null,
          failed_at: new Date().toISOString(),
        });
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }

    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao enviar email',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
