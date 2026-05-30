/** Regras de slot compartilhadas entre Edge Functions de agendamento. */
export const CLEANUP_MINUTES = 5;

export type ServiceRow = {
  id: string;
  price: number;
  duration: number;
  barbershop_id: string;
};

export function computeBookingTotals(services: ServiceRow[]): {
  valor: number;
  durationMinutes: number;
  horarioFim: Date;
} {
  const valor = services.reduce((acc, s) => acc + Number(s.price), 0);
  const durationMinutes =
    services.reduce((acc, s) => acc + Number(s.duration), 0) + CLEANUP_MINUTES;
  return { valor, durationMinutes, horarioFim: new Date() };
}

export function horarioFimFromStart(horarioInicio: Date, durationMinutes: number): Date {
  return new Date(horarioInicio.getTime() + durationMinutes * 60 * 1000);
}

export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function professionalConflict(
  slotProfId: string | null,
  occProfId: string | null,
): boolean {
  if (!slotProfId || !occProfId) return true;
  return slotProfId === occProfId;
}

export type OccupiedRange = {
  start: Date;
  end: Date;
  professionalId: string | null;
};

export function hasSlotConflict(
  slotStart: Date,
  slotEnd: Date,
  professionalId: string | null,
  occupied: OccupiedRange[],
): boolean {
  return occupied.some(
    (occ) =>
      rangesOverlap(slotStart, slotEnd, occ.start, occ.end) &&
      professionalConflict(professionalId, occ.professionalId),
  );
}
