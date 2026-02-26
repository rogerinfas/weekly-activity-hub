'use client'

import { useMemo } from 'react'
import { Task, PROJECT_HEX, PROJECT_LABELS, Project } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

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
      name: PROJECT_LABELS[proj as Project] ?? proj,
      value: count,
      color: PROJECT_HEX[proj as Project] ?? '#64748b',
    }))
  }, [tasks])

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Distribución por proyecto</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Sin datos
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value, name) => [`${value} tareas`, name]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
