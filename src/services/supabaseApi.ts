import { supabase } from './supabase';
import type { Database } from './supabase';
import { User, Barbershop, Service, Client, Appointment, AppointmentStatus, UserRole } from '../types';
import { addMinutes, format } from 'date-fns';
import { sendNotification, scheduleReminder } from './notificationService';

type DbUser = Database['public']['Tables']['users']['Row'];
type DbBarbershop = Database['public']['Tables']['barbershops']['Row'];

function mapDbUser(row: DbUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    barbershopId: row.barbershop_id,
    role: row.role as User['role'],
    workHours: Array.isArray(row.work_hours) ? row.work_hours : [],
  };
}

export function mapDbBarbershop(row: DbBarbershop): Barbershop {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    address: row.address || '',
    logoUrl: row.logo_url || '',
  };
}

function dbStatusToAppointmentStatus(s: string): AppointmentStatus {
  switch (s) {
    case 'confirmed':
    case 'completed':
      return AppointmentStatus.CONFIRMED;
    case 'pending':
      return AppointmentStatus.PENDING;
    case 'canceled':
    case 'cancelled':
      return AppointmentStatus.CANCELED;
    default:
      return AppointmentStatus.PENDING;
  }
}

function appointmentStatusToDb(s: AppointmentStatus): Database['public']['Tables']['appointments']['Row']['status'] {
  switch (s) {
    case AppointmentStatus.CONFIRMED:
      return 'confirmed';
    case AppointmentStatus.PENDING:
      return 'pending';
    case AppointmentStatus.CANCELED:
      return 'canceled';
    default:
      return 'pending';
  }
}

function mapRowToAppointment(row: Database['public']['Tables']['appointments']['Row']): Appointment {
  return {
    id: row.id,
    clientId: row.client_id,
    professionalId: row.professional_id,
    serviceIds: row.service_ids,
    startDateTime: row.start_datetime,
    endDateTime: row.end_datetime,
    status: dbStatusToAppointmentStatus(row.status),
  };
}

const LOGO_BUCKET = 'barbershop-logos';

const defaultProfessionalWorkHours = [
  { day: 1, start: '09:00', end: '18:00' },
  { day: 2, start: '09:00', end: '18:00' },
  { day: 3, start: '09:00', end: '18:00' },
  { day: 4, start: '09:00', end: '18:00' },
  { day: 5, start: '09:00', end: '20:00' },
  { day: 6, start: '08:00', end: '16:00' },
];

export type CreateAppointmentPayload = Omit<Appointment, 'id' | 'endDateTime' | 'status' | 'clientId'> & {
  client: Omit<Client, 'id' | 'lastVisit' | 'barbershopId'>;
  barbershopId: string;
  totalPrice?: number;
  paymentRequired?: boolean;
  paymentMethod?: string;
  paymentStatus?: string;
};

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

      return mapDbUser(userData);
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
    
    if (error || !data) return null;
    return mapDbBarbershop(data);
  },

  getBarbershopById: async (id: string | null): Promise<Barbershop | null> => {
    if (!id) return null;
    const { data, error } = await supabase.from('barbershops').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDbBarbershop(data);
  },

  updateBarbershop: async (
    id: string,
    payload: { name?: string; address?: string; slug?: string; phone?: string; email?: string; logoUrl?: string }
  ): Promise<void> => {
    const { error } = await supabase
      .from('barbershops')
      .update({
        name: payload.name,
        address: payload.address,
        slug: payload.slug,
        phone: payload.phone,
        email: payload.email,
        logo_url: payload.logoUrl,
      })
      .eq('id', id);
    if (error) throw error;
  },

  uploadBarbershopLogo: async (barbershopId: string, file: File): Promise<string | null> => {
    // Validações de segurança
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    const MAX_DIMENSION = 2000; // pixels

    // 1. Validar tipo de arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Use JPG, PNG, WebP ou SVG.');
    }

    // 2. Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
    }

    // 3. Validar dimensões (apenas para imagens bitmap)
    if (file.type !== 'image/svg+xml') {
      try {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        URL.revokeObjectURL(objectUrl);
        
        if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
          throw new Error(`Dimensões muito grandes. Máximo: ${MAX_DIMENSION}x${MAX_DIMENSION}px.`);
        }
      } catch (error) {
        console.error('Erro ao validar dimensões:', error);
        throw new Error('Erro ao processar imagem. Tente outro arquivo.');
      }
    }

    // 4. Upload seguro
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${barbershopId}/${Date.now()}_${safeName}`;
    
    const { error: upErr } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(path, file, { 
        upsert: true,
        contentType: file.type
      });
    
    if (upErr) {
      console.error('Erro no upload:', upErr);
      throw new Error('Falha ao fazer upload. Tente novamente.');
    }
    
    // 5. Obter URL pública
    const { data: pub } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
    const logoUrl = pub.publicUrl;
    
    // 6. Atualizar banco de dados
    const { error: updateErr } = await supabase
      .from('barbershops')
      .update({ logo_url: logoUrl })
      .eq('id', barbershopId);
    
    if (updateErr) {
      console.error('Erro ao atualizar banco:', updateErr);
      throw new Error('Logo enviado mas não foi salvo no banco.');
    }
    
    return logoUrl;
  },

  removeBarbershopLogo: async (barbershopId: string, _logoUrl: string): Promise<boolean> => {
    const { error } = await supabase.from('barbershops').update({ logo_url: null }).eq('id', barbershopId);
    return !error;
  },

  getServicesByBarbershop: async (barbershopId: string): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', barbershopId);
    
    if (error || !data) return [];
    return data.map(s => ({
      ...s,
      barbershopId: s.barbershop_id
    })) as Service[];
  },

  createService: async (input: { name: string; price: number; duration: number; barbershopId: string }): Promise<Service> => {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: input.name,
        price: input.price,
        duration: input.duration,
        barbershop_id: input.barbershopId,
      })
      .select()
      .single();
    if (error || !data) throw error || new Error('createService');
    return { ...data, barbershopId: data.barbershop_id } as Service;
  },

  updateService: async (id: string, patch: { name: string; price: number; duration: number }): Promise<Service> => {
    const { data, error } = await supabase
      .from('services')
      .update({ name: patch.name, price: patch.price, duration: patch.duration })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw error || new Error('updateService');
    return { ...data, barbershopId: data.barbershop_id } as Service;
  },

  deleteService: async (id: string): Promise<void> => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  getProfessionalsByBarbershop: async (barbershopId: string): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('barbershop_id', barbershopId);
    
    if (error || !data) return [];
    return data.map(u => mapDbUser(u));
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

    if (error || !data) return [];
    return data.map(a => mapRowToAppointment(a));
  },

  createAppointment: async (
    data: Omit<Appointment, 'id' | 'endDateTime' | 'status' | 'clientId'> & {
      client: Omit<Client, 'id' | 'lastVisit' | 'barbershopId'>;
      barbershopId: string;
      totalPrice?: number;
      paymentRequired?: boolean;
      paymentMethod?: string;
      paymentStatus?: string;
    }
  ): Promise<Appointment> => {
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
    const totalPrice = data.totalPrice ?? services?.reduce((acc, s) => acc + s.price, 0) ?? 0;

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

    const appointment = mapRowToAppointment(newAppointment);

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
            price: totalPrice,
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
    
    if (error || !data) return [];
    return data.map(c => ({
      id: c.id,
      name: c.name,
      whatsapp: c.whatsapp,
      barbershopId: c.barbershop_id,
      lastVisit: c.last_visit || '',
    }));
  },

  getClient: async (id: string): Promise<Client | null> => {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      whatsapp: data.whatsapp,
      barbershopId: data.barbershop_id,
      lastVisit: data.last_visit || '',
    };
  },

  createClient: async (
    input: Omit<Client, 'id' | 'lastVisit'> & { lastVisit?: string }
  ): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: input.name,
        whatsapp: input.whatsapp,
        barbershop_id: input.barbershopId,
        last_visit: input.lastVisit ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error || !data) throw error || new Error('createClient');
    return {
      id: data.id,
      name: data.name,
      whatsapp: data.whatsapp,
      barbershopId: data.barbershop_id,
      lastVisit: data.last_visit || '',
    };
  },

  updateClient: async (id: string, patch: Partial<Pick<Client, 'name' | 'whatsapp'>>): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .update({ name: patch.name, whatsapp: patch.whatsapp })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw error || new Error('updateClient');
    return {
      id: data.id,
      name: data.name,
      whatsapp: data.whatsapp,
      barbershopId: data.barbershop_id,
      lastVisit: data.last_visit || '',
    };
  },

  deleteClient: async (id: string): Promise<void> => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
  },

  createProfessional: async (input: {
    name: string;
    email: string;
    role: UserRole;
    barbershopId: string | null;
  }): Promise<User> => {
    if (!input.barbershopId) throw new Error('barbershopId obrigatório');
    const tempPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 16) + 'aA1!';
    const { data: auth, error: authErr } = await supabase.auth.signUp({
      email: input.email,
      password: tempPassword,
      options: { data: { name: input.name, role: input.role } },
    });
    if (authErr || !auth.user) throw authErr || new Error('Falha ao criar acesso do profissional');
    const { data: row, error } = await supabase
      .from('users')
      .insert({
        id: auth.user.id,
        email: input.email,
        name: input.name,
        barbershop_id: input.barbershopId,
        role: input.role === UserRole.ADMIN ? 'admin' : 'member',
        work_hours: defaultProfessionalWorkHours,
      })
      .select()
      .single();
    if (error || !row) throw error || new Error('Falha ao salvar profissional');
    return mapDbUser(row);
  },

  updateProfessional: async (
    id: string,
    patch: { name: string; email: string; role: UserRole }
  ): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: patch.name,
        email: patch.email,
        role: patch.role === UserRole.ADMIN ? 'admin' : 'member',
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !data) throw error || new Error('updateProfessional');
    return mapDbUser(data);
  },

  deleteProfessional: async (id: string): Promise<void> => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },

  getAppointment: async (id: string): Promise<Appointment | null> => {
    const { data, error } = await supabase.from('appointments').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapRowToAppointment(data);
  },

  updateAppointment: async (id: string, patch: Partial<Appointment>): Promise<Appointment> => {
    const row: Database['public']['Tables']['appointments']['Update'] = {};
    if (patch.startDateTime !== undefined) row.start_datetime = patch.startDateTime;
    if (patch.endDateTime !== undefined) row.end_datetime = patch.endDateTime;
    if (patch.professionalId !== undefined) row.professional_id = patch.professionalId;
    if (patch.clientId !== undefined) row.client_id = patch.clientId;
    if (patch.serviceIds !== undefined) row.service_ids = patch.serviceIds;
    if (patch.status !== undefined) row.status = appointmentStatusToDb(patch.status);
    const { data, error } = await supabase.from('appointments').update(row).eq('id', id).select().single();
    if (error || !data) throw error || new Error('updateAppointment');
    return mapRowToAppointment(data);
  },

  deleteAppointment: async (id: string): Promise<void> => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
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
    return data.map(mapDbBarbershop);
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
      .select('amount')
      .in('status', ['active', 'trialing']);

    const monthlyRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;

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
  },

  getPlatformBarbershopSummaries: async (limit = 5): Promise<Array<{
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    status: 'active' | 'inactive' | 'trial';
    monthlyRevenue: number;
  }>> => {
    const { data: barbershops, error: barbershopsError } = await supabase
      .from('barbershops')
      .select('id, name, slug, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (barbershopsError || !barbershops) {
      console.error('Error fetching platform barbershop summaries:', barbershopsError);
      return [];
    }

    const ids = barbershops.map((b) => b.id);
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('barbershop_id, status, amount, created_at')
      .in('barbershop_id', ids)
      .order('created_at', { ascending: false });

    const latestByBarbershop = new Map<string, { status: string; amount: number | null }>();
    (subscriptions || []).forEach((sub) => {
      if (!latestByBarbershop.has(sub.barbershop_id)) {
        latestByBarbershop.set(sub.barbershop_id, { status: sub.status, amount: sub.amount });
      }
    });

    return barbershops.map((barbershop) => {
      const latest = latestByBarbershop.get(barbershop.id);
      const normalizedStatus: 'active' | 'inactive' | 'trial' =
        latest?.status === 'trialing'
          ? 'trial'
          : latest?.status === 'active'
          ? 'active'
          : 'inactive';

      return {
        id: barbershop.id,
        name: barbershop.name,
        slug: barbershop.slug,
        createdAt: barbershop.created_at,
        status: normalizedStatus,
        monthlyRevenue:
          normalizedStatus === 'active' || normalizedStatus === 'trial'
            ? latest?.amount || 0
            : 0,
      };
    });
  },

  getPlatformAnalyticsOverview: async (): Promise<{
    monthlyRevenue: number;
    newBarbershopsThisMonth: number;
    newBarbershopsLastMonth: number;
    conversionRate: number;
    churnRate: number;
    planDistribution: Array<{ plan: string; count: number }>;
    dailyAppointments: Array<{ date: string; count: number }>;
  }> => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const { data: thisMonthBarbershops } = await supabase
      .from('barbershops')
      .select('id')
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', nextMonthStart.toISOString());

    const { data: lastMonthBarbershops } = await supabase
      .from('barbershops')
      .select('id')
      .gte('created_at', lastMonthStart.toISOString())
      .lt('created_at', monthStart.toISOString());

    const { data: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('amount, status, plan_id')
      .in('status', ['active', 'trialing']);

    const monthlyRevenue = (activeSubscriptions || []).reduce((sum, sub) => sum + (sub.amount || 0), 0);
    const activeCount = activeSubscriptions?.length || 0;
    const newCount = thisMonthBarbershops?.length || 0;
    const conversionRate = newCount > 0 ? (activeCount / newCount) * 100 : 0;

    const { data: canceledThisMonth } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('status', 'canceled')
      .gte('updated_at', monthStart.toISOString())
      .lt('updated_at', nextMonthStart.toISOString());

    const { count: totalSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    const churnRate =
      totalSubscriptions && totalSubscriptions > 0
        ? ((canceledThisMonth?.length || 0) / totalSubscriptions) * 100
        : 0;

    const planCountById = new Map<string, number>();
    (activeSubscriptions || []).forEach((sub) => {
      planCountById.set(sub.plan_id, (planCountById.get(sub.plan_id) || 0) + 1);
    });

    const planIds = Array.from(planCountById.keys());
    const { data: plans } = planIds.length
      ? await supabase
          .from('subscription_plans')
          .select('id, name')
          .in('id', planIds)
      : { data: [] as Array<{ id: string; name: string }> };

    const planNames = new Map((plans || []).map((plan) => [plan.id, plan.name]));
    const planDistribution = Array.from(planCountById.entries()).map(([planId, count]) => ({
      plan: planNames.get(planId) || 'Plano desconhecido',
      count,
    }));

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: appointments } = await supabase
      .from('appointments')
      .select('start_datetime')
      .gte('start_datetime', sevenDaysAgo.toISOString())
      .lte('start_datetime', now.toISOString());

    const grouped = new Map<string, number>();
    (appointments || []).forEach((appointment) => {
      const key = appointment.start_datetime.slice(0, 10);
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    const dailyAppointments = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { date: key, count: grouped.get(key) || 0 };
    });

    return {
      monthlyRevenue,
      newBarbershopsThisMonth: newCount,
      newBarbershopsLastMonth: lastMonthBarbershops?.length || 0,
      conversionRate,
      churnRate,
      planDistribution,
      dailyAppointments,
    };
  },

  getPlatformSupportOverview: async (): Promise<{
    openTickets: number;
    resolvedToday: number;
    resolutionRate: number;
    tickets: Array<{
      id: string;
      title: string;
      barbershop: string;
      priority: 'urgent' | 'high' | 'normal' | 'low';
      status: 'open' | 'closed';
      createdAt: string;
      source: 'email' | 'subscription';
    }>;
  }> => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const { data: barbershops } = await supabase
      .from('barbershops')
      .select('id, name');
    const barbershopNames = new Map((barbershops || []).map((b) => [b.id, b.name]));

    const { data: emailLogs } = await supabase
      .from('email_logs')
      .select('id, barbershop_id, status, created_at')
      .in('status', ['failed', 'pending', 'sent'])
      .order('created_at', { ascending: false })
      .limit(25);

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('id, barbershop_id, status, updated_at')
      .in('status', ['past_due', 'canceled'])
      .order('updated_at', { ascending: false })
      .limit(25);

    const emailTickets =
      (emailLogs || []).map((log) => ({
        id: `email-${log.id}`,
        title:
          log.status === 'failed'
            ? 'Falha no envio de email transacional'
            : log.status === 'pending'
            ? 'Email transacional pendente'
            : 'Email transacional enviado',
        barbershop: barbershopNames.get(log.barbershop_id || '') || 'Plataforma',
        priority: (log.status === 'failed' ? 'high' : log.status === 'pending' ? 'normal' : 'low') as
          | 'urgent'
          | 'high'
          | 'normal'
          | 'low',
        status: (log.status === 'sent' ? 'closed' : 'open') as 'open' | 'closed',
        createdAt: log.created_at,
        source: 'email' as const,
      })) || [];

    const subscriptionTickets =
      (subscriptions || []).map((sub) => ({
        id: `subscription-${sub.id}`,
        title:
          sub.status === 'past_due'
            ? 'Assinatura com pagamento pendente'
            : 'Assinatura cancelada recentemente',
        barbershop: barbershopNames.get(sub.barbershop_id) || 'Barbearia não encontrada',
        priority: (sub.status === 'past_due' ? 'urgent' : 'low') as
          | 'urgent'
          | 'high'
          | 'normal'
          | 'low',
        status: 'open' as const,
        createdAt: sub.updated_at || now.toISOString(),
        source: 'subscription' as const,
      })) || [];

    const tickets = [...subscriptionTickets, ...emailTickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 30);

    const openTickets = tickets.filter((ticket) => ticket.status === 'open').length;
    const resolvedToday = tickets.filter(
      (ticket) => ticket.status === 'closed' && new Date(ticket.createdAt) >= todayStart
    ).length;
    const resolutionRate = tickets.length > 0 ? ((tickets.length - openTickets) / tickets.length) * 100 : 0;

    return {
      openTickets,
      resolvedToday,
      resolutionRate,
      tickets,
    };
  },

  updateCurrentUserProfile: async (userId: string, payload: { name: string }): Promise<boolean> => {
    const { error } = await supabase
      .from('users')
      .update({ name: payload.name })
      .eq('id', userId);

    if (error) {
      console.error('Error updating current user profile:', error);
      return false;
    }
    return true;
  }
};

// Export alias for backward compatibility
export const supabaseApi = api;
