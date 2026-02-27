import {
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isSameYear,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Safely parses a date string coming from the API.
 *
 * - Full ISO datetime strings (e.g. "2026-02-27T15:30:00.000Z") are parsed
 *   directly with `new Date()`.
 * - Plain date strings (e.g. "2026-02-27") are treated as local midnight by
 *   appending "T00:00:00", avoiding the UTC-offset day-shift bug.
 *
 * Using `value + 'T00:00:00'` on an already-full ISO string produces an
 * invalid format ("...000ZT00:00:00") and results in Invalid Date.
 */
export function parseTaskDate(value: string): Date {
  return new Date(value.includes('T') ? value : value + 'T00:00:00')
}

export interface WeekRange {
  startDate: Date
  endDate: Date
}

/**
 * Retorna el inicio de la semana (Lunes).
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

/**
 * Retorna el rango de una semana desde Lunes a Domingo.
 */
export function getWeekRange(date: Date): WeekRange {
  const startDate = getWeekStart(date)
  const endDate = endOfWeek(date, { weekStartsOn: 1 })
  return { startDate, endDate }
}

/**
 * Verifica si dos fechas están en la misma semana.
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  return isSameDay(getWeekStart(date1), getWeekStart(date2))
}

/**
 * Calcula el número de la semana en el mes actual (1 a 5).
 */
export function getWeekNumber(date: Date): number {
  const startOfCurrentMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const firstWeekStart = getWeekStart(startOfCurrentMonth)
  const diffTime = getWeekStart(date).getTime() - firstWeekStart.getTime()
  const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7))
  return diffWeeks + 1
}

/**
 * Formatea un rango de fechas. Si es del mismo mes, muestra '10 - 16 Mar'.
 * Si abarcan meses distintos, '28 Feb - 6 Mar'.
 */
export function formatWeekRange(startDate: Date, endDate: Date): string {
  const sameMonth = isSameMonth(startDate, endDate)
  const sameYear = isSameYear(startDate, endDate)

  const mnt1 = format(startDate, 'MMM', { locale: es }).replace('.', '')
  const mnt2 = format(endDate, 'MMM', { locale: es }).replace('.', '')

  if (sameMonth && sameYear) {
    return `${format(startDate, 'd')} - ${format(endDate, 'd')} ${mnt1}`
  } else if (!sameMonth && sameYear) {
    return `${format(startDate, 'd')} ${mnt1} - ${format(endDate, 'd')} ${mnt2}`
  }
  return `${format(startDate, 'd')} ${mnt1} - ${format(endDate, 'd')} ${mnt2} ${format(endDate, 'yy')}`
}
