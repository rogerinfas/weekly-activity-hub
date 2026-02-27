'use client'

import { useState, useMemo, useEffect } from 'react'
import { Task } from '@/lib/types'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { CalendarView } from '@/components/calendar/CalendarView'
import { MetricsDashboard } from '@/components/dashboard/MetricsDashboard'
import { WeekFilter } from '@/components/dashboard/WeekFilter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectManagerDialog } from '@/components/projects/ProjectManagerDialog'
import { LayoutGrid, Calendar, BarChart3, Sparkles, Moon, Sun, Settings2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks'
import { projectsApi } from '@/lib/api/projects'
import { type WeekRange, getWeekRange, parseTaskDate } from '@/lib/date-utils'
import { ApiProject } from '@/lib/types'

function filterByWeek(tasks: Task[], range: WeekRange | undefined): Task[] {
  if (!range) return tasks

  const { startDate, endDate } = range
  const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

  return tasks.filter(task => {
    const input = task.date ?? task.createdAt
    if (!input) return true
    const parsed = parseTaskDate(input)
    const dateOnly = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    return dateOnly >= startOnly && dateOnly <= endOnly
  })
}

export default function Home() {
  const queryClient = useQueryClient()
  const [isDark, setIsDark] = useState(false)
  const [activeTab, setActiveTab] = useState<'kanban' | 'calendario' | 'dashboard'>('kanban')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [kanbanWeekRange, setKanbanWeekRange] = useState<WeekRange | undefined>(() =>
    getWeekRange(new Date()),
  )
  const [projectsOpen, setProjectsOpen] = useState(false)

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: tasksApi.getAll,
  })

  const { data: projects = [] } = useQuery<ApiProject[]>({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  })

  const createTaskMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Task> }) => tasksApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  useEffect(() => {
    const saved = localStorage.getItem('wah-dark')
    const prefersDark = saved !== null ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(prefersDark)
    document.documentElement.classList.toggle('dark', prefersDark)
  }, [])

  function toggleDark() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('wah-dark', String(next))
  }

  const kanbanTasks = useMemo(
    () => filterByWeek(tasks, kanbanWeekRange),
    [tasks, kanbanWeekRange],
  )

  const completedCount = useMemo(() => kanbanTasks.filter(t => t.status === 'completado').length, [kanbanTasks])
  const total = kanbanTasks.length
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  function handleSaveTask(task: Task) {
    const exists = tasks.find(t => t.id === task.id)

    if (exists) {
      updateTaskMutation.mutate({ id: task.id, payload: task })
    } else {
      createTaskMutation.mutate(task as Omit<Task, 'id' | 'createdAt' | 'completedAt'>)
    }
  }

  function handleTasksChange(updatedTasks: Task[]) {
    const prevById = Object.fromEntries(tasks.map(t => [t.id, t]))

    updatedTasks.forEach((t) => {
      const prev = prevById[t.id]
      if (!prev || JSON.stringify(prev) !== JSON.stringify(t)) {
        updateTaskMutation.mutate({ id: t.id!, payload: t })
      }
    })
  }

  function handleDeleteTask(id: string) {
    deleteTaskMutation.mutate(id)
  }

  function handleCalendarEdit(task: Task) {
    setActiveTab('kanban')
    setEditingTaskId(task.id)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:block">Weekly Activity Hub</span>
          </div>

          <div className="flex items-center gap-2 bg-muted/60 rounded-full px-3 py-1">
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {completedCount}/{total}
            </span>
            <Badge variant="outline" className="text-[10px] py-0 h-4 px-1.5 border-primary/30 text-primary">
              {progressPct}%
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setProjectsOpen(true)}
              aria-label="Gestionar proyectos"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              onClick={toggleDark}
              aria-label="Cambiar modo oscuro"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'kanban' | 'calendario' | 'dashboard')}
          className="space-y-6"
        >
          <TabsList className="bg-muted/50 border border-border/60 rounded-xl p-1 h-auto gap-1">
            <TabsTrigger
              value="kanban"
              className="rounded-lg gap-1.5 text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Kanban
            </TabsTrigger>
            <TabsTrigger
              value="calendario"
              className="rounded-lg gap-1.5 text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Calendar className="h-3.5 w-3.5" />
              Calendario
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="rounded-lg gap-1.5 text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Métricas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Kanban semanal</h2>
              <WeekFilter value={kanbanWeekRange} onChange={setKanbanWeekRange} title="Semana" />
            </div>
            <KanbanBoard
              tasks={kanbanTasks}
              projects={projects}
              onTasksChange={handleTasksChange}
              onDelete={handleDeleteTask}
              onUpsertTask={handleSaveTask}
              editingTaskId={editingTaskId}
              onEditingChange={setEditingTaskId}
            />
          </TabsContent>

          <TabsContent value="calendario" className="mt-0">
            <CalendarView tasks={tasks} projects={projects} onEditTask={handleCalendarEdit} />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            <MetricsDashboard tasks={tasks} projects={projects} />
          </TabsContent>
        </Tabs>
      </main>
      <ProjectManagerDialog
        open={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        projects={projects}
      />
    </div>
  )
}
