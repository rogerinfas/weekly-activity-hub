'use client'

import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, Clock } from 'lucide-react'

interface WeeklyProgressChartProps {
  tasks: Task[]
}

export function WeeklyProgressChart({ tasks }: WeeklyProgressChartProps) {
  const completed = tasks.filter(t => t.status === 'completado').length
  const inProgress = tasks.filter(t => t.status === 'en-progreso').length
  const backlog = tasks.filter(t => t.status === 'backlog').length
  const total = tasks.length
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0
  const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Progreso semanal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Big number */}
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-primary tabular-nums">{completedPct}%</span>
          <span className="text-sm text-muted-foreground mb-1">completado</span>
        </div>

        {/* Main progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{completed} completadas</span>
            <span>{total} total</span>
          </div>
          <Progress value={completedPct} className="h-2.5" />
        </div>

        {/* In-progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{inProgress} en progreso</span>
            <span>{inProgressPct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-violet-400 rounded-full transition-all duration-500"
              style={{ width: `${inProgressPct}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <StatChip icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />} label="Completadas" value={completed} />
          <StatChip icon={<Clock className="h-3.5 w-3.5 text-violet-500" />} label="En curso" value={inProgress} />
          <StatChip icon={<Circle className="h-3.5 w-3.5 text-slate-400" />} label="Pendientes" value={backlog} />
        </div>

        {/* Extra summary (optional) */}
      </CardContent>
    </Card>
  )
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 py-2.5 px-2">
      {icon}
      <span className="text-base font-bold tabular-nums">{value}</span>
      <span className="text-[9px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  )
}
