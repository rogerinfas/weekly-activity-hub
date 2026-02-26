'use client'

import { useState } from 'react'
import { Task, Category, Priority, Status } from '@/lib/types'
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
  editTask?: Task | null
  defaultStatus?: Status
}

const emptyForm = {
  title: '',
  description: '',
  category: 'trabajo' as Category,
  priority: 'media' as Priority,
  status: 'backlog' as Status,
  date: '',
  estimatedHours: '',
}

export function AddTaskModal({ open, onClose, onSave, editTask, defaultStatus }: AddTaskModalProps) {
  const [form, setForm] = useState(() => {
    if (editTask) {
      return {
        title: editTask.title,
        description: editTask.description ?? '',
        category: editTask.category,
        priority: editTask.priority,
        status: editTask.status,
        date: editTask.date ?? '',
        estimatedHours: editTask.estimatedHours?.toString() ?? '',
      }
    }
    return { ...emptyForm, status: defaultStatus ?? 'backlog' }
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return

    const task: Task = {
      id: editTask?.id ?? crypto.randomUUID(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      priority: form.priority,
      status: form.status,
      date: form.date || undefined,
      estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
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

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs">Descripción</Label>
            <Input
              id="desc"
              placeholder="Detalles opcionales..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="h-9"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Categoría</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as Category }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trabajo">Trabajo</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="salud">Salud</SelectItem>
                  <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Prioridad</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status + Date */}
          <div className="grid grid-cols-2 gap-3">
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

            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs">Fecha (opcional)</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="h-9"
              />
            </div>
          </div>

          {/* Estimated hours */}
          <div className="space-y-1.5">
            <Label htmlFor="hours" className="text-xs">Horas estimadas</Label>
            <Input
              id="hours"
              type="number"
              min="0.25"
              max="24"
              step="0.25"
              placeholder="ej. 1.5"
              value={form.estimatedHours}
              onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))}
              className="h-9"
            />
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
