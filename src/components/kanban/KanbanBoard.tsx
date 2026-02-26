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
  UniqueIdentifier,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { useState, useMemo, useRef, useEffect } from 'react'
import { Task, COLUMNS, Status, Column } from '@/lib/types'
import { KanbanCard, KanbanCardUI } from './KanbanCard'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KanbanBoardProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAddTask: (status: Status) => void
}

export function KanbanBoard({ tasks, onTasksChange, onEdit, onDelete, onAddTask }: KanbanBoardProps) {
  // Local copy of tasks used exclusively during a drag session
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Ref to know if we're currently dragging without causing re-renders
  const isDraggingRef = useRef(false)

  // When the parent updates tasks (e.g. add/edit/delete) and we're NOT dragging,
  // sync the local copy. Using useEffect avoids setting state during render.
  // Sync from parent when not dragging. The eslint rule is suppressed because
  // this is a deliberate external-state subscription, not a cascading update.
  useEffect(() => {
    if (!isDraggingRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalTasks(tasks)
    }
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.id] = localTasks.filter(t => t.status === column.id)
      return acc
    }, {} as Record<Status, Task[]>)
  }, [localTasks])

  function handleDragStart(event: DragStartEvent) {
    isDraggingRef.current = true
    const task = localTasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    setLocalTasks(prev => {
      const activeTask = prev.find(t => t.id === activeId)
      if (!activeTask) return prev

      // Dropped over a column
      const isOverColumn = COLUMNS.some(c => c.id === overId)
      if (isOverColumn) {
        if (activeTask.status === overId) return prev
        return prev.map(t => t.id === activeId ? { ...t, status: overId as Status } : t)
      }

      // Dropped over another task
      const overTask = prev.find(t => t.id === overId)
      if (!overTask) return prev

      if (activeTask.status !== overTask.status) {
        // Move to the target column, position before the over-task
        const moved = prev.map(t => t.id === activeId ? { ...t, status: overTask.status } : t)
        const colTasks = moved.filter(t => t.status === overTask.status)
        const overIdx = colTasks.findIndex(t => t.id === overId)
        const activeIdx = colTasks.findIndex(t => t.id === activeId)
        const reordered = arrayMove(colTasks, activeIdx, overIdx)
        return [...moved.filter(t => t.status !== overTask.status), ...reordered]
      }

      // Reorder within the same column
      const colTasks = prev.filter(t => t.status === activeTask.status)
      const oldIdx = colTasks.findIndex(t => t.id === activeId)
      const newIdx = colTasks.findIndex(t => t.id === overId)
      if (oldIdx === newIdx) return prev
      const reordered = arrayMove(colTasks, oldIdx, newIdx)
      return [...prev.filter(t => t.status !== activeTask.status), ...reordered]
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    void event // satisfy linter
    isDraggingRef.current = false
    setActiveTask(null)
    // Commit final local state to parent — done outside of any setState callback
    onTasksChange(localTasks)
  }

  function handleDragCancel() {
    isDraggingRef.current = false
    setActiveTask(null)
    // Revert: sync back from parent
    setLocalTasks(tasks)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-5 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <DroppableColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
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

// ----- Internal column component -----

interface DroppableColumnProps {
  column: Column
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAddTask: (status: Status) => void
}

function DroppableColumn({ column, tasks, onEdit, onDelete, onAddTask }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const taskIds = useMemo<UniqueIdentifier[]>(() => tasks.map(t => t.id), [tasks])

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full', column.color)} />
          <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 font-medium tabular-nums">
            {tasks.length}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => onAddTask(column.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 flex-1 min-h-[120px] rounded-2xl p-2 transition-colors duration-150',
          'bg-muted/40',
          isOver && 'bg-primary/5 ring-2 ring-primary/20',
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground/40">
            <div className="text-xs text-center">Arrastra tarjetas aquí</div>
          </div>
        )}
      </div>
    </div>
  )
}
