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
    category: 'trabajo',
    status: 'backlog',
    priority: 'alta',
    estimatedHours: 2,
  },
  {
    id: '2',
    title: 'Leer libro "Atomic Habits"',
    description: 'Capítulos 5-8 sobre el sistema de hábitos.',
    category: 'aprendizaje',
    status: 'backlog',
    priority: 'baja',
    estimatedHours: 1.5,
  },
  {
    id: '3',
    title: 'Planificar dieta semanal',
    category: 'salud',
    status: 'backlog',
    priority: 'media',
    date: fmt(3),
    estimatedHours: 0.5,
  },
  {
    id: '4',
    title: 'Investigar Next.js 16 features',
    description: 'App Router, Server Actions, Partial Prerendering.',
    category: 'aprendizaje',
    status: 'backlog',
    priority: 'media',
    estimatedHours: 2,
  },
  {
    id: '5',
    title: 'Llamar al seguro médico',
    category: 'personal',
    status: 'backlog',
    priority: 'alta',
    date: fmt(1),
    estimatedHours: 0.5,
  },

  // En Progreso
  {
    id: '6',
    title: 'Implementar autenticación JWT',
    description: 'Módulo de login con refresh tokens y middleware de protección de rutas.',
    category: 'trabajo',
    status: 'en-progreso',
    priority: 'alta',
    date: fmt(0),
    estimatedHours: 6,
  },
  {
    id: '7',
    title: 'Curso de TypeScript avanzado',
    description: 'Módulos: Generics, Decorators, Utility Types.',
    category: 'aprendizaje',
    status: 'en-progreso',
    priority: 'media',
    date: fmt(-1),
    estimatedHours: 4,
  },
  {
    id: '8',
    title: 'Rutina de ejercicio matutino',
    description: 'Cardio 30 min + fuerza 20 min.',
    category: 'salud',
    status: 'en-progreso',
    priority: 'alta',
    date: fmt(0),
    estimatedHours: 1,
  },
  {
    id: '9',
    title: 'Organizar fotos del viaje',
    category: 'personal',
    status: 'en-progreso',
    priority: 'baja',
    estimatedHours: 2,
  },

  // Completado
  {
    id: '10',
    title: 'Setup del proyecto de gestión semanal',
    description: 'Next.js + Tailwind + Shadcn UI configurados y funcionando.',
    category: 'trabajo',
    status: 'completado',
    priority: 'alta',
    date: fmt(-2),
    estimatedHours: 3,
  },
  {
    id: '11',
    title: 'Meditación 10 minutos',
    category: 'salud',
    status: 'completado',
    priority: 'media',
    date: fmt(-3),
    estimatedHours: 0.25,
  },
  {
    id: '12',
    title: 'Reunión de planificación semanal',
    description: 'Daily standup extendido con el equipo.',
    category: 'trabajo',
    status: 'completado',
    priority: 'alta',
    date: fmt(-4),
    estimatedHours: 1,
  },
  {
    id: '13',
    title: 'Refactorizar componente de tabla',
    description: 'Separar lógica de presentación en el componente DataTable.',
    category: 'trabajo',
    status: 'completado',
    priority: 'media',
    date: fmt(-2),
    estimatedHours: 2.5,
  },
  {
    id: '14',
    title: 'Podcast: How I Built This',
    category: 'aprendizaje',
    status: 'completado',
    priority: 'baja',
    date: fmt(-5),
    estimatedHours: 1,
  },
  {
    id: '15',
    title: 'Actualizar CV y LinkedIn',
    description: 'Añadir proyectos recientes y habilidades nuevas.',
    category: 'personal',
    status: 'completado',
    priority: 'media',
    date: fmt(-6),
    estimatedHours: 1.5,
  },
]
