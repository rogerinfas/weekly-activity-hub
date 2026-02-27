'use client'

import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragOverlay,
  getFirstCollision,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Task, COLUMNS, Status, Column, Project } from '@/lib/types'
import { KanbanCard, KanbanCardUI } from './KanbanCard'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface KanbanBoardProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
  onDelete: (id: string) => void
  onUpsertTask: (task: Task) => void
  editingTaskId: string | null
  onEditingChange: (id: string | null) => void
}

// Internal data structure: column id → ordered task ids
type ColumnMap = Record<Status, UniqueIdentifier[]>

function tasksToColumnMap(tasks: Task[]): ColumnMap {
  return COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id).map(t => t.id)
    return acc
  }, {} as ColumnMap)
}

function applyColumnMap(source: Task[], columnMap: ColumnMap): Task[] {
  const byId = Object.fromEntries(source.map(t => [t.id, t]))
  return (Object.entries(columnMap) as [Status, UniqueIdentifier[]][]).flatMap(
    ([status, ids]) => ids.map(id => ({ ...byId[id as string], status }))
  )
}

export function KanbanBoard({
  tasks,
  onTasksChange,
  onDelete,
  onUpsertTask,
  editingTaskId,
  onEditingChange,
}: KanbanBoardProps) {
  const [columnMap, setColumnMap] = useState<ColumnMap>(() => tasksToColumnMap(tasks))
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef(false)
  // Snapshot taken at drag start for cancel rollback
  const clonedColumnMap = useRef<ColumnMap | null>(null)
  // Keep a stable reference to tasks without causing re-renders
  const tasksRef = useRef(tasks)
  useEffect(() => {
    tasksRef.current = tasks
  })

  // Sync column map when tasks change from outside (add/edit/delete) but NOT during drag
  useEffect(() => {
    if (activeId === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColumnMap(tasksToColumnMap(tasks))
    }
  }, [tasks, activeId])

  // Per the official dnd-kit example: reset recentlyMovedToNewContainer after each render
  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [columnMap])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const findContainer = useCallback((id: UniqueIdentifier): Status | undefined => {
    // id is one of the column ids
    if (id in columnMap) return id as Status
    // id is a task id
    return (Object.keys(columnMap) as Status[]).find(key =>
      columnMap[key].includes(id)
    )
  }, [columnMap])

  // Custom collision detection from the official dnd-kit MultipleContainers example
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // Pointer-within first (most precise)
      const pointerIntersections = pointerWithin(args)
      const intersections = pointerIntersections.length > 0
        ? pointerIntersections
        : rectIntersection(args)
      let overId = getFirstCollision(intersections, 'id')

      if (overId != null) {
        if (overId in columnMap) {
          const colItems = columnMap[overId as Status]
          if (colItems.length > 0) {
            // Return the closest item inside the container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(c =>
                c.id !== overId && colItems.includes(c.id)
              ),
            })[0]?.id ?? overId
          }
        }
        lastOverId.current = overId
        return [{ id: overId }]
      }

      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId
      }
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeId, columnMap]
  )

  function handleAddTask(status: Status) {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: '',
      project: 'desarrollo' as Project,
      status,
    }
    onUpsertTask(newTask)
    onEditingChange(newTask.id)
  }

  function handleDragStart({ active }: { active: { id: UniqueIdentifier } }) {
    setActiveId(active.id)
    clonedColumnMap.current = columnMap
  }

  function handleDragOver({ active, over }: { active: { id: UniqueIdentifier }, over: { id: UniqueIdentifier } | null }) {
    const overId = over?.id
    if (overId == null) return

    const overContainer = findContainer(overId)
    const activeContainer = findContainer(active.id)
    if (!overContainer || !activeContainer) return
    if (activeContainer === overContainer) return  // Same column — handled in dragEnd

    // Moving to a different column
    setColumnMap(prev => {
      const activeItems = prev[activeContainer]
      const overItems = prev[overContainer]
      const overIndex = overItems.indexOf(overId)
      const activeIndex = activeItems.indexOf(active.id)

      let newIndex: number
      if (overId in prev) {
        newIndex = overItems.length + 1
      } else {
        const isBelowOverItem =
          over &&
          'rect' in over &&
          (over as { rect: { top: number; height: number } }).rect.top !== undefined

        newIndex = overIndex >= 0 ? overIndex + (isBelowOverItem ? 1 : 0) : overItems.length + 1
      }

      recentlyMovedToNewContainer.current = true

      return {
        ...prev,
        [activeContainer]: activeItems.filter(id => id !== active.id),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeItems[activeIndex],
          ...overItems.slice(newIndex),
        ],
      }
    })
  }

  function handleDragEnd({ active, over }: { active: { id: UniqueIdentifier }, over: { id: UniqueIdentifier } | null }) {
    const activeContainer = findContainer(active.id)
    if (!activeContainer) {
      setActiveId(null)
      return
    }

    const overId = over?.id
    if (overId == null) {
      setActiveId(null)
      return
    }

    const overContainer = findContainer(overId)
    if (!overContainer) {
      setActiveId(null)
      return
    }

    const activeIndex = columnMap[activeContainer].indexOf(active.id)
    const overIndex = columnMap[overContainer].indexOf(overId)

    let finalMap = columnMap
    if (activeIndex !== overIndex && activeContainer === overContainer) {
      finalMap = {
        ...columnMap,
        [overContainer]: arrayMove(columnMap[overContainer], activeIndex, overIndex),
      }
      setColumnMap(finalMap)
    }

    // Commit to parent
    onTasksChange(applyColumnMap(tasksRef.current, finalMap))
    setActiveId(null)
    clonedColumnMap.current = null
  }

  function handleDragCancel() {
    if (clonedColumnMap.current) {
      setColumnMap(clonedColumnMap.current)
    }
    setActiveId(null)
    clonedColumnMap.current = null
  }

  const activeTask = activeId
    ? tasks.find(t => t.id === activeId) ?? null
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
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
            taskIds={columnMap[column.id]}
            allTasks={tasks}
            onDelete={onDelete}
            onAddTask={handleAddTask}
            editingTaskId={editingTaskId}
            onEditingChange={onEditingChange}
            onUpsertTask={onUpsertTask}
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

// ----- DroppableColumn (internal) -----

interface DroppableColumnProps {
  column: Column
  taskIds: UniqueIdentifier[]
  allTasks: Task[]
  onDelete: (id: string) => void
  onAddTask: (status: Status) => void
  editingTaskId: string | null
  onEditingChange: (id: string | null) => void
  onUpsertTask: (task: Task) => void
}

function DroppableColumn({
  column,
  taskIds,
  allTasks,
  onDelete,
  onAddTask,
  editingTaskId,
  onEditingChange,
  onUpsertTask,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const taskById = Object.fromEntries(allTasks.map(t => [t.id, t]))
  const orderedTasks = taskIds.map(id => taskById[id as string]).filter(Boolean)

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full', column.color)} />
          <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 font-medium tabular-nums">
            {taskIds.length}
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
          {orderedTasks.map(task => {
            const isEditing = editingTaskId === task.id
            const isNew = !task.title?.trim()

            if (isEditing) {
              return (
                <InlineTaskEditor
                  key={task.id}
                  task={task}
                  isNew={isNew}
                  onSave={updated => {
                    onUpsertTask(updated)
                    onEditingChange(null)
                  }}
                  onCancel={() => {
                    if (isNew) {
                      onDelete(task.id)
                    }
                    onEditingChange(null)
                  }}
                />
              )
            }

            return (
              <KanbanCard
                key={task.id}
                task={task}
                onEdit={taskToEdit => onEditingChange(taskToEdit.id)}
                onDelete={onDelete}
              />
            )
          })}
        </SortableContext>

        {taskIds.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-muted-foreground/40">
            <div className="text-xs text-center">Arrastra tarjetas aquí</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ----- InlineTaskEditor (internal) -----

interface InlineTaskEditorProps {
  task: Task
  isNew: boolean
  onSave: (task: Task) => void
  onCancel: () => void
}

function InlineTaskEditor({ task, isNew, onSave, onCancel }: InlineTaskEditorProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [project, setProject] = useState<Project>(task.project)

  const canSave = title.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return

    const updated: Task = {
      ...task,
      title: title.trim(),
      description: description.trim() || undefined,
      project,
    }
    onSave(updated)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'bg-card rounded-xl border border-border/60 p-3.5 shadow-sm space-y-2.5',
        'ring-1 ring-primary/20'
      )}
    >
      <div className="space-y-1">
        <Label htmlFor={`title-${task.id}`} className="text-[11px]">
          Título {isNew && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={`title-${task.id}`}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="¿Qué necesitas hacer?"
          className="h-8 text-xs"
          autoFocus
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`desc-${task.id}`} className="text-[11px] text-muted-foreground">
          Descripción <span className="text-muted-foreground/60">(opcional)</span>
        </Label>
        <Textarea
          id={`desc-${task.id}`}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Añade detalles si quieres..."
          className="min-h-[56px] text-xs resize-none"
          rows={2}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[11px]">Proyecto</Label>
        <Select value={project} onValueChange={v => setProject(v as Project)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desarrollo">Desarrollo</SelectItem>
            <SelectItem value="diseño">Diseño</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-1.5">
        <Button type="button" size="xs" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="xs" disabled={!canSave}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
