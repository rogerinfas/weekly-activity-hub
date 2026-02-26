'use client'

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState, useMemo } from 'react'
import { Task, COLUMNS, Status } from '@/lib/types'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCardUI } from './KanbanCard'

interface KanbanBoardProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAddTask: (status: Status) => void
}

export function KanbanBoard({ tasks, onTasksChange, onEdit, onDelete, onAddTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.id] = tasks.filter(t => t.status === column.id)
      return acc
    }, {} as Record<Status, Task[]>)
  }, [tasks])

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    // Dropped over a column
    const isOverColumn = COLUMNS.some(c => c.id === overId)
    if (isOverColumn && activeTask.status !== overId) {
      onTasksChange(
        tasks.map(t => t.id === activeId ? { ...t, status: overId as Status } : t)
      )
      return
    }

    // Dropped over another task
    const overTask = tasks.find(t => t.id === overId)
    if (!overTask) return

    if (activeTask.status !== overTask.status) {
      onTasksChange(
        tasks.map(t => t.id === activeId ? { ...t, status: overTask.status } : t)
      )
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = tasks.find(t => t.id === activeId)
    const overTask = tasks.find(t => t.id === overId)

    if (!activeTask) return

    // If over a task in the same column, reorder
    if (overTask && activeTask.status === overTask.status) {
      const colTasks = tasksByStatus[activeTask.status]
      const oldIdx = colTasks.findIndex(t => t.id === activeId)
      const newIdx = colTasks.findIndex(t => t.id === overId)
      const reordered = arrayMove(colTasks, oldIdx, newIdx)
      const otherTasks = tasks.filter(t => t.status !== activeTask.status)
      onTasksChange([...otherTasks, ...reordered])
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask && (
          <KanbanCardUI
            task={activeTask}
            onEdit={() => { }}
            onDelete={() => { }}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
