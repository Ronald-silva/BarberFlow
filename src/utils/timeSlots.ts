import type { WorkInterval, DaySchedule, WorkingHoursConfig } from '../types';

/**
 * Generates time slot strings ("HH:MM") within all intervals of a day schedule.
 * Slots are spaced by slotMinutes. The last slot must finish before the interval ends.
 *
 * Example: interval 08:00-12:00, slotMinutes=60 → ["08:00","09:00","10:00","11:00"]
 */
export function generateSlotsForIntervals(
  intervals: WorkInterval[],
  slotMinutes: number,
): string[] {
  const slots: string[] = [];
  const step = Math.max(slotMinutes, 15);

  for (const { start, end } of intervals) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let cur = sh * 60 + sm;
    const endMin = eh * 60 + em;
    while (cur + step <= endMin) {
      slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`);
      cur += step;
    }
  }
  return slots;
}

/**
 * Returns the DaySchedule for a given Date (using getDay()).
 * Falls back to a single 09:00-18:00 interval if no config exists for that day.
 */
export function getDaySchedule(
  config: WorkingHoursConfig | undefined | null,
  date: Date,
): DaySchedule | null {
  if (!config || config.length === 0) return null;
  const dow = date.getDay(); // 0=Sun … 6=Sat
  return config.find((d) => d.day === dow) ?? null;
}

/**
 * Returns the available time slots for a given date and barbershop working hours.
 * - `null` — sem configuração de horário no banco (ex.: `working_hours` vazio); o caller pode usar fallback.
 * - `[]` — barbearia fechada nesse dia da semana ou sem intervalos válidos.
 * - demais — horários clicáveis.
 */
export function getAvailableSlots(
  config: WorkingHoursConfig | undefined | null,
  date: Date,
  slotMinutes: number,
): string[] | null {
  if (!config || config.length === 0) return null;
  const schedule = getDaySchedule(config, date);
  if (!schedule || !schedule.enabled || schedule.intervals.length === 0) return [];
  let slots = generateSlotsForIntervals(schedule.intervals, slotMinutes);
  /* Se a duração total do serviço for grande vs. o intervalo do dia, a primeira grade pode vir vazia — tenta grade de 15 em 15 min. */
  if (slots.length === 0) {
    slots = generateSlotsForIntervals(schedule.intervals, 15);
  }
  return slots;
}

/** Default working hours config (Mon–Sat, single interval). */
export const DEFAULT_WORKING_HOURS: WorkingHoursConfig = [
  { day: 0, enabled: false, intervals: [{ start: '09:00', end: '15:00' }] },
  { day: 1, enabled: true,  intervals: [{ start: '09:00', end: '18:00' }] },
  { day: 2, enabled: true,  intervals: [{ start: '09:00', end: '18:00' }] },
  { day: 3, enabled: true,  intervals: [{ start: '09:00', end: '18:00' }] },
  { day: 4, enabled: true,  intervals: [{ start: '09:00', end: '18:00' }] },
  { day: 5, enabled: true,  intervals: [{ start: '09:00', end: '20:00' }] },
  { day: 6, enabled: true,  intervals: [{ start: '08:00', end: '16:00' }] },
];
