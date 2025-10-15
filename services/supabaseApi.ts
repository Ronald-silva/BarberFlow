import { User, UserRole, Barbershop, Service, Client, Appointment, AppointmentStatus } from '../types';
import { addMinutes, format } from 'date-fns';
import { supabase } from './supabase';

const delay = <T,>(data: T, ms = 300): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), ms));

export const api = {
  // Autenticação
  login: async (email: string, pass: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        console.error('Login error:', error);
        return null;
      }

      // Converter para o formato esperado
      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        barbershopId: data.barbershop_id,
        role: data.role as UserRole,
        workHours: data.work_hours || []
      };

      return delay(user);
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  // Barbearia por slug
  getBarbershopBySlug: async (slug: string): Promise<Barbershop | undefined> => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        console.error('Barbershop error:', error);
        return undefined;
      }

      const barbershop: Barbershop = {
        id: data.id,
        name: data.name,
        logoUrl: data.logo_url || '',
        address: data.address || '',
        slug: data.slug
      };

      return delay(barbershop);
    } catch (error) {
      console.error('Barbershop error:', error);
      return undefined;
    }
  },

  // Serviços por barbearia
  getServicesByBarbershop: async (barbershopId: string): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', barbershopId);

      if (error) {
        console.error('Services error:', error);
        return [];
      }

      const services: Service[] = data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        duration: item.duration,
        barbershopId: item.barbershop_id
      }));

      return delay(services);
    } catch (error) {
      console.error('Services error:', error);
      return [];
    }
  },

  // Profissionais por barbearia
  getProfessionalsByBarbershop: async (barbershopId: string): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('barbershop_id', barbershopId);

      if (error) {
        console.error('Professionals error:', error);
        return [];
      }

      const professionals: User[] = data.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        barbershopId: item.barbershop_id,
        role: item.role as UserRole,
        workHours: item.work_hours || []
      }));

      return delay(professionals);
    } catch (error) {
      console.error('Professionals error:', error);
      return [];
    }
  },

  // Agendamentos por profissional e data
  getAppointmentsByProfessional: async (professionalId: string, date: Date): Promise<Appointment[]> => {
    try {
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

      if (error) {
        console.error('Appointments error:', error);
        return [];
      }

      const appointments: Appointment[] = data.map(item => ({
        id: item.id,
        clientId: item.client_id,
        professionalId: item.professional_id,
        serviceIds: item.service_ids,
        startDateTime: item.start_datetime,
        endDateTime: item.end_datetime,
        status: item.status as AppointmentStatus
      }));

      return delay(appointments);
    } catch (error) {
      console.error('Appointments error:', error);
      return [];
    }
  },

  // Criar agendamento
  createAppointment: async (data: {
    client: { name: string; whatsapp: string };
    barbershopId: string;
    professionalId: string;
    serviceIds: string[];
    startDateTime: string;
  }): Promise<Appointment> => {
    try {
      // Primeiro, verificar se o cliente já existe
      let clientId: string;
      
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('whatsapp', data.client.whatsapp)
        .eq('barbershop_id', data.barbershopId)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
        // Atualizar última visita
        await supabase
          .from('clients')
          .update({ 
            last_visit: new Date().toISOString(),
            name: data.client.name // Atualizar nome caso tenha mudado
          })
          .eq('id', clientId);
      } else {
        // Criar novo cliente
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: data.client.name,
            whatsapp: data.client.whatsapp,
            barbershop_id: data.barbershopId,
            last_visit: new Date().toISOString()
          })
          .select('id')
          .single();

        if (clientError || !newClient) {
          throw new Error('Erro ao criar cliente');
        }
        
        clientId = newClient.id;
      }

      // Calcular duração total dos serviços
      const { data: services } = await supabase
        .from('services')
        .select('duration')
        .in('id', data.serviceIds);

      const totalDuration = services?.reduce((total, service) => total + service.duration, 0) || 0;
      const endDateTime = addMinutes(new Date(data.startDateTime), totalDuration).toISOString();

      // Criar agendamento
      const { data: newAppointment, error: appointmentError } = await supabase
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
        .select('*')
        .single();

      if (appointmentError || !newAppointment) {
        throw new Error('Erro ao criar agendamento');
      }

      const appointment: Appointment = {
        id: newAppointment.id,
        clientId: newAppointment.client_id,
        professionalId: newAppointment.professional_id,
        serviceIds: newAppointment.service_ids,
        startDateTime: newAppointment.start_datetime,
        endDateTime: newAppointment.end_datetime,
        status: newAppointment.status as AppointmentStatus
      };

      return delay(appointment);
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  },

  // Clientes por barbearia
  getClientsByBarbershop: async (barbershopId: string): Promise<Client[]> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .order('last_visit', { ascending: false });

      if (error) {
        console.error('Clients error:', error);
        return [];
      }

      const clients: Client[] = data.map(item => ({
        id: item.id,
        name: item.name,
        whatsapp: item.whatsapp,
        lastVisit: item.last_visit || new Date().toISOString(),
        barbershopId: item.barbershop_id
      }));

      return delay(clients);
    } catch (error) {
      console.error('Clients error:', error);
      return [];
    }
  },

  // CRUD Serviços
  createService: async (serviceData: { name: string; price: number; duration: number; barbershopId: string }): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: serviceData.name,
          price: serviceData.price,
          duration: serviceData.duration,
          barbershop_id: serviceData.barbershopId
        })
        .select('*')
        .single();

      if (error || !data) {
        throw new Error('Erro ao criar serviço');
      }

      const service: Service = {
        id: data.id,
        name: data.name,
        price: data.price,
        duration: data.duration,
        barbershopId: data.barbershop_id
      };

      return delay(service);
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  },

  updateService: async (serviceId: string, serviceData: { name: string; price: number; duration: number }): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({
          name: serviceData.name,
          price: serviceData.price,
          duration: serviceData.duration
        })
        .eq('id', serviceId)
        .select('*')
        .single();

      if (error || !data) {
        throw new Error('Erro ao atualizar serviço');
      }

      const service: Service = {
        id: data.id,
        name: data.name,
        price: data.price,
        duration: data.duration,
        barbershopId: data.barbershop_id
      };

      return delay(service);
    } catch (error) {
      console.error('Update service error:', error);
      throw error;
    }
  },

  deleteService: async (serviceId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        throw new Error('Erro ao excluir serviço');
      }

      return delay(undefined);
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  },

  // CRUD Profissionais
  createProfessional: async (professionalData: { 
    name: string; 
    email: string; 
    role: UserRole; 
    barbershopId: string;
    workHours?: { day: number, start: string, end: string }[];
  }): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: professionalData.name,
          email: professionalData.email,
          role: professionalData.role,
          barbershop_id: professionalData.barbershopId,
          work_hours: professionalData.workHours || []
        })
        .select('*')
        .single();

      if (error || !data) {
        throw new Error('Erro ao criar profissional');
      }

      const professional: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        barbershopId: data.barbershop_id,
        role: data.role as UserRole,
        workHours: data.work_hours || []
      };

      return delay(professional);
    } catch (error) {
      console.error('Create professional error:', error);
      throw error;
    }
  },

  updateProfessional: async (professionalId: string, professionalData: { 
    name: string; 
    email: string; 
    role: UserRole;
    workHours?: { day: number, start: string, end: string }[];
  }): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: professionalData.name,
          email: professionalData.email,
          role: professionalData.role,
          work_hours: professionalData.workHours || []
        })
        .eq('id', professionalId)
        .select('*')
        .single();

      if (error || !data) {
        throw new Error('Erro ao atualizar profissional');
      }

      const professional: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        barbershopId: data.barbershop_id,
        role: data.role as UserRole,
        workHours: data.work_hours || []
      };

      return delay(professional);
    } catch (error) {
      console.error('Update professional error:', error);
      throw error;
    }
  },

  deleteProfessional: async (professionalId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', professionalId);

      if (error) {
        throw new Error('Erro ao excluir profissional');
      }

      return delay(undefined);
    } catch (error) {
      console.error('Delete professional error:', error);
      throw error;
    }
  },

  // CRUD Clientes
  updateClient: async (clientId: string, clientData: { name: string; whatsapp: string }): Promise<Client> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          whatsapp: clientData.whatsapp
        })
        .eq('id', clientId)
        .select('*')
        .single();

      if (error || !data) {
        throw new Error('Erro ao atualizar cliente');
      }

      const client: Client = {
        id: data.id,
        name: data.name,
        whatsapp: data.whatsapp,
        lastVisit: data.last_visit,
        barbershopId: data.barbershop_id
      };

      return delay(client);
    } catch (error) {
      console.error('Update client error:', error);
      throw error;
    }
  },

  deleteClient: async (clientId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        throw new Error('Erro ao excluir cliente');
      }

      return delay(undefined);
    } catch (error) {
      console.error('Delete client error:', error);
      throw error;
    }
  },

  // Configurações da Barbearia
  updateBarbershop: async (barbershopId: string, barbershopData: { 
    name: string; 
    address?: string; 
    phone?: string; 
    email?: string;
    logoUrl?: string;
  }): Promise<Barbershop> => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .update({
          name: barbershopData.name,
          address: barbershopData.address,
          phone: barbershopData.phone,
          email: barbershopData.email,
          logo_url: barbershopData.logoUrl
        })
        .eq('id', barbershopId)
        .select('*')
        .single();

      if (error || !data) {
        throw new Error('Erro ao atualizar barbearia');
      }

      const barbershop: Barbershop = {
        id: data.id,
        name: data.name,
        logoUrl: data.logo_url || '',
        address: data.address || '',
        slug: data.slug
      };

      return delay(barbershop);
    } catch (error) {
      console.error('Update barbershop error:', error);
      throw error;
    }
  },

  getBarbershopById: async (barbershopId: string): Promise<Barbershop | null> => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('id', barbershopId)
        .single();

      if (error || !data) {
        console.error('Barbershop error:', error);
        return null;
      }

      const barbershop: Barbershop = {
        id: data.id,
        name: data.name,
        logoUrl: data.logo_url || '',
        address: data.address || '',
        slug: data.slug
      };

      return delay(barbershop);
    } catch (error) {
      console.error('Barbershop error:', error);
      return null;
    }
  },

  // Dados do dashboard
  getDashboardData: async (barbershopId: string, date: Date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Buscar agendamentos do dia
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services:service_ids
        `)
        .eq('barbershop_id', barbershopId)
        .gte('start_datetime', startOfDay.toISOString())
        .lte('start_datetime', endOfDay.toISOString());

      if (error) {
        console.error('Dashboard error:', error);
        return { totalAppointments: 0, faturamentoPrevisto: 0, nextClientName: 'Nenhum' };
      }

      const totalAppointments = appointments.length;

      // Calcular faturamento (precisamos buscar os preços dos serviços)
      let faturamentoPrevisto = 0;
      if (appointments.length > 0) {
        const allServiceIds = appointments.flatMap(app => app.service_ids);
        const uniqueServiceIds = [...new Set(allServiceIds)];
        
        const { data: services } = await supabase
          .from('services')
          .select('id, price')
          .in('id', uniqueServiceIds);

        const serviceMap = new Map(services?.map(s => [s.id, s.price]) || []);
        
        faturamentoPrevisto = appointments.reduce((total, app) => {
          const appTotal = app.service_ids.reduce((serviceTotal: number, sId: string) => {
            return serviceTotal + (serviceMap.get(sId) || 0);
          }, 0);
          return total + appTotal;
        }, 0);
      }

      // Próximo cliente
      const now = new Date();
      const nextAppointment = appointments
        .filter(a => new Date(a.start_datetime) > now)
        .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())[0];

      let nextClientName = 'Nenhum';
      if (nextAppointment) {
        const { data: client } = await supabase
          .from('clients')
          .select('name')
          .eq('id', nextAppointment.client_id)
          .single();
        
        nextClientName = client?.name || 'Desconhecido';
      }

      return delay({ totalAppointments, faturamentoPrevisto, nextClientName });
    } catch (error) {
      console.error('Dashboard error:', error);
      return { totalAppointments: 0, faturamentoPrevisto: 0, nextClientName: 'Nenhum' };
    }
  },

  // Agendamentos para uma data específica
  getAppointmentsForDate: async (barbershopId: string, date: Date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id(name),
          users:professional_id(name)
        `)
        .eq('barbershop_id', barbershopId)
        .gte('start_datetime', startOfDay.toISOString())
        .lte('start_datetime', endOfDay.toISOString())
        .order('start_datetime');

      if (error) {
        console.error('Appointments for date error:', error);
        return [];
      }

      // Buscar serviços para cada agendamento
      const appointmentsWithDetails = await Promise.all(
        appointments.map(async (app) => {
          const { data: services } = await supabase
            .from('services')
            .select('*')
            .in('id', app.service_ids);

          return {
            ...app,
            clientName: (app.clients as any)?.name || 'Desconhecido',
            professionalName: (app.users as any)?.name || 'Desconhecido',
            services: services || [],
            // Converter para o formato esperado
            id: app.id,
            clientId: app.client_id,
            professionalId: app.professional_id,
            serviceIds: app.service_ids,
            startDateTime: app.start_datetime,
            endDateTime: app.end_datetime,
            status: app.status as AppointmentStatus
          };
        })
      );

      return delay(appointmentsWithDetails);
    } catch (error) {
      console.error('Appointments for date error:', error);
      return [];
    }
  }
};