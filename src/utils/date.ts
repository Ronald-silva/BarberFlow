// Funções utilitárias de data
import { format, addMinutes, isToday, isTomorrow, isYesterday, parseISO, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata data para exibição
 * @param date - Data a ser formatada
 * @param formatString - Formato desejado (padrão: "dd/MM/yyyy")
 */
export function formatDate(date: Date | string, formatString = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString, { locale: ptBR });
}

/**
 * Formata data e hora
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/**
 * Formata apenas hora
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm', { locale: ptBR });
}

/**
 * Formata data de forma relativa (Hoje, Amanhã, Ontem)
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) return 'Hoje';
  if (isTomorrow(dateObj)) return 'Amanhã';
  if (isYesterday(dateObj)) return 'Ontem';

  return formatDate(dateObj, 'dd/MM/yyyy');
}

/**
 * Adiciona minutos a uma data
 */
export function addMinutesToDate(date: Date | string, minutes: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addMinutes(dateObj, minutes);
}

/**
 * Retorna início do dia
 */
export function getStartOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(dateObj);
}

/**
 * Retorna fim do dia
 */
export function getEndOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(dateObj);
}

/**
 * Verifica se horário está no passado
 */
export function isInPast(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj.getTime() < Date.now();
}

/**
 * Gera array de horários disponíveis para agendamento
 * @param startHour - Hora inicial (ex: 9)
 * @param endHour - Hora final (ex: 18)
 * @param interval - Intervalo em minutos (ex: 30)
 */
export function generateTimeSlots(startHour: number, endHour: number, interval: number): string[] {
  const slots: string[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      slots.push(`${hourStr}:${minuteStr}`);
    }
  }

  return slots;
}

/**
 * Converte string de horário (HH:mm) para Date de hoje
 */
export function timeStringToDate(timeString: string, baseDate?: Date): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = baseDate ? new Date(baseDate) : new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}
