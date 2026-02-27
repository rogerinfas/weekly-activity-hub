'use client'

import { useState, useMemo, useEffect } from 'react'
import { Task } from '@/lib/types'
import { INITIAL_TASKS } from '@/lib/mock-data'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { CalendarView } from '@/components/calendar/CalendarView'
import { MetricsDashboard } from '@/components/dashboard/MetricsDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutGrid, Calendar, BarChart3, Sparkles, Moon, Sun } from 'lucide-react'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [activeTab, setActiveTab] = useState<'kanban' | 'calendario' | 'dashboard'>('kanban')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('wah-dark')
    const prefersDark = saved !== null ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(prefersDark)
    document.documentElement.classList.toggle('dark', prefersDark)
  }, [])

  function toggleDark() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('wah-dark', String(next))
  }

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wah-tasks')
    let tasksToSet = INITIAL_TASKS
    if (saved) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any[] = JSON.parse(saved)
        tasksToSet = raw.map(t => {
          // Map old 'category' field to 'project' if needed
          const categoryToProject: Record<string, string> = {
            trabajo: 'desarrollo',
            aprendizaje: 'desarrollo',
            salud: 'personal',
            personal: 'personal',
            otro: 'otro',
          }
          return {
            ...t,
            project: t.project ?? categoryToProject[t.category] ?? 'otro',
            // Remove legacy fields
            category: undefined,
            priority: undefined,
          } as Task
        })
      } catch (e) {
        console.error('Failed to load tasks', e)
      }
    }

    // Defer state updates to avoid "synchronous state update in effect" lint error
    setTimeout(() => {
      setTasks(tasksToSet)
      setIsLoaded(true)
    }, 0)
  }, [])

  // Save to localStorage (debounced)
  useEffect(() => {
    if (isLoaded) {
      const timeout = setTimeout(() => {
        localStorage.setItem('wah-tasks', JSON.stringify(tasks))
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [tasks, isLoaded])

  const completedCount = useMemo(() => tasks.filter(t => t.status === 'completado').length, [tasks])
  const total = tasks.length
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  // Auto-manages completedAt: sets today when moved to 'completado', clears otherwise
  function applyCompletedAt(task: Task, prevTask?: Task): Task {
    const today = new Date().toISOString().split('T')[0]
    if (task.status === 'completado' && prevTask?.status !== 'completado') {
      return { ...task, completedAt: today }
    }
    if (task.status !== 'completado' && task.completedAt) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { completedAt: _, ...rest } = task
      return rest
    }
    return task
  }

  function handleSaveTask(task: Task) {
    setTasks(prev => {
      const exists = prev.find(t => t.id === task.id)
      const processed = applyCompletedAt(task, exists)
      return exists ? prev.map(t => t.id === task.id ? processed : t) : [processed, ...prev]
    })
  }

  function handleTasksChange(updatedTasks: Task[]) {
    setTasks(prev => {
      const prevById = Object.fromEntries(prev.map(t => [t.id, t]))
      return updatedTasks.map(t => applyCompletedAt(t, prevById[t.id]))
    })
  }

  function handleDeleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function handleCalendarEdit(task: Task) {
    setActiveTab('kanban')
    setEditingTaskId(task.id)
  }

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:block">Weekly Activity Hub</span>
          </div>

          {/* Progress pill */}
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

          <div className="flex items-center gap-2">
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

      {/* Main content */}
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

          {/* Kanban Tab */}
          <TabsContent value="kanban" className="mt-0">
            <KanbanBoard
              tasks={tasks}
              onTasksChange={handleTasksChange}
              onDelete={handleDeleteTask}
              onUpsertTask={handleSaveTask}
              editingTaskId={editingTaskId}
              onEditingChange={setEditingTaskId}
            />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendario" className="mt-0">
            <CalendarView tasks={tasks} onEditTask={handleCalendarEdit} />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-0">
            <MetricsDashboard tasks={tasks} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
