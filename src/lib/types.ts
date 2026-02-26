export type Category = 'trabajo' | 'personal' | 'salud' | 'aprendizaje' | 'otro'
export type Priority = 'baja' | 'media' | 'alta'
export type Status = 'backlog' | 'en-progreso' | 'completado'

export interface Task {
  id: string
  title: string
  description?: string
  category: Category
  status: Status
  priority: Priority
  date?: string
  estimatedHours?: number
}

export interface Column {
  id: Status
  title: string
  color: string
}

export const COLUMNS: Column[] = [
  { id: 'backlog', title: 'Pendiente', color: 'bg-slate-500' },
  { id: 'en-progreso', title: 'En Progreso', color: 'bg-violet-500' },
  { id: 'completado', title: 'Completado', color: 'bg-emerald-500' },
]

export const CATEGORY_COLORS: Record<Category, string> = {
  trabajo: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
  personal: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
  salud: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  aprendizaje: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
  otro: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
}

export const CATEGORY_DOT_COLORS: Record<Category, string> = {
  trabajo: 'bg-blue-500',
  personal: 'bg-pink-500',
  salud: 'bg-emerald-500',
  aprendizaje: 'bg-amber-500',
  otro: 'bg-slate-500',
}

export const CATEGORY_HEX: Record<Category, string> = {
  trabajo: '#3b82f6',
  personal: '#ec4899',
  salud: '#10b981',
  aprendizaje: '#f59e0b',
  otro: '#64748b',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  baja: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  media: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  alta: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}
