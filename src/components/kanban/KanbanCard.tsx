'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, CATEGORY_COLORS, PRIORITY_COLORS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Clock, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface KanbanCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  isOverlay?: boolean
}

export function KanbanCard({ task, onEdit, onDelete, isOverlay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCardUI
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
        isOverlay={isOverlay}
      />
    </div>
  )
}

interface KanbanCardUIProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  isDragging?: boolean
  isOverlay?: boolean
}

export function KanbanCardUI({ task, onEdit, onDelete, isDragging, isOverlay }: KanbanCardUIProps) {
  return (
    <div
      className={cn(
        'group relative bg-card rounded-xl border border-border/60 p-3.5 shadow-sm',
        'hover:shadow-md hover:border-primary/30 transition-all duration-200',
        'cursor-default select-none',
        isDragging && 'opacity-40 scale-95',
        isOverlay && 'shadow-xl rotate-1 scale-105 cursor-grabbing',
      )}
    >
      {/* Drag handle icon (visual only here, listeners are on the parent wrapper) */}
      <div
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2',
          'text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors',
          'opacity-0 group-hover:opacity-100',
        )}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="pl-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2 flex-1">
            {task.title}
          </h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(task.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="outline"
            className={cn('text-[10px] font-medium px-1.5 py-0 h-5 capitalize', CATEGORY_COLORS[task.category])}
          >
            {task.category}
          </Badge>
          <Badge
            variant="outline"
            className={cn('text-[10px] font-medium px-1.5 py-0 h-5 capitalize border-0', PRIORITY_COLORS[task.priority])}
          >
            {task.priority}
          </Badge>
          {task.estimatedHours && (
            <span className="ml-auto flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {task.estimatedHours}h
            </span>
          )}
        </div>

        {/* Date chip */}
        {task.date && (
          <div className="mt-2 text-[10px] text-muted-foreground bg-muted/60 rounded-md px-1.5 py-0.5 inline-block">
            {new Date(task.date + 'T00:00:00').toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </div>
        )}
      </div>
    </div>
  )
}
