import { User, UserRole, Barbershop, Service, Client, Appointment, AppointmentStatus } from '../types';
import { addMinutes, format } from 'date-fns';
import { supabase } from './supabase';

// --- MOCK DATABASE ---

const barbershops: Barbershop[] = [
    { id: 'b1', name: 'Navalha Dourada', logoUrl: 'https://picsum.photos/seed/logo1/100/100', address: 'Rua das Tesouras, 123', slug: 'navalha-dourada' }
];

const users: User[] = [
    { id: 'u1', name: 'Roberto Silva', email: 'admin@barber.com', barbershopId: 'b1', role: UserRole.ADMIN, workHours: [{day: 1, start: '09:00', end: '18:00'}, {day: 2, start: '09:00', end: '18:00'}, {day: 3, start: '09:00', end: '18:00'}, {day: 4, start: '09:00', end: '18:00'}, {day: 5, start: '09:00', end: '20:00'}, {day: 6, start: '08:00', end: '16:00'}] },
    { id: 'u2', name: 'Thiago Santos', email: 'thiago@barber.com', barbershopId: 'b1', role: UserRole.MEMBER, workHours: [{day: 1, start: '10:00', end: '19:00'}, {day: 2, start: '10:00', end: '19:00'}, {day: 3, start: '10:00', end: '19:00'}, {day: 4, start: '10:00', end: '19:00'}, {day: 5, start: '10:00', end: '21:00'}, {day: 6, start: '08:00', end: '16:00'}] },
    { id: 'u3', name: 'Felipe Costa', email: 'felipe@barber.com', barbershopId: 'b1', role: UserRole.MEMBER, workHours: [{day: 2, start: '09:00', end: '18:00'}, {day: 3, start: '09:00', end: '18:00'}, {day: 4, start: '09:00', end: '18:00'}, {day: 5, start: '09:00', end: '20:00'}, {day: 6, start: '08:00', end: '16:00'}, {day: 0, start: '09:00', end: '15:00'}] }
];

const services: Service[] = [
    { id: 's1', name: 'Corte de Cabelo', price: 40, duration: 45, barbershopId: 'b1' },
    { id: 's2', name: 'Barba', price: 30, duration: 30, barbershopId: 'b1' },
    { id: 's3', name: 'Corte e Barba', price: 65, duration: 75, barbershopId: 'b1' },
    { id: 's4', name: 'Pezinho', price: 15, duration: 15, barbershopId: 'b1' }
];

const clients: Client[] = [
    { id: 'c1', name: 'Carlos Silva', whatsapp: '5511988887777', lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), barbershopId: 'b1' },
    { id: 'c2', name: 'João Santos', whatsapp: '5511966665555', lastVisit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), barbershopId: 'b1' },
    { id: 'c3', name: 'Pedro Oliveira', whatsapp: '5511955554444', lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), barbershopId: 'b1' },
    { id: 'c4', name: 'Rafael Costa', whatsapp: '5511944443333', lastVisit: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), barbershopId: 'b1' },
    { id: 'c5', name: 'Lucas Ferreira', whatsapp: '5511933332222', lastVisit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), barbershopId: 'b1' },
    { id: 'c6', name: 'Marcos Almeida', whatsapp: '5511922221111', lastVisit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), barbershopId: 'b1' },
    { id: 'c7', name: 'André Ribeiro', whatsapp: '5511911110000', lastVisit: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), barbershopId: 'b1' },
];

const createAppointmentDate = (hours: number, minutes: number) => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

const appointments: Appointment[] = [
    { id: 'a1', clientId: 'c1', professionalId: 'u1', serviceIds: ['s3'], startDateTime: createAppointmentDate(9, 0).toISOString(), endDateTime: createAppointmentDate(10, 15).toISOString(), status: AppointmentStatus.CONFIRMED },
    { id: 'a2', clientId: 'c2', professionalId: 'u2', serviceIds: ['s1'], startDateTime: createAppointmentDate(10, 30).toISOString(), endDateTime: createAppointmentDate(11, 15).toISOString(), status: AppointmentStatus.CONFIRMED },
    { id: 'a3', clientId: 'c3', professionalId: 'u1', serviceIds: ['s2'], startDateTime: createAppointmentDate(11, 0).toISOString(), endDateTime: createAppointmentDate(11, 30).toISOString(), status: AppointmentStatus.CONFIRMED },
    { id: 'a4', clientId: 'c4', professionalId: 'u3', serviceIds: ['s1', 's2'], startDateTime: createAppointmentDate(14, 0).toISOString(), endDateTime: createAppointmentDate(15, 15).toISOString(), status: AppointmentStatus.CONFIRMED },
    { id: 'a5', clientId: 'c5', professionalId: 'u2', serviceIds: ['s3'], startDateTime: createAppointmentDate(15, 30).toISOString(), endDateTime: createAppointmentDate(16, 45).toISOString(), status: AppointmentStatus.CONFIRMED },
    { id: 'a6', clientId: 'c6', professionalId: 'u1', serviceIds: ['s4'], startDateTime: createAppointmentDate(16, 0).toISOString(), endDateTime: createAppointmentDate(16, 15).toISOString(), status: AppointmentStatus.CONFIRMED },
];

// --- MOCK API FUNCTIONS ---

const delay = <T,>(data: T, ms = 500): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), ms));

export const api = {
    login: (email: string, pass: string) => {
        console.log(`Attempting login for: ${email}`);
        const user = users.find(u => u.email === email);
        // In a real app, you'd check the password hash
        return delay(user || null);
    },
    getBarbershopBySlug: (slug: string) => {
        const barbershop = barbershops.find(b => b.slug === slug);
        return delay(barbershop);
    },
    getServicesByBarbershop: (barbershopId: string) => {
        const barbershopServices = services.filter(s => s.barbershopId === barbershopId);
        return delay(barbershopServices);
    },
    getProfessionalsByBarbershop: (barbershopId: string) => {
        const barbershopProfessionals = users.filter(u => u.barbershopId === barbershopId);
        return delay(barbershopProfessionals);
    },
    getAppointmentsByProfessional: (professionalId: string, date: Date) => {
        const professionalAppointments = appointments.filter(a => {
            // Fix: Replaced `parseISO` with `new Date()`
            const appointmentDate = new Date(a.startDateTime);
            return a.professionalId === professionalId &&
                   format(appointmentDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });
        return delay(professionalAppointments);
    },
    // Fix: Omitted 'clientId' from the createAppointment parameter type as it is derived within the function.
    createAppointment: (data: Omit<Appointment, 'id' | 'endDateTime' | 'status' | 'clientId'> & {client: Omit<Client, 'id' | 'lastVisit' | 'barbershopId'>, barbershopId: string}) => {
        let client = clients.find(c => c.whatsapp === data.client.whatsapp);
        if(!client) {
            client = { ...data.client, id: `c${clients.length + 1}`, lastVisit: new Date().toISOString(), barbershopId: data.barbershopId };
            clients.push(client);
        } else {
            client.lastVisit = new Date().toISOString();
        }

        const totalDuration = data.serviceIds.reduce((total, sId) => {
            const service = services.find(s => s.id === sId);
            return total + (service?.duration || 0);
        }, 0);

        const newAppointment: Appointment = {
            id: `a${appointments.length + 1}`,
            clientId: client.id,
            professionalId: data.professionalId,
            serviceIds: data.serviceIds,
            startDateTime: data.startDateTime,
            // Fix: Replaced `parseISO` with `new Date()`
            endDateTime: addMinutes(new Date(data.startDateTime), totalDuration).toISOString(),
            status: AppointmentStatus.CONFIRMED,
        };
        appointments.push(newAppointment);
        return delay(newAppointment);
    },
    getClientsByBarbershop: (barbershopId: string) => {
        const barbershopClients = clients.filter(c => c.barbershopId === barbershopId);
        return delay(barbershopClients);
    },
    getDashboardData: (barbershopId: string, date: Date) => {
        const todayAppointments = appointments.filter(a => {
            // Fix: Replaced `parseISO` with `new Date()`
            const appointmentDate = new Date(a.startDateTime);
            return format(appointmentDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });

        const totalAppointments = todayAppointments.length;
        const faturamentoPrevisto = todayAppointments.reduce((total, app) => {
            const appTotal = app.serviceIds.reduce((serviceTotal, sId) => {
                const service = services.find(s => s.id === sId);
                return serviceTotal + (service?.price || 0);
            }, 0);
            return total + appTotal;
        }, 0);
        
        const proximoCliente = todayAppointments
            // Fix: Replaced `parseISO` with `new Date()`
            .filter(a => new Date(a.startDateTime) > new Date())
            // Fix: Replaced `parseISO` with `new Date()`
            .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
            [0];
            
        const nextClientName = proximoCliente ? clients.find(c => c.id === proximoCliente.clientId)?.name : 'Nenhum';
        
        return delay({ totalAppointments, faturamentoPrevisto, nextClientName });
    },
     getAppointmentsForDate: (barbershopId: string, date: Date) => {
        const dateAppointments = appointments.filter(a => {
            // Fix: Replaced `parseISO` with `new Date()`
            const appointmentDate = new Date(a.startDateTime);
            return format(appointmentDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        });

        const appointmentsWithDetails = dateAppointments.map(app => {
            const client = clients.find(c => c.id === app.clientId);
            const professional = users.find(u => u.id === app.professionalId);
            const appServices = services.filter(s => app.serviceIds.includes(s.id));
            return {
                ...app,
                clientName: client?.name || 'Desconhecido',
                professionalName: professional?.name || 'Desconhecido',
                services: appServices,
            };
        });
        return delay(appointmentsWithDetails);
    },
};