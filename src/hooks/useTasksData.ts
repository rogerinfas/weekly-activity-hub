'use client'

import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/lib/api/tasks'
import { projectsApi } from '@/lib/api/projects'
import { type WeekRange, getWeekRange, parseTaskDate } from '@/lib/date-utils'
import { Task, ApiProject, Status } from '@/lib/types'

function filterByWeek(tasks: Task[], range: WeekRange | undefined): Task[] {
  if (!range) return tasks

  const { startDate, endDate } = range
  const startOnly = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  )
  const endOnly = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  )

  return tasks.filter(task => {
    const input = task.date ?? task.createdAt
    if (!input) return true
    const parsed = parseTaskDate(input)
    const dateOnly = new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
    )
    return dateOnly >= startOnly && dateOnly <= endOnly
  })
}

export function useTasksData() {
  const queryClient = useQueryClient()
  const [kanbanWeekRange, setKanbanWeekRange] = useState<WeekRange | undefined>(
    () => getWeekRange(new Date()),
  )
  const dragBatchCounter = useRef(0)

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: tasksApi.getAll,
  })

  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
  } = useQuery<ApiProject[]>({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  })

  const createTaskMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Task> }) =>
      tasksApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const kanbanTasks = useMemo(
    () => filterByWeek(tasks, kanbanWeekRange),
    [tasks, kanbanWeekRange],
  )

  const completedCount = useMemo(
    () => kanbanTasks.filter(t => t.status === 'completado').length,
    [kanbanTasks],
  )
  const total = kanbanTasks.length
  const progressPct =
    total > 0 ? Math.round((completedCount / total) * 100) : 0

  function handleCreateTask(task: Task) {
    queryClient.setQueryData<Task[]>(['tasks'], old => [
      ...(old ?? []),
      task,
    ])
  }

  function handleSaveTask(task: Task) {
    const cached = tasks.find(t => t.id === task.id)
    const isOnServer = cached?.createdAt != null

    if (isOnServer) {
      queryClient.setQueryData<Task[]>(['tasks'], old =>
        (old ?? []).map(t => (t.id === task.id ? { ...t, ...task } : t)),
      )
      updateTaskMutation.mutate({ id: task.id, payload: task })
    } else if (task.title.trim()) {
      queryClient.setQueryData<Task[]>(['tasks'], old =>
        (old ?? []).map(t => (t.id === task.id ? task : t)),
      )
      createTaskMutation.mutate(
        task as Omit<Task, 'id' | 'createdAt' | 'completedAt'>,
      )
    }
  }

  function handleDragCommit(updatedTasks: Task[]) {
    const prevById = Object.fromEntries(tasks.map(t => [t.id, t]))
    const changes: { id: string; status: Status; order: number }[] = []

    for (const t of updatedTasks) {
      const prev = prevById[t.id]
      if (!prev || !prev.createdAt) continue
      if (prev.status !== t.status || prev.order !== t.order) {
        changes.push({ id: t.id, status: t.status, order: t.order ?? 0 })
      }
    }

    if (changes.length === 0) return

    const nowMs = Date.now()

    queryClient.setQueryData<Task[]>(['tasks'], old => {
      if (!old) return old
      const changeById = new Map(changes.map(c => [c.id, c]))
      return old.map(t => {
        const c = changeById.get(t.id)
        if (!c) return t

        const prev = prevById[t.id]
        if (!prev) {
          return { ...t, status: c.status, order: c.order }
        }

        const wasCompleted = prev.status === 'completado'
        const isCompleted = c.status === 'completado'

        let activeTimerStartedAt = t.activeTimerStartedAt ?? null
        let totalTrackedSeconds = t.totalTrackedSeconds ?? 0
        let resumeTimerOnExit = t.resumeTimerOnExit ?? false

        if (!wasCompleted && isCompleted) {
          if (activeTimerStartedAt) {
            const startedAtMs = Date.parse(activeTimerStartedAt)
            const deltaSeconds = Math.max(
              0,
              Math.floor((nowMs - startedAtMs) / 1000),
            )
            totalTrackedSeconds += deltaSeconds
            activeTimerStartedAt = null
            resumeTimerOnExit = true
          } else {
            resumeTimerOnExit = false
          }
        } else if (wasCompleted && !isCompleted) {
          if (resumeTimerOnExit && !activeTimerStartedAt) {
            activeTimerStartedAt = new Date(nowMs).toISOString()
          }
          resumeTimerOnExit = false
        }

        return {
          ...t,
          status: c.status,
          order: c.order,
          activeTimerStartedAt,
          totalTrackedSeconds,
          resumeTimerOnExit,
        }
      })
    })

    dragBatchCounter.current += 1
    const batchId = dragBatchCounter.current

    tasksApi
      .reorderBatch(changes)
      .finally(() => {
        if (dragBatchCounter.current === batchId) {
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }
      })
  }

  function handleDeleteTask(id: string) {
    const cached = tasks.find(t => t.id === id)
    queryClient.setQueryData<Task[]>(['tasks'], old =>
      (old ?? []).filter(t => t.id !== id),
    )
    if (cached?.createdAt) {
      deleteTaskMutation.mutate(id)
    }
  }

  function startTimer(taskId: string) {
    const nowIso = new Date().toISOString()
    queryClient.setQueryData<Task[]>(['tasks'], old =>
      (old ?? []).map(t =>
        t.id === taskId && !t.activeTimerStartedAt
          ? { ...t, activeTimerStartedAt: nowIso }
          : t,
      ),
    )

    tasksApi
      .startTimer(taskId)
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      })
  }

  function stopTimer(taskId: string) {
    const currentTasks = queryClient.getQueryData<Task[]>(['tasks']) ?? tasks
    const target = currentTasks.find(t => t.id === taskId)
    if (!target?.activeTimerStartedAt) {
      return
    }

    const startedAtMs = Date.parse(target.activeTimerStartedAt)
    const nowMs = Date.now()
    const deltaSeconds = Math.max(0, Math.floor((nowMs - startedAtMs) / 1000))

    queryClient.setQueryData<Task[]>(['tasks'], old =>
      (old ?? []).map(t =>
        t.id === taskId
          ? {
              ...t,
              activeTimerStartedAt: null,
              totalTrackedSeconds: (t.totalTrackedSeconds ?? 0) + deltaSeconds,
            }
          : t,
      ),
    )

    tasksApi
      .stopTimer(taskId)
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      })
  }

  return {
    tasks,
    projects,
    kanbanTasks,
    kanbanWeekRange,
    setKanbanWeekRange,
    completedCount,
    total,
    progressPct,
    handleCreateTask,
    handleSaveTask,
    handleDragCommit,
    handleDeleteTask,
    startTimer,
    stopTimer,
    loading: tasksLoading || projectsLoading,
    error: tasksError || projectsError,
  }
}

