'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef, useState } from 'react'
import {
  Task,
  Project,
  PROJECT_COLORS,
  PROJECT_LABELS,
  PROJECT_DOT_COLORS,
} from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, CheckCircle2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ALL_PROJECTS: Project[] = ['desarrollo', 'diseño', 'marketing', 'personal', 'otro']

// ---- Main sortable card ----

interface KanbanCardProps {
  task: Task
  isEditing: boolean
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onSave: (task: Task) => void
  onCancel: () => void
}

export function KanbanCard({
  task,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: KanbanCardProps) {
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
      // Only attach drag listeners when NOT editing
      {...(isEditing ? {} : listeners)}
      className={cn(
        'group relative bg-card rounded-xl border border-border/60 p-3.5 shadow-sm',
        'transition-all duration-200',
        isEditing
          ? 'ring-2 ring-primary/40 border-primary/30 shadow-md cursor-default'
          : 'hover:shadow-md hover:border-primary/30 cursor-grab active:cursor-grabbing select-none touch-none',
        isDragging && 'opacity-30 scale-95',
      )}
    >
      <CardContent
        task={task}
        isEditing={isEditing}
        onEdit={onEdit}
        onDelete={onDelete}
        onSave={onSave}
        onCancel={onCancel}
      />
    </div>
  )
}

// ---- Shared card content (used by both sortable + overlay) ----

interface CardContentProps {
  task: Task
  isEditing: boolean
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onSave: (task: Task) => void
  onCancel: () => void
}

function CardContent({ task, isEditing, onEdit, onDelete, onSave, onCancel }: CardContentProps) {
  const [draft, setDraft] = useState<Task>(task)
  const titleRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // Sync draft when task changes from outside or edit mode starts
  useEffect(() => {
    setDraft(task)
  }, [task, isEditing])

  // Autofocus title when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => titleRef.current?.focus(), 0)
    }
  }, [isEditing])

  // Auto-grow textarea
  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  function handleSave() {
    if (!draft.title.trim()) return
    onSave({
      ...draft,
      title: draft.title.trim(),
      description: draft.description?.trim() || undefined,
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
    if (e.key === 'Enter' && !e.shiftKey && e.target === titleRef.current) {
      e.preventDefault()
      handleSave()
    }
  }

  // Click outside to save
  useEffect(() => {
    if (!isEditing) return
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        handleSave()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, draft])

  const canSave = draft.title.trim().length > 0

  return (
    <div ref={formRef} onKeyDown={isEditing ? handleKeyDown : undefined}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        {isEditing ? (
          <input
            ref={titleRef}
            value={draft.title}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            placeholder="¿Qué necesitas hacer?"
            className={cn(
              'flex-1 text-sm font-medium leading-snug text-foreground bg-transparent',
              'border-b border-primary/50 focus:border-primary outline-none',
              'placeholder:text-muted-foreground/50 w-full pb-0.5 -mb-0.5',
            )}
          />
        ) : (
          <h3 className="text-sm font-medium leading-snug text-foreground line-clamp-2 flex-1">
            {task.title || <span className="text-muted-foreground/50 italic">Sin título</span>}
          </h3>
        )}

        {/* Actions */}
        <div className={cn(
          'flex gap-1 shrink-0 transition-opacity',
          isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}>
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
                onPointerDown={e => e.stopPropagation()}
                onClick={handleSave}
                disabled={!canSave}
                title="Guardar (Enter)"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onPointerDown={e => e.stopPropagation()}
                onClick={onCancel}
                title="Cancelar (Esc)"
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {isEditing ? (
        <textarea
          ref={descRef}
          value={draft.description ?? ''}
          onChange={e => {
            setDraft(d => ({ ...d, description: e.target.value }))
            autoGrow(e.target)
          }}
          onFocus={e => autoGrow(e.target)}
          placeholder="Añade una descripción... (opcional)"
          rows={1}
          className={cn(
            'w-full text-xs text-muted-foreground bg-transparent resize-none mb-2.5',
            'border-b border-transparent focus:border-primary/40 outline-none',
            'placeholder:text-muted-foreground/40 leading-relaxed',
            'min-h-[1.4rem] overflow-hidden',
          )}
        />
      ) : (
        task.description && (
          <p className="text-xs text-muted-foreground mb-2.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )
      )}

      {/* Footer: project badge / project selector */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {isEditing ? (
          /* Inline project picker: cycle through options on click, no popup */
          <div className="flex flex-wrap gap-1">
            {ALL_PROJECTS.map(p => (
              <button
                key={p}
                type="button"
                onPointerDown={e => e.stopPropagation()}
                onClick={() => setDraft(d => ({ ...d, project: p }))}
                className={cn(
                  'flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
                  'transition-all duration-150',
                  draft.project === p
                    ? cn(PROJECT_COLORS[p], 'opacity-100 ring-1 ring-current')
                    : 'opacity-40 border-border hover:opacity-70 bg-transparent text-muted-foreground',
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', PROJECT_DOT_COLORS[p])} />
                {PROJECT_LABELS[p]}
              </button>
            ))}
          </div>
        ) : (
          <Badge
            variant="outline"
            className={cn('text-[10px] font-medium px-1.5 py-0 h-5 capitalize', PROJECT_COLORS[task.project])}
          >
            {PROJECT_LABELS[task.project]}
          </Badge>
        )}
      </div>

      {/* Date chips */}
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

// ---- UI-only overlay version (no dnd hooks, no editing) ----

interface KanbanCardUIProps {
  task: Task
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
