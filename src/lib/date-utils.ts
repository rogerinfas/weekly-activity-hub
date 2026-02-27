import {
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isSameYear,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'

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
