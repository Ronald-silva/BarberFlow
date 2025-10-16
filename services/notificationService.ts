// Serviço de Notificações - WhatsApp Business API
import { supabase } from './supabase';

export interface NotificationTemplate {
  type: 'confirmation' | 'reminder_24h' | 'reminder_2h' | 'payment_pending' | 'payment_confirmed';
  message: string;
}

export interface ScheduledNotification {
  id: string;
  appointmentId: string;
  clientPhone: string;
  message: string;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed';
  type: string;
}

class NotificationService {
  private whatsappToken: string;
  private whatsappPhoneId: string;

  constructor() {
    this.whatsappToken = import.meta.env.VITE_WHATSAPP_TOKEN || '';
    this.whatsappPhoneId = import.meta.env.VITE_WHATSAPP_PHONE_ID || '';
  }

  // Templates de mensagens
  private templates: Record<string, NotificationTemplate> = {
    confirmation: {
      type: 'confirmation',
      message: `🎉 *Agendamento Confirmado!*

Olá {{clientName}}! Seu horário foi agendado com sucesso.

📅 *Data:* {{date}}
🕐 *Horário:* {{time}}
👨‍💼 *Profissional:* {{professional}}
✂️ *Serviços:* {{services}}
💰 *Total:* R$ {{total}}

📍 *Local:* {{barbershopName}}
{{address}}

⚠️ *Importante:* Chegue 10 minutos antes do horário.

Até logo! 👋`
    },

    reminder_24h: {
      type: 'reminder_24h',
      message: `⏰ *Lembrete - 24h*

Olá {{clientName}}! Seu horário é amanhã.

📅 *Amanhã:* {{date}}
🕐 *Horário:* {{time}}
👨‍💼 *Profissional:* {{professional}}

📍 {{barbershopName}}
{{address}}

Nos vemos amanhã! 😊`
    },

    reminder_2h: {
      type: 'reminder_2h',
      message: `🔔 *Lembrete - 2 horas*

Olá {{clientName}}! Seu horário é daqui a 2 horas.

🕐 *Hoje às:* {{time}}
👨‍💼 *Com:* {{professional}}

📍 {{barbershopName}}
{{address}}

Já estamos te esperando! 🚀`
    },

    payment_pending: {
      type: 'payment_pending',
      message: `💳 *Pagamento Pendente*

Olá {{clientName}}! Seu agendamento está quase pronto.

Para garantir seu horário, finalize o pagamento:
{{paymentLink}}

💰 *Valor:* R$ {{total}}
📅 *Data:* {{date}} às {{time}}

⏰ *Prazo:* 30 minutos para confirmar.`
    },

    payment_confirmed: {
      type: 'payment_confirmed',
      message: `✅ *Pagamento Confirmado!*

Olá {{clientName}}! Pagamento aprovado com sucesso.

📅 *Data:* {{date}}
🕐 *Horário:* {{time}}
💰 *Valor pago:* R$ {{total}}

Seu horário está garantido! 🎉`
    }
  };

  // Enviar mensagem via WhatsApp Business API
  async sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
    try {
      // Limpar e formatar número
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

      const response = await fetch(`https://graph.facebook.com/v18.0/${this.whatsappPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.whatsappToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message
          }
        })
      });

      const result = await response.json();
      return response.ok && result.messages;
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      return false;
    }
  }

  // Agendar notificação de confirmação
  async scheduleConfirmationNotification(appointmentData: {
    appointmentId: string;
    clientName: string;
    clientPhone: string;
    date: string;
    time: string;
    professional: string;
    services: string;
    total: number;
    barbershopName: string;
    address: string;
  }) {
    const message = this.templates.confirmation.message
      .replace('{{clientName}}', appointmentData.clientName)
      .replace('{{date}}', appointmentData.date)
      .replace('{{time}}', appointmentData.time)
      .replace('{{professional}}', appointmentData.professional)
      .replace('{{services}}', appointmentData.services)
      .replace('{{total}}', appointmentData.total.toFixed(2))
      .replace('{{barbershopName}}', appointmentData.barbershopName)
      .replace('{{address}}', appointmentData.address);

    // Enviar imediatamente
    const sent = await this.sendWhatsAppMessage(appointmentData.clientPhone, message);

    // Salvar no banco
    await supabase.from('notifications').insert({
      appointment_id: appointmentData.appointmentId,
      client_phone: appointmentData.clientPhone,
      message: message,
      type: 'confirmation',
      scheduled_for: new Date().toISOString(),
      status: sent ? 'sent' : 'failed'
    });
  }

  // Agendar lembretes automáticos
  async scheduleReminders(appointmentData: {
    appointmentId: string;
    clientName: string;
    clientPhone: string;
    appointmentDateTime: string;
    professional: string;
    barbershopName: string;
    address: string;
  }) {
    const appointmentDate = new Date(appointmentData.appointmentDateTime);
    
    // Lembrete 24h antes
    const reminder24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    
    // Lembrete 2h antes
    const reminder2h = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);

    const notifications = [
      {
        scheduledFor: reminder24h,
        type: 'reminder_24h',
        template: this.templates.reminder_24h
      },
      {
        scheduledFor: reminder2h,
        type: 'reminder_2h',
        template: this.templates.reminder_2h
      }
    ];

    for (const notification of notifications) {
      const message = notification.template.message
        .replace('{{clientName}}', appointmentData.clientName)
        .replace('{{date}}', appointmentDate.toLocaleDateString('pt-BR'))
        .replace('{{time}}', appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
        .replace('{{professional}}', appointmentData.professional)
        .replace('{{barbershopName}}', appointmentData.barbershopName)
        .replace('{{address}}', appointmentData.address);

      await supabase.from('notifications').insert({
        appointment_id: appointmentData.appointmentId,
        client_phone: appointmentData.clientPhone,
        message: message,
        type: notification.type,
        scheduled_for: notification.scheduledFor.toISOString(),
        status: 'pending'
      });
    }
  }

  // Processar notificações pendentes (executar via cron job)
  async processPendingNotifications() {
    const now = new Date();
    
    const { data: pendingNotifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString())
      .limit(50);

    if (!pendingNotifications) return;

    for (const notification of pendingNotifications) {
      const sent = await this.sendWhatsAppMessage(
        notification.client_phone,
        notification.message
      );

      await supabase
        .from('notifications')
        .update({
          status: sent ? 'sent' : 'failed',
          sent_at: new Date().toISOString()
        })
        .eq('id', notification.id);
    }
  }

  // Notificação de pagamento pendente
  async sendPaymentPendingNotification(appointmentData: {
    clientName: string;
    clientPhone: string;
    paymentLink: string;
    total: number;
    date: string;
    time: string;
  }) {
    const message = this.templates.payment_pending.message
      .replace('{{clientName}}', appointmentData.clientName)
      .replace('{{paymentLink}}', appointmentData.paymentLink)
      .replace('{{total}}', appointmentData.total.toFixed(2))
      .replace('{{date}}', appointmentData.date)
      .replace('{{time}}', appointmentData.time);

    return await this.sendWhatsAppMessage(appointmentData.clientPhone, message);
  }

  // Notificação de pagamento confirmado
  async sendPaymentConfirmedNotification(appointmentData: {
    clientName: string;
    clientPhone: string;
    total: number;
    date: string;
    time: string;
  }) {
    const message = this.templates.payment_confirmed.message
      .replace('{{clientName}}', appointmentData.clientName)
      .replace('{{total}}', appointmentData.total.toFixed(2))
      .replace('{{date}}', appointmentData.date)
      .replace('{{time}}', appointmentData.time);

    return await this.sendWhatsAppMessage(appointmentData.clientPhone, message);
  }
}

export const notificationService = new NotificationService();