'use client'

import { useState } from 'react'
import { Task, Status, ApiProject } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
  onSave: (task: Task) => void
  projects: ApiProject[]
  editTask?: Task | null
  defaultStatus?: Status
}

export function AddTaskModal({ open, onClose, onSave, projects, editTask, defaultStatus }: AddTaskModalProps) {
  const defaultProject = projects.length > 0 ? projects[0].name : 'otro'

  const [form, setForm] = useState(() => {
    if (editTask) {
      return {
        title: editTask.title,
        description: editTask.description ?? '',
        project: editTask.project,
        status: editTask.status,
      }
    }
    return { title: '', description: '', project: defaultProject, status: (defaultStatus ?? 'backlog') as Status }
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return

    const task: Task = {
      id: editTask?.id ?? crypto.randomUUID(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      project: form.project,
      status: form.status,
      ...(editTask?.completedAt ? { completedAt: editTask.completedAt } : {}),
    }
    onSave(task)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {editTask ? 'Editar tarea' : 'Nueva tarea'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs">Título *</Label>
            <Input
              id="title"
              placeholder="¿Qué necesitas hacer?"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="h-9"
              autoFocus
            />
          </div>

          {/* Description — optional */}
          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs text-muted-foreground">
              Descripción <span className="text-muted-foreground/60">(opcional)</span>
            </Label>
            <Textarea
              id="desc"
              placeholder="Añade detalles si quieres..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="resize-none text-sm min-h-[64px]"
              rows={2}
            />
          </div>

          {/* Project + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Proyecto</Label>
              <Select value={form.project} onValueChange={v => setForm(f => ({ ...f, project: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.name} value={p.name}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Estado</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Status }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Pendiente</SelectItem>
                  <SelectItem value="en-progreso">En Progreso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={!form.title.trim()}>
              {editTask ? 'Guardar cambios' : 'Crear tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
