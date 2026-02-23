// Utilidades de fecha y hora para VetAgenda

import { format, parse, addMinutes, isBefore, isAfter, isSameDay, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { DEFAULT_TIMEZONE } from "@/lib/constants";

/**
 * Convierte una fecha UTC a la zona horaria de la clínica.
 */
export function toClinicTime(date: Date | string, timezone: string = DEFAULT_TIMEZONE): Date {
  return toZonedTime(new Date(date), timezone);
}

/**
 * Convierte una fecha local de la clínica a UTC.
 */
export function fromClinicTime(date: Date, timezone: string = DEFAULT_TIMEZONE): Date {
  return fromZonedTime(date, timezone);
}

/**
 * Formatea una fecha en español: "Lun 24 Feb 2026"
 */
export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "EEE d MMM yyyy", { locale: es });
}

/**
 * Formatea una fecha larga: "Lunes, 24 de febrero de 2026"
 */
export function formatDateLong(date: Date | string): string {
  return format(new Date(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Formatea hora: "10:00"
 */
export function formatTime(date: Date | string): string {
  return format(new Date(date), "HH:mm");
}

/**
 * Formatea fecha y hora: "Lun 24 Feb · 10:00"
 */
export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "EEE d MMM · HH:mm", { locale: es });
}

/**
 * Genera slots de tiempo para un rango dado.
 * Ej: generateTimeSlots("09:00", "13:30", 30) → ["09:00","09:30","10:00",...]
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotMinutes: number
): string[] {
  const slots: string[] = [];
  const baseDate = new Date(2026, 0, 1); // Fecha base arbitraria

  let current = parse(startTime, "HH:mm", baseDate);
  const end = parse(endTime, "HH:mm", baseDate);

  while (isBefore(current, end)) {
    slots.push(format(current, "HH:mm"));
    current = addMinutes(current, slotMinutes);
  }

  return slots;
}

/**
 * Comprueba si dos rangos de tiempo se solapan.
 */
export function rangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return isBefore(start1, end2) && isAfter(end1, start2);
}

/**
 * Obtiene el día de la semana (0=Domingo) para una fecha.
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export { isSameDay, startOfDay, endOfDay, addMinutes, isBefore, isAfter, format, parse };
