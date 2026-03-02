'use client'

import { ApiProject, Task } from '@/lib/types'
import { WeeklyProgressChart } from './WeeklyProgressChart'
import { CategoryPieChart } from './CategoryPieChart'
import { MonthlyHistoryChart } from './MonthlyHistoryChart'
import { WeekFilter } from './WeekFilter'
import { type WeekRange, getWeekRange } from '@/lib/date-utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Zap, Target, Award } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks'

interface MetricsDashboardProps {
  projects: ApiProject[]
}

export function MetricsDashboard({ projects }: MetricsDashboardProps) {
  // Por defecto inicializamos con la semana actual
  const [selectedWeekRange, setSelectedWeekRange] = useState<WeekRange | undefined>(() =>
    getWeekRange(new Date()),
  )

  const {
    data: metrics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      'tasks-metrics',
      selectedWeekRange?.startDate.toISOString(),
      selectedWeekRange?.endDate.toISOString(),
    ],
    queryFn: () =>
      tasksApi.getMetrics({
        startDate: selectedWeekRange?.startDate.toISOString(),
        endDate: selectedWeekRange?.endDate.toISOString(),
      }),
    enabled: !!selectedWeekRange,
  })

  const filteredTasks: Task[] = metrics?.tasks ?? []
  const completed = metrics?.summary.completed ?? 0
  const inProgress = metrics?.summary.inProgress ?? 0
  const total = metrics?.summary.total ?? 0
  const topProject = metrics?.summary.topProject ?? null

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
          value={completed}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <KpiCard
          icon={<Zap className="h-4 w-4" />}
          label="En progreso"
          value={inProgress}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Tareas totales"
          value={total}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <KpiCard
          icon={<Award className="h-4 w-4" />}
          label="Proyecto líder"
          value={topProject ? topProject.project : '—'}
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
