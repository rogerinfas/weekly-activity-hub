'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiProject, COLOR_PALETTE } from '@/lib/types'
import { projectsApi } from '@/lib/api/projects'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

const AVAILABLE_COLORS = Object.keys(COLOR_PALETTE)

interface ProjectManagerDialogProps {
  open: boolean
  onClose: () => void
  projects: ApiProject[]
}

interface ProjectForm {
  name: string
  label: string
  color: string
}

const emptyForm: ProjectForm = { name: '', label: '', color: 'blue' }

export function ProjectManagerDialog({ open, onClose, projects }: ProjectManagerDialogProps) {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState<ProjectForm>(emptyForm)

  const createMutation = useMutation({
    mutationFn: (data: Omit<ApiProject, 'id'>) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      resetForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiProject> }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setIsAdding(false)
  }

  function startEdit(project: ApiProject) {
    setEditingId(project.id)
    setIsAdding(false)
    setForm({ name: project.name, label: project.label, color: project.color })
  }

  function startAdd() {
    setIsAdding(true)
    setEditingId(null)
    setForm(emptyForm)
  }

  function handleSave() {
    const slug = form.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-záéíóúñü0-9-]/g, '')

    if (!slug || !form.label.trim()) return

    const payload = {
      name: slug,
      label: form.label.trim(),
      color: form.color,
      order: projects.length,
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Gestionar proyectos</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {projects.map(project => {
            const palette = COLOR_PALETTE[project.color] ?? COLOR_PALETTE.slate
            const isEditing = editingId === project.id

            if (isEditing) {
              return (
                <ProjectFormRow
                  key={project.id}
                  form={form}
                  onChange={setForm}
                  onSave={handleSave}
                  onCancel={resetForm}
                  isLoading={isLoading}
                />
              )
            }

            return (
              <div
                key={project.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 group"
              >
                <div className="flex items-center gap-2">
                  <span className={cn('w-3 h-3 rounded-full shrink-0', palette.dot)} />
                  <span className="text-sm font-medium">{project.label}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {project.name}
                  </Badge>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => startEdit(project)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    disabled={isLoading}
                    onClick={() => deleteMutation.mutate(project.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}

          {isAdding && (
            <ProjectFormRow
              form={form}
              onChange={setForm}
              onSave={handleSave}
              onCancel={resetForm}
              isLoading={isLoading}
            />
          )}
        </div>

        {!isAdding && !editingId && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 gap-1.5"
            onClick={startAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar proyecto
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProjectFormRow({
  form,
  onChange,
  onSave,
  onCancel,
  isLoading,
}: {
  form: ProjectForm
  onChange: (form: ProjectForm) => void
  onSave: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <div className="rounded-lg border-2 border-primary/30 p-3 space-y-3 bg-muted/20">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Nombre (slug)</Label>
          <Input
            value={form.name}
            onChange={e => onChange({ ...form, name: e.target.value })}
            placeholder="mi-proyecto"
            className="h-8 text-xs"
            autoFocus
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Etiqueta</Label>
          <Input
            value={form.label}
            onChange={e => onChange({ ...form, label: e.target.value })}
            placeholder="Mi Proyecto"
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Color</Label>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_COLORS.map(colorKey => {
            const palette = COLOR_PALETTE[colorKey]
            return (
              <button
                key={colorKey}
                type="button"
                onClick={() => onChange({ ...form, color: colorKey })}
                className={cn(
                  'w-6 h-6 rounded-full transition-all',
                  palette.dot,
                  form.color === colorKey
                    ? 'ring-2 ring-offset-2 ring-primary scale-110'
                    : 'opacity-50 hover:opacity-80',
                )}
              />
            )
          })}
        </div>
      </div>

      <div className="flex justify-end gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs gap-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-3 w-3" />
          Cancelar
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={onSave}
          disabled={isLoading || !form.name.trim() || !form.label.trim()}
        >
          <Check className="h-3 w-3" />
          Guardar
        </Button>
      </div>
    </div>
  )
}
