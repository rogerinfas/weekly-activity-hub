'use client'

import { useMemo } from 'react'
import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { subDays, format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface MonthlyHistoryChartProps {
  tasks: Task[]
}

export function MonthlyHistoryChart({ tasks }: MonthlyHistoryChartProps) {
  const data = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(today, 13 - i)
      const dayTasks = tasks.filter(
        t => t.date && isSameDay(new Date(t.date + 'T00:00:00'), day)
      )
      const completedCount = dayTasks.filter(t => t.status === 'completado').length
      const totalCount = dayTasks.length
      return {
        date: format(day, 'dd/MM'),
        label: format(day, 'EEE', { locale: es }),
        completadas: completedCount,
        total: totalCount,
        isToday: isSameDay(day, today),
      }
    })
  }, [tasks])

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Historial de logros (últimos 14 días)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
              formatter={(value, name) => [value, name === 'completadas' ? 'Completadas' : 'Total']}
            />
            <Bar dataKey="total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completadas" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? '#7c3aed' : '#8b5cf6'}
                  fillOpacity={entry.isToday ? 1 : 0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 justify-end">
          <LegendDot color="bg-muted" label="Con actividad" />
          <LegendDot color="bg-violet-500" label="Completadas" />
        </div>
      </CardContent>
    </Card>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}
