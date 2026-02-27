import { Task } from './types'

const today = new Date()
const fmt = (offset: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

export const INITIAL_TASKS: Task[] = [
  // Backlog
  {
    id: '1',
    title: 'Revisar PRs pendientes del sprint',
    description: 'Hay 4 pull requests esperando revisión en el repositorio principal.',
    project: 'desarrollo',
    status: 'backlog',
    createdAt: fmt(-7),
  },
  {
    id: '2',
    title: 'Rediseñar landing page',
    description: 'Nuevo hero section y sección de precios.',
    project: 'diseño',
    status: 'backlog',
    createdAt: fmt(-5),
  },
  {
    id: '3',
    title: 'Planificar campaña Q2',
    project: 'marketing',
    status: 'backlog',
    date: fmt(3),
    createdAt: fmt(-4),
  },
  {
    id: '4',
    title: 'Investigar Next.js features',
    description: 'App Router, Server Actions, Partial Prerendering.',
    project: 'desarrollo',
    status: 'backlog',
    createdAt: fmt(-3),
  },
  {
    id: '5',
    title: 'Organizar agenda personal',
    project: 'personal',
    status: 'backlog',
    date: fmt(1),
    createdAt: fmt(-2),
  },

  // En Progreso
  {
    id: '6',
    title: 'Implementar autenticación JWT',
    description: 'Módulo de login con refresh tokens y middleware de protección de rutas.',
    project: 'desarrollo',
    status: 'en-progreso',
    date: fmt(0),
    createdAt: fmt(-6),
  },
  {
    id: '7',
    title: 'Diseño de sistema de colores',
    description: 'Paleta de colores dark/light para el design system.',
    project: 'diseño',
    status: 'en-progreso',
    createdAt: fmt(-5),
  },
  {
    id: '8',
    title: 'Email campaign de bienvenida',
    description: 'Secuencia de 4 emails onboarding.',
    project: 'marketing',
    status: 'en-progreso',
    createdAt: fmt(-4),
  },
  {
    id: '9',
    title: 'Actualizar CV y LinkedIn',
    project: 'personal',
    status: 'en-progreso',
    createdAt: fmt(-3),
  },

  // Completado
  {
    id: '10',
    title: 'Setup del proyecto de gestión semanal',
    description: 'Next.js + Tailwind + Shadcn UI configurados y funcionando.',
    project: 'desarrollo',
    status: 'completado',
    createdAt: fmt(-10),
    completedAt: fmt(-2),
  },
  {
    id: '11',
    title: 'Wireframes de dashboard',
    project: 'diseño',
    status: 'completado',
    createdAt: fmt(-9),
    completedAt: fmt(-3),
  },
  {
    id: '12',
    title: 'Reunión de planificación semanal',
    description: 'Daily standup extendido con el equipo.',
    project: 'marketing',
    status: 'completado',
    createdAt: fmt(-8),
    completedAt: fmt(-4),
  },
  {
    id: '13',
    title: 'Refactorizar componente de tabla',
    description: 'Separar lógica de presentación en el componente DataTable.',
    project: 'desarrollo',
    status: 'completado',
    createdAt: fmt(-8),
    completedAt: fmt(-2),
  },
  {
    id: '14',
    title: 'Revisión de métricas mensuales',
    project: 'marketing',
    status: 'completado',
    createdAt: fmt(-10),
    completedAt: fmt(-5),
  },
  {
    id: '15',
    title: 'Objetivos personales Q2',
    description: 'Revisar y actualizar OKRs personales.',
    project: 'personal',
    status: 'completado',
    createdAt: fmt(-12),
    completedAt: fmt(-6),
  },
]
