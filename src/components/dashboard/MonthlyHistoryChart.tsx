'use client'

import { useMemo } from 'react'
import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { subDays, format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface MonthlyHistoryChartProps {
  tasks: Task[]
}

const chartConfig = {
  total: {
    label: 'Con actividad',
    color: 'var(--chart-5)',   /* slate – fondo neutro */
  },
  completadas: {
    label: 'Completadas',
    color: 'var(--chart-4)',   /* amber – color primario del tema */
  },
} satisfies ChartConfig

export function MonthlyHistoryChart({ tasks }: MonthlyHistoryChartProps) {
  if (tasks.length === 0) {
    return (
      <Card className="rounded-2xl border-border/60 shadow-sm h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Historial del mes (Últimos 30 días)</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground pb-8">
            Sin datos
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(today, 13 - i)
      // Use effective date: explicit date or createdAt as fallback
      const dayTasks = tasks.filter(t => {
        const effectiveDate = t.date ?? t.createdAt
        return effectiveDate && isSameDay(new Date(effectiveDate + 'T00:00:00'), day)
      })
      const completedCount = dayTasks.filter(t => t.status === 'completado').length
      const totalCount = dayTasks.length
      return {
        date: format(day, 'dd/MM'),
        label: format(day, 'EEE d', { locale: es }),
        completadas: completedCount,
        total: totalCount,
        isToday: isSameDay(day, today),
      }
    })
  }, [tasks])

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Historial de actividad (últimos 14 días)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={16} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent labelKey="date" />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completadas" fill="var(--color-completadas)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>

        {/* Custom Legend (JSX) to avoid Recharts v3/React 19 types conflicts */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-[11px] text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
