import { supabase } from './supabase';
import { User, Barbershop, Service, Client, Appointment, AppointmentStatus } from '../types';
import { addMinutes, format } from 'date-fns';
import { sendNotification, scheduleReminder } from './notificationService';

export const api = {
  login: async (email: string, pass: string): Promise<User | null> => {
    try {
      // 1. Autenticar com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (authError) {
        console.error('Erro de autenticação:', authError.message);
        return null;
      }

      if (!authData.user) {
        console.error('Usuário não encontrado após autenticação');
        return null;
      }

      // 2. Buscar dados completos do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        console.error('Erro ao buscar dados do usuário:', userError?.message);
        return null;
      }

      return userData as User;
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      return null;
    }
  },

  getBarbershopBySlug: async (slug: string): Promise<Barbershop | null> => {
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) return null;
    return data as Barbershop;
  },

  getServicesByBarbershop: async (barbershopId: string): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', barbershopId);
    
    if (error) return [];
    return data.map(s => ({
      ...s,
      barbershopId: s.barbershop_id
    })) as Service[];
  },

  getProfessionalsByBarbershop: async (barbershopId: string): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('barbershop_id', barbershopId);
    
    if (error) return [];
    return data.map(u => ({
      ...u,
      barbershopId: u.barbershop_id,
      workHours: u.work_hours
    })) as User[];
  },

  getAppointmentsByProfessional: async (professionalId: string, date: Date): Promise<Appointment[]> => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('professional_id', professionalId)
      .gte('start_datetime', startOfDay.toISOString())
      .lte('start_datetime', endOfDay.toISOString());

    if (error) return [];
    return data.map(a => ({
      ...a,
      clientId: a.client_id,
      professionalId: a.professional_id,
      serviceIds: a.service_ids,
      startDateTime: a.start_datetime,
      endDateTime: a.end_datetime
    })) as Appointment[];
  },

  createAppointment: async (data: Omit<Appointment, 'id' | 'endDateTime' | 'status' | 'clientId'> & {client: Omit<Client, 'id' | 'lastVisit' | 'barbershopId'>, barbershopId: string}): Promise<Appointment> => {
    // 1. Find or create client
    let clientId: string;
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('whatsapp', data.client.whatsapp)
      .eq('barbershop_id', data.barbershopId)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
      // Update last visit
      await supabase.from('clients').update({ last_visit: new Date().toISOString() }).eq('id', clientId);
    } else {
      const { data: newClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
          name: data.client.name,
          whatsapp: data.client.whatsapp,
          barbershop_id: data.barbershopId,
          last_visit: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createClientError || !newClient) throw new Error('Failed to create client');
      clientId = newClient.id;
    }

    // 2. Calculate duration and end time
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .in('id', data.serviceIds);
    
    const totalDuration = services?.reduce((acc, s) => acc + s.duration, 0) || 0;
    const endDateTime = addMinutes(new Date(data.startDateTime), totalDuration).toISOString();

    // 3. Create appointment
    const { data: newAppointment, error: createAppError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        professional_id: data.professionalId,
        barbershop_id: data.barbershopId,
        service_ids: data.serviceIds,
        start_datetime: data.startDateTime,
        end_datetime: endDateTime,
        status: 'confirmed'
      })
      .select()
      .single();

    if (createAppError || !newAppointment) throw new Error('Failed to create appointment');

    const appointment = {
      ...newAppointment,
      clientId: newAppointment.client_id,
      professionalId: newAppointment.professional_id,
      serviceIds: newAppointment.service_ids,
      startDateTime: newAppointment.start_datetime,
      endDateTime: newAppointment.end_datetime
    } as Appointment;

    // 4. Send Notifications
    try {
      // Get full details for notification
      const { data: barbershop } = await supabase.from('barbershops').select('*').eq('id', data.barbershopId).single();
      const { data: professional } = await supabase.from('users').select('*').eq('id', data.professionalId).single();
      const serviceNames = services?.map(s => s.name).join(', ');

      if (barbershop && professional && serviceNames) {
        // Email
        // Note: In a real app, email would be sent via Edge Function or backend API to keep secrets safe
        // Here we simulate or call a public endpoint if available. 
        // Since notificationService uses API keys which are in .env, it works on client side for demo but not recommended for prod.
        
        // WhatsApp
        const notificationData = {
          to: data.client.whatsapp,
          type: 'appointment_confirmation' as const,
          data: {
            clientName: data.client.name,
            barbershopName: barbershop.name,
            serviceName: serviceNames,
            professionalName: professional.name,
            dateTime: `${format(new Date(data.startDateTime), 'dd/MM/yyyy')} às ${format(new Date(data.startDateTime), 'HH:mm')}`,
            price: data.totalPrice,
            appointmentId: appointment.id,
          },
        };

        await sendNotification(notificationData, ['whatsapp']);

        // Schedule Reminder (24h before)
        const reminderDate = new Date(data.startDateTime);
        reminderDate.setHours(reminderDate.getHours() - 24);
        if (reminderDate > new Date()) {
          await scheduleReminder(
            appointment.id,
            new Date(data.startDateTime),
            notificationData
          );
        }
      }
    } catch (error) {
      console.error('Failed to send notifications:', error);
      // Don't fail the appointment creation just because notification failed
    }

    return appointment;
  },

  getClientsByBarbershop: async (barbershopId: string): Promise<Client[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('barbershop_id', barbershopId);
    
    if (error) return [];
    return data.map(c => ({
      ...c,
      barbershopId: c.barbershop_id,
      lastVisit: c.last_visit
    })) as Client[];
  },

  getDashboardData: async (barbershopId: string, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*, services(*), clients(*)')
      .eq('barbershop_id', barbershopId)
      .gte('start_datetime', startOfDay.toISOString())
      .lte('start_datetime', endOfDay.toISOString());

    const totalAppointments = appointments?.length || 0;

    // Calculate revenue
    let faturamentoPrevisto = 0;
    if (appointments) {
      // Note: This assumes we can join services. If not, we fetch services separately.
      // Supabase join requires foreign keys. 'service_ids' is an array, so standard join won't work easily.
      // We'll fetch all services for the barbershop to calculate price.
      const { data: allServices } = await supabase.from('services').select('*').eq('barbershop_id', barbershopId);
      
      appointments.forEach(app => {
        app.service_ids.forEach((sId: string) => {
          const service = allServices?.find(s => s.id === sId);
          if (service) faturamentoPrevisto += service.price;
        });
      });
    }

    // Next client
    const now = new Date();
    const { data: nextAppointment } = await supabase
      .from('appointments')
      .select('*, clients(*)')
      .eq('barbershop_id', barbershopId)
      .gte('start_datetime', now.toISOString())
      .order('start_datetime', { ascending: true })
      .limit(1)
      .single();

    // @ts-ignore
    const nextClientName = nextAppointment?.clients?.name || 'Nenhum';

    return {
      totalAppointments,
      faturamentoPrevisto,
      nextClientName
    };
  },

  getAppointmentsForDate: async (barbershopId: string, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .gte('start_datetime', startOfDay.toISOString())
      .lte('start_datetime', endOfDay.toISOString());

    if (!appointments) return [];

    // Fetch details manually since we have array of IDs
    const { data: clients } = await supabase.from('clients').select('*').in('id', appointments.map(a => a.client_id));
    const { data: users } = await supabase.from('users').select('*').in('id', appointments.map(a => a.professional_id));
    const { data: services } = await supabase.from('services').select('*').eq('barbershop_id', barbershopId);

    return appointments.map(app => {
      const client = clients?.find(c => c.id === app.client_id);
      const professional = users?.find(u => u.id === app.professional_id);
      const appServices = services?.filter(s => app.service_ids.includes(s.id));

      return {
        ...app,
        clientId: app.client_id,
        professionalId: app.professional_id,
        serviceIds: app.service_ids,
        startDateTime: app.start_datetime,
        endDateTime: app.end_datetime,
        clientName: client?.name || 'Desconhecido',
        professionalName: professional?.name || 'Desconhecido',
        services: appServices?.map(s => ({...s, barbershopId: s.barbershop_id})) || []
      };
    });
  },

  // Platform Admin APIs (para gerenciar todas as barbearias)
  getAllBarbershops: async (): Promise<Barbershop[]> => {
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all barbershops:', error);
      return [];
    }
    return data as Barbershop[];
  },

  getPlatformMetrics: async () => {
    // Total de barbearias
    const { count: totalBarbershops } = await supabase
      .from('barbershops')
      .select('*', { count: 'exact', head: true });

    // Assinaturas ativas
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing']);

    // Receita mensal total (soma de todas as assinaturas ativas)
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('plan_price')
      .in('status', ['active', 'trialing']);

    const monthlyRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.plan_price || 0), 0) || 0;

    // Agendamentos de hoje (todas as barbearias)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count: todayAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('start_datetime', today.toISOString())
      .lt('start_datetime', tomorrow.toISOString());

    return {
      totalBarbershops: totalBarbershops || 0,
      activeSubscriptions: activeSubscriptions || 0,
      monthlyRevenue,
      todayAppointments: todayAppointments || 0
    };
  }
};

// Export alias for backward compatibility
export const supabaseApi = api;
