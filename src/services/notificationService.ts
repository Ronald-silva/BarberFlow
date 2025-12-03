// Serviço de Notificações - WhatsApp e SMS
// IMPORTANTE: Este serviço está simulado no cliente por questões de desenvolvimento.
// Em PRODUÇÃO, as notificações devem ser enviadas via Backend/Edge Functions para:
// 1. Manter API keys seguras
// 2. Evitar problemas com CORS
// 3. Reduzir bundle size (Twilio SDK é muito pesado)

// Tipos
export interface NotificationData {
  to: string; // Telefone (formato: +55XXXXXXXXXXX)
  type: 'appointment_confirmation' | 'appointment_reminder' | 'appointment_canceled' | 'payment_confirmed';
  data: {
    clientName: string;
    barbershopName: string;
    serviceName: string;
    professionalName: string;
    dateTime: string;
    price?: number;
    appointmentId?: string;
  };
}

// Templates de WhatsApp e SMS
const messageTemplates = {
  appointment_confirmation: (data: NotificationData['data']) =>
    `✅ *Agendamento Confirmado!*\n\n` +
    `Olá ${data.clientName}!\n\n` +
    `Seu agendamento na *${data.barbershopName}* foi confirmado:\n\n` +
    `📋 *Detalhes:*\n` +
    `• Serviço: ${data.serviceName}\n` +
    `• Profissional: ${data.professionalName}\n` +
    `• Data/Hora: ${data.dateTime}\n` +
    `${data.price ? `• Valor: R$ ${(data.price / 100).toFixed(2)}\n` : ''}` +
    `\nChegue com 5 minutos de antecedência!\n\n` +
    `_Mensagem automática - BarberFlow_`,

  appointment_reminder: (data: NotificationData['data']) =>
    `⏰ *Lembrete de Agendamento*\n\n` +
    `Olá ${data.clientName}!\n\n` +
    `Lembrete: Você tem um agendamento amanhã na *${data.barbershopName}*\n\n` +
    `📋 *Detalhes:*\n` +
    `• Serviço: ${data.serviceName}\n` +
    `• Profissional: ${data.professionalName}\n` +
    `• Data/Hora: ${data.dateTime}\n\n` +
    `Não esqueça! 😊\n\n` +
    `_Mensagem automática - BarberFlow_`,

  appointment_canceled: (data: NotificationData['data']) =>
    `❌ *Agendamento Cancelado*\n\n` +
    `Olá ${data.clientName},\n\n` +
    `Seu agendamento na *${data.barbershopName}* foi cancelado:\n\n` +
    `📋 *Detalhes:*\n` +
    `• Serviço: ${data.serviceName}\n` +
    `• Data/Hora: ${data.dateTime}\n\n` +
    `Entre em contato para reagendar.\n\n` +
    `_Mensagem automática - BarberFlow_`,

  payment_confirmed: (data: NotificationData['data']) =>
    `💰 *Pagamento Confirmado!*\n\n` +
    `Olá ${data.clientName}!\n\n` +
    `Recebemos seu pagamento de *R$ ${data.price ? (data.price / 100).toFixed(2) : '0.00'}*\n\n` +
    `Seu agendamento está confirmado para ${data.dateTime}\n\n` +
    `Te esperamos! 😊\n\n` +
    `_Mensagem automática - BarberFlow_`,
};

// Enviar WhatsApp (SIMULADO - Em produção, chamar API backend)
export async function sendWhatsApp(notification: NotificationData): Promise<boolean> {
  const message = messageTemplates[notification.type](notification.data);

  console.log('📱 [SIMULADO] WhatsApp enviado para:', notification.to);
  console.log('Mensagem:', message);
  console.log('---');
  console.log('⚠️ ATENÇÃO: Esta é uma simulação!');
  console.log('Em produção, implemente via Edge Function do Supabase ou API backend.');
  console.log('Exemplo: POST /api/notifications/whatsapp');

  // Simular sucesso
  return Promise.resolve(true);
}

// Enviar SMS (SIMULADO - Em produção, chamar API backend)
export async function sendSMS(notification: NotificationData): Promise<boolean> {
  const message = messageTemplates[notification.type](notification.data);

  console.log('📨 [SIMULADO] SMS enviado para:', notification.to);
  console.log('Mensagem:', message);
  console.log('---');
  console.log('⚠️ ATENÇÃO: Esta é uma simulação!');
  console.log('Em produção, implemente via Edge Function do Supabase ou API backend.');

  // Simular sucesso
  return Promise.resolve(true);
}

// Enviar notificação (escolhe canal baseado em preferências)
export async function sendNotification(
  notification: NotificationData,
  channels: ('whatsapp' | 'sms')[] = ['whatsapp']
): Promise<{ whatsapp?: boolean; sms?: boolean }> {
  const results: any = {};

  for (const channel of channels) {
    switch (channel) {
      case 'whatsapp':
        results.whatsapp = await sendWhatsApp(notification);
        break;
      case 'sms':
        results.sms = await sendSMS(notification);
        break;
    }
  }

  return results;
}

// Agendar lembrete (24h antes)
export async function scheduleReminder(
  appointmentId: string,
  appointmentDateTime: Date,
  notification: NotificationData
): Promise<void> {
  const now = new Date();
  const reminderTime = new Date(appointmentDateTime);
  reminderTime.setHours(reminderTime.getHours() - 24); // 24h antes

  const delay = reminderTime.getTime() - now.getTime();

  console.log('⏰ [SIMULADO] Lembrete agendado');
  console.log('Agendamento ID:', appointmentId);
  console.log('Enviar em:', reminderTime.toLocaleString('pt-BR'));
  console.log('---');
  console.log('⚠️ Em produção, use um job scheduler (Supabase pg_cron, AWS EventBridge, etc.)');

  if (delay > 0 && delay < 1000 * 60 * 60 * 48) { // Máx 48h (limite do setTimeout)
    setTimeout(async () => {
      await sendNotification({
        ...notification,
        type: 'appointment_reminder',
      });
    }, delay);
  }
}

/*
 * GUIA DE IMPLEMENTAÇÃO EM PRODUÇÃO:
 *
 * 1. Criar Edge Function no Supabase (ou API serverless):
 *    - POST /api/notifications/whatsapp
 *    - POST /api/notifications/sms
 *
 * 2. No Edge Function, usar Twilio:
 *    import { Twilio } from 'https://deno.land/x/twilio/mod.ts'
 *    const client = new Twilio(accountSid, authToken)
 *    await client.messages.create({ ... })
 *
 * 3. Chamar a API do frontend:
 *    fetch('/api/notifications/whatsapp', {
 *      method: 'POST',
 *      body: JSON.stringify(notification)
 *    })
 *
 * 4. Para lembretes, usar pg_cron ou serviço externo:
 *    - Supabase: pg_cron extension
 *    - AWS: EventBridge
 *    - Vercel: Cron Jobs
 */
