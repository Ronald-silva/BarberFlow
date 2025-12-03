// Schemas de validação com Zod
import { z } from 'zod';

// ============================================
// AUTENTICAÇÃO
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos uma letra')
    .regex(/\d/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// ============================================
// BARBEARIA
// ============================================

export const barbershopSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  slug: z
    .string()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  address: z.string().min(10, 'Endereço deve ter no mínimo 10 caracteres'),
  phone: z
    .string()
    .regex(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, 'Telefone inválido. Use (XX) XXXXX-XXXX'),
  description: z.string().optional(),
});

// ============================================
// PROFISSIONAL
// ============================================

export const professionalSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .regex(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, 'Telefone inválido. Use (XX) XXXXX-XXXX'),
  role: z.enum(['admin', 'member']),
  workHours: z
    .object({
      monday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
      tuesday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
      wednesday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
      thursday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
      friday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
      saturday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
      sunday: z.object({ start: z.string(), end: z.string(), active: z.boolean() }).optional(),
    })
    .optional(),
});

// ============================================
// SERVIÇO
// ============================================

export const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  price: z.number().min(100, 'Preço mínimo é R$ 1,00'),
  duration: z.number().min(15, 'Duração mínima é 15 minutos').max(480, 'Duração máxima é 8 horas'),
});

// ============================================
// CLIENTE
// ============================================

export const clientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  whatsapp: z
    .string()
    .regex(/^\+55[0-9]{11}$/, 'WhatsApp inválido. Use +55XXXXXXXXXXX')
    .or(z.string().regex(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, 'WhatsApp inválido')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
});

// ============================================
// AGENDAMENTO
// ============================================

export const appointmentSchema = z.object({
  clientId: z.string().uuid('Cliente inválido'),
  professionalId: z.string().uuid('Profissional inválido'),
  serviceIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos um serviço'),
  startDatetime: z.date().refine((date) => date > new Date(), {
    message: 'Data deve ser futura',
  }),
  notes: z.string().optional(),
});

export const bookingSchema = z.object({
  clientName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  clientWhatsapp: z
    .string()
    .regex(/^\+55[0-9]{11}$/, 'WhatsApp inválido. Use +55XXXXXXXXXXX')
    .or(z.string().regex(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, 'WhatsApp inválido')),
  clientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  professionalId: z.string().uuid('Selecione um profissional'),
  serviceIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos um serviço'),
  startDatetime: z.date().refine((date) => date > new Date(), {
    message: 'Selecione uma data futura',
  }),
});

// ============================================
// PAGAMENTO
// ============================================

export const paymentSchema = z.object({
  appointmentId: z.string().uuid(),
  method: z.enum(['pix', 'bitcoin', 'card', 'cash']),
  amount: z.number().min(100, 'Valor mínimo é R$ 1,00'),
});

// ============================================
// TIPOS INFERIDOS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BarbershopInput = z.infer<typeof barbershopSchema>;
export type ProfessionalInput = z.infer<typeof professionalSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
