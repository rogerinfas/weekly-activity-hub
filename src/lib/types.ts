export type Status = 'backlog' | 'en-progreso' | 'completado'

export interface Task {
  id: string
  title: string
  description?: string
  project: string
  status: Status
  date?: string
  order?: number
  createdAt?: string
  completedAt?: string
}

export interface ApiProject {
  id: string
  name: string
  label: string
  color: string
  order: number
}

export interface Column {
  id: Status
  title: string
  color: string
}

export const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Pendiente', color: 'bg-slate-500' },
  { id: 'en-progreso', title: 'En Progreso', color: 'bg-amber-500' },
  { id: 'completado', title: 'Completado', color: 'bg-emerald-500' },
]

interface ColorSet {
  badge: string
  dot: string
  hex: string
}

export const COLOR_PALETTE: Record<string, ColorSet> = {
  blue:    { badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',     dot: 'bg-blue-500',    hex: '#3b82f6' },
  violet:  { badge: 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30', dot: 'bg-violet-500',  hex: '#8b5cf6' },
  pink:    { badge: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',     dot: 'bg-pink-500',    hex: '#ec4899' },
  amber:   { badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', dot: 'bg-amber-500',   hex: '#f59e0b' },
  slate:   { badge: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30', dot: 'bg-slate-500',   hex: '#64748b' },
  emerald: { badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-500', hex: '#10b981' },
  red:     { badge: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',         dot: 'bg-red-500',     hex: '#ef4444' },
  orange:  { badge: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30', dot: 'bg-orange-500',  hex: '#f97316' },
  cyan:    { badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',     dot: 'bg-cyan-500',    hex: '#06b6d4' },
  rose:    { badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',     dot: 'bg-rose-500',    hex: '#f43f5e' },
}

const FALLBACK_COLOR: ColorSet = COLOR_PALETTE.slate

export function getProjectBadge(projects: ApiProject[], projectName: string): string {
  const p = projects.find(pr => pr.name === projectName)
  return (p ? COLOR_PALETTE[p.color] : undefined)?.badge ?? FALLBACK_COLOR.badge
}

export function getProjectDot(projects: ApiProject[], projectName: string): string {
  const p = projects.find(pr => pr.name === projectName)
  return (p ? COLOR_PALETTE[p.color] : undefined)?.dot ?? FALLBACK_COLOR.dot
}

export function getProjectHex(projects: ApiProject[], projectName: string): string {
  const p = projects.find(pr => pr.name === projectName)
  return (p ? COLOR_PALETTE[p.color] : undefined)?.hex ?? FALLBACK_COLOR.hex
}

export function getProjectLabel(projects: ApiProject[], projectName: string): string {
  return projects.find(pr => pr.name === projectName)?.label ?? projectName
}
