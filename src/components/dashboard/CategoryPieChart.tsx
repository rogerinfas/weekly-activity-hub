'use client'

import { useMemo } from 'react'
import { Task, PROJECT_HEX, PROJECT_LABELS, Project } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart'

interface CategoryPieChartProps {
  tasks: Task[]
}

export function CategoryPieChart({ tasks }: CategoryPieChartProps) {
  const data = useMemo(() => {
    const counts = tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.project] = (acc[t.project] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([proj, count]) => ({
      project: proj,
      name: PROJECT_LABELS[proj as Project] ?? proj,
      value: count,
      fill: PROJECT_HEX[proj as Project] ?? '#64748b',
    }))
  }, [tasks])

  const chartConfig = useMemo(() => {
    return data.reduce<ChartConfig>((acc, entry) => {
      acc[entry.project] = { label: entry.name, color: entry.fill }
      return acc
    }, {})
  }, [data])

  if (data.length === 0) {
    return (
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Distribución por proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Sin datos
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Distribución por proyecto</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <ChartContainer config={chartConfig} className="mx-auto max-h-[200px] w-full">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.project} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value, name) => [`${value} tareas`, name]}
            />
          </PieChart>
        </ChartContainer>

        {/* Leyenda custom — sin problemas de tipos */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {data.map((entry) => (
            <div key={entry.project} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-[11px] text-muted-foreground">{entry.name}</span>
              <span className="text-[11px] font-medium tabular-nums">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
