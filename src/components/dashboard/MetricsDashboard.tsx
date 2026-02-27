'use client'

import { Task, ApiProject } from '@/lib/types'
import { WeeklyProgressChart } from './WeeklyProgressChart'
import { CategoryPieChart } from './CategoryPieChart'
import { MonthlyHistoryChart } from './MonthlyHistoryChart'
import { WeekFilter } from './WeekFilter'
import { type WeekRange, getWeekRange } from '@/lib/date-utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Zap, Target, Award } from 'lucide-react'
import { useState, useMemo } from 'react'

interface MetricsDashboardProps {
  tasks: Task[]
  projects: ApiProject[]
}

export function MetricsDashboard({ tasks, projects }: MetricsDashboardProps) {
  // Por defecto inicializamos con la semana actual
  const [selectedWeekRange, setSelectedWeekRange] = useState<WeekRange | undefined>(() => getWeekRange(new Date()))

  // Filtramos las tareas según el rango seleccionado (usamos date o createdAt para ubicarlas)
  const filteredTasks = useMemo(() => {
    if (!selectedWeekRange) return tasks

    return tasks.filter(t => {
      // Usamos t.date si existe, si no, t.createdAt
      const taskDateInput = t.date || t.createdAt || new Date().toISOString()
      const taskDate = new Date(taskDateInput)

      // Ajustamos hora a 00:00:00 para comparación segura
      const dateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate())
      const startOnly = new Date(selectedWeekRange.startDate.getFullYear(), selectedWeekRange.startDate.getMonth(), selectedWeekRange.startDate.getDate())
      const endOnly = new Date(selectedWeekRange.endDate.getFullYear(), selectedWeekRange.endDate.getMonth(), selectedWeekRange.endDate.getDate())

      return dateOnly >= startOnly && dateOnly <= endOnly
    })
  }, [tasks, selectedWeekRange])


  const stats = useMemo(() => {
    const completed = filteredTasks.filter(t => t.status === 'completado').length
    const inProgress = filteredTasks.filter(t => t.status === 'en-progreso').length

    // Top project based on filtered tasks
    const projectCounts = filteredTasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.project] = (acc[t.project] ?? 0) + 1
      return acc
    }, {})

    const sortedProjects = Object.entries(projectCounts).sort((a, b) => b[1] - a[1])
    const topProject = sortedProjects.length > 0 ? sortedProjects[0] : null

    return { completed, inProgress, topProject }
  }, [filteredTasks])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Resumen de Métricas</h2>
        <WeekFilter
          value={selectedWeekRange}
          onChange={setSelectedWeekRange}
        />
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Target className="h-4 w-4" />}
          label="Tareas completadas"
          value={stats.completed}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <KpiCard
          icon={<Zap className="h-4 w-4" />}
          label="En progreso"
          value={stats.inProgress}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Tareas totales"
          value={filteredTasks.length}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <KpiCard
          icon={<Award className="h-4 w-4" />}
          label="Proyecto líder"
          value={stats.topProject ? stats.topProject[0] : '—'}
          color="text-violet-500"
          bg="bg-violet-500/10"
          capitalize
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <WeeklyProgressChart tasks={filteredTasks} />
        <CategoryPieChart tasks={filteredTasks} projects={projects} />
        <div className="lg:col-span-1">
          <MonthlyHistoryChart tasks={filteredTasks} />
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  color,
  bg,
  capitalize,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  bg: string
  capitalize?: boolean
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardContent className="p-4">
        <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${bg} ${color} mb-3`}>
          {icon}
        </div>
        <p className={`text-xl font-bold tabular-nums ${capitalize ? 'capitalize' : ''}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  )
}
