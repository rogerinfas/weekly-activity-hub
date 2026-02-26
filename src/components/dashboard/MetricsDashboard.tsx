'use client'

import { Task, CATEGORY_HEX, Category } from '@/lib/types'
import { WeeklyProgressChart } from './WeeklyProgressChart'
import { CategoryPieChart } from './CategoryPieChart'
import { MonthlyHistoryChart } from './MonthlyHistoryChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Zap, Target, Award } from 'lucide-react'
import { useMemo } from 'react'

interface MetricsDashboardProps {
  tasks: Task[]
}

export function MetricsDashboard({ tasks }: MetricsDashboardProps) {
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completado').length
    const highPriorityDone = tasks.filter(t => t.status === 'completado' && t.priority === 'alta').length
    const totalHours = tasks
      .filter(t => t.status === 'completado')
      .reduce((acc, t) => acc + (t.estimatedHours ?? 0), 0)
    const topCategory = Object.entries(
      tasks.reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + 1
        return acc
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]

    return { completed, highPriorityDone, totalHours, topCategory }
  }, [tasks])

  return (
    <div className="space-y-5">
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
          label="Alta prioridad hechas"
          value={stats.highPriorityDone}
          color="text-red-500"
          bg="bg-red-500/10"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Horas completadas"
          value={`${stats.totalHours.toFixed(1)}h`}
          color="text-violet-500"
          bg="bg-violet-500/10"
        />
        <KpiCard
          icon={<Award className="h-4 w-4" />}
          label="Categoría líder"
          value={stats.topCategory ? stats.topCategory[0] : '—'}
          color="text-amber-500"
          bg="bg-amber-500/10"
          capitalize
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <WeeklyProgressChart tasks={tasks} />
        <CategoryPieChart tasks={tasks} />
        <div className="lg:col-span-1">
          <MonthlyHistoryChart tasks={tasks} />
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
