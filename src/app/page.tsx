'use client'

import { useState, useMemo, useEffect } from 'react'
import { Task, Status } from '@/lib/types'
import { INITIAL_TASKS } from '@/lib/mock-data'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { AddTaskModal } from '@/components/kanban/AddTaskModal'
import { CalendarView } from '@/components/calendar/CalendarView'
import { MetricsDashboard } from '@/components/dashboard/MetricsDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutGrid, Calendar, BarChart3, Plus, Sparkles } from 'lucide-react'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<Status>('backlog')

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wah-tasks')
    let tasksToSet = INITIAL_TASKS
    if (saved) {
      try {
        tasksToSet = JSON.parse(saved)
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

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('wah-tasks', JSON.stringify(tasks))
    }
  }, [tasks, isLoaded])

  const completedCount = useMemo(() => tasks.filter(t => t.status === 'completado').length, [tasks])
  const total = tasks.length
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  function handleSaveTask(task: Task) {
    setTasks(prev => {
      const exists = prev.find(t => t.id === task.id)
      return exists ? prev.map(t => t.id === task.id ? task : t) : [...prev, task]
    })
  }

  function handleDeleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function handleEditTask(task: Task) {
    setEditTask(task)
    setModalOpen(true)
  }

  function handleAddTask(status: Status) {
    setEditTask(null)
    setDefaultStatus(status)
    setModalOpen(true)
  }

  function handleModalClose() {
    setModalOpen(false)
    setEditTask(null)
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

          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs rounded-full"
            onClick={() => handleAddTask('backlog')}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nueva tarea</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="kanban" className="space-y-6">
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
              onTasksChange={setTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAddTask={handleAddTask}
            />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendario" className="mt-0">
            <CalendarView tasks={tasks} onEditTask={handleEditTask} />
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-0">
            <MetricsDashboard tasks={tasks} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        key={`${modalOpen}-${editTask?.id ?? 'new'}`}
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSaveTask}
        editTask={editTask}
        defaultStatus={defaultStatus}
      />
    </div>
  )
}
