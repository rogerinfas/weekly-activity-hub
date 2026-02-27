'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, PROJECT_COLORS, PROJECT_LABELS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface KanbanCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function KanbanCard({ task, onEdit, onDelete }: KanbanCardProps) {
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative bg-card rounded-xl border border-border/60 p-3.5 shadow-sm',
        'hover:shadow-md hover:border-primary/30 transition-all duration-200',
        'cursor-grab active:cursor-grabbing select-none touch-none',
        isDragging && 'opacity-30 scale-95',
      )}
    >
      {/* Title + action buttons */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2 flex-1">
          {task.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onPointerDown={e => e.stopPropagation()}
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onPointerDown={e => e.stopPropagation()}
            onClick={() => onDelete(task.id)}
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

      {/* Footer: project badge */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge
          variant="outline"
          className={cn('text-[10px] font-medium px-1.5 py-0 h-5 capitalize', PROJECT_COLORS[task.project])}
        >
          {PROJECT_LABELS[task.project]}
        </Badge>
      </div>

      {/* Completion date — auto-set by the system */}
      {task.completedAt && (
        <div className="mt-2 flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-md px-1.5 py-0.5 w-fit">
          <CheckCircle2 className="h-2.5 w-2.5" />
          {new Date(task.completedAt + 'T00:00:00').toLocaleDateString('es-ES', {
            day: 'numeric', month: 'short',
          })}
        </div>
      )}
      {task.date && !task.completedAt && (
        <div className="mt-2 text-[10px] text-muted-foreground bg-muted/60 rounded-md px-1.5 py-0.5 inline-block">
          {new Date(task.date + 'T00:00:00').toLocaleDateString('es-ES', {
            weekday: 'short', day: 'numeric', month: 'short',
          })}
        </div>
      )}
    </div>
  )
}

// ---- UI-only version used in DragOverlay (no dnd hooks) ----
interface KanbanCardUIProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  isOverlay?: boolean
}

export function KanbanCardUI({ task, isOverlay }: KanbanCardUIProps) {
  return (
    <div
      className={cn(
        'relative bg-card rounded-xl border border-border/60 p-3.5 shadow-sm select-none',
        isOverlay && 'shadow-2xl rotate-2 scale-105 cursor-grabbing ring-2 ring-primary/30',
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2 flex-1">
          {task.title}
        </h3>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-2.5 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge
          variant="outline"
          className={cn('text-[10px] font-medium px-1.5 py-0 h-5 capitalize', PROJECT_COLORS[task.project])}
        >
          {PROJECT_LABELS[task.project]}
        </Badge>
      </div>
    </div>
  )
}
