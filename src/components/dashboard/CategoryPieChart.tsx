'use client'

import { useMemo } from 'react'
import { Task, PROJECT_HEX, PROJECT_LABELS, Project } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartLegend,
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
      acc[entry.project] = {
        label: entry.name,
        color: entry.fill,
      }
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
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto max-h-[240px] w-full">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.project} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
