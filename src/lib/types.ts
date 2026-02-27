export type Project = 'desarrollo' | 'diseño' | 'marketing' | 'personal' | 'otro'
export type Status = 'backlog' | 'en-progreso' | 'completado'

// localStorage.removeItem('wah-tasks')

export interface Task {
  id: string
  title: string
  description?: string
  project: Project
  status: Status
  date?: string        // Optional start/due date
  completedAt?: string // Auto-set when moved to 'completado', auto-cleared on move out
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

export const PROJECT_COLORS: Record<Project, string> = {
  desarrollo:  'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
  diseño:      'bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/30',
  marketing:   'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
  personal:    'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
  otro:        'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
}

export const PROJECT_DOT_COLORS: Record<Project, string> = {
  desarrollo: 'bg-blue-500',
  diseño:     'bg-violet-500',
  marketing:  'bg-pink-500',
  personal:   'bg-amber-500',
  otro:       'bg-slate-500',
}

export const PROJECT_HEX: Record<Project, string> = {
  desarrollo: '#3b82f6',
  diseño:     '#8b5cf6',
  marketing:  '#ec4899',
  personal:   '#f59e0b',
  otro:       '#64748b',
}

export const PROJECT_LABELS: Record<Project, string> = {
  desarrollo: 'Desarrollo',
  diseño:     'Diseño',
  marketing:  'Marketing',
  personal:   'Personal',
  otro:       'Otro',
}
