
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum AppointmentStatus {
  CONFIRMED = 'Confirmado',
  PENDING = 'Pendente',
  CANCELED = 'Cancelado',
}

export interface Barbershop {
  id: string;
  name: string;
  logoUrl: string;
  address: string;
  slug: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  barbershopId: string;
  role: UserRole;
  workHours: { day: number, start: string, end: string }[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  barbershopId: string;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  lastVisit: string; // ISO date string
  barbershopId: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceIds: string[];
  startDateTime: string; // ISO date string
  endDateTime: string; // ISO date string
  status: AppointmentStatus;
}
