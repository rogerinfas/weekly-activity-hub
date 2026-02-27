'use client'

import { useMemo, useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { Task, ApiProject, getProjectBadge, getProjectDot, getProjectLabel, COLUMNS } from '@/lib/types'
import { parseTaskDate } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, CheckCircle2, Circle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type CalendarMode = 'month' | 'week'

interface CalendarViewProps {
  tasks: Task[]
  projects: ApiProject[]
  onEditTask: (task: Task) => void
}

export function CalendarView({ tasks, projects, onEditTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [mode, setMode] = useState<CalendarMode>('month')

  // Effective date: use `date` (manual) if set, otherwise fall back to `createdAt`
  const getEffectiveDate = (t: Task): string | undefined => t.date ?? t.createdAt

  const tasksWithDate = tasks.filter(t => getEffectiveDate(t))

  const getTasksForDay = (day: Date) =>
    tasksWithDate.filter(t => {
      const d = getEffectiveDate(t)
      return d ? isSameDay(parseTaskDate(d), day) : false
    })

  // ---- Navigation label ----
  const navLabel = useMemo(() => {
    if (mode === 'month') return format(currentDate, 'MMMM yyyy', { locale: es })
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    if (isSameMonth(weekStart, weekEnd)) {
      return `${format(weekStart, 'd')} – ${format(weekEnd, 'd')} de ${format(weekStart, 'MMMM yyyy', { locale: es })}`
    }
    return `${format(weekStart, 'd MMM', { locale: es })} – ${format(weekEnd, 'd MMM yyyy', { locale: es })}`
  }, [currentDate, mode])

  function goBack() {
    if (mode === 'month') setCurrentDate(d => subMonths(d, 1))
    else setCurrentDate(d => subWeeks(d, 1))
  }
  function goForward() {
    if (mode === 'month') setCurrentDate(d => addMonths(d, 1))
    else setCurrentDate(d => addWeeks(d, 1))
  }
  function goToday() {
    setCurrentDate(new Date())
    setSelectedDay(null)
  }

  // ---- Month days ----
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  // ---- Week days ----
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : []
  const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  // Shared nav header
  const navHeader = (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-semibold capitalize min-w-[180px] text-center">{navLabel}</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goForward}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={goToday}>
          Hoy
        </Button>
        {/* Mode toggle */}
        <div className="flex items-center bg-muted/60 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setMode('month')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
              mode === 'month'
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Mes
          </button>
          <button
            onClick={() => setMode('week')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
              mode === 'week'
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Semana
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex gap-5 flex-col lg:flex-row">
      {/* Main calendar area */}
      <div className="flex-1 bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        {navHeader}

        {mode === 'month' ? (
          <MonthGrid
            days={monthDays}
            currentDate={currentDate}
            selectedDay={selectedDay}
            onSelectDay={day => setSelectedDay(prev => (prev && isSameDay(prev, day) ? null : day))}
            getTasksForDay={getTasksForDay}
            onEditTask={onEditTask}
            projects={projects}
            WEEKDAYS={WEEKDAYS}
          />
        ) : (
          <WeekGrid
            days={weekDays}
            selectedDay={selectedDay}
            onSelectDay={day => setSelectedDay(prev => (prev && isSameDay(prev, day) ? null : day))}
            getTasksForDay={getTasksForDay}
            onEditTask={onEditTask}
            projects={projects}
            WEEKDAYS={WEEKDAYS}
          />
        )}
      </div>

      {/* Side panel */}
      <div className="w-full lg:w-72 flex flex-col gap-4">
        {/* Selected day detail */}
        {selectedDay && (
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
            </h3>
            {selectedDayTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin tareas asignadas</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedDayTasks.map(task => (
                  <TaskSideItem key={task.id} task={task} projects={projects} onEdit={onEditTask} />
                ))}
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  )
}

// ---- Month Grid ----

interface MonthGridProps {
  days: Date[]
  currentDate: Date
  selectedDay: Date | null
  onSelectDay: (day: Date) => void
  getTasksForDay: (day: Date) => Task[]
  onEditTask: (task: Task) => void
  projects: ApiProject[]
  WEEKDAYS: string[]
}

function MonthGrid({ days, currentDate, selectedDay, onSelectDay, getTasksForDay, onEditTask, projects, WEEKDAYS }: MonthGridProps) {
  return (
    <>
      <div className="grid grid-cols-7 border-b border-border/60">
        {WEEKDAYS.map(d => (
          <div key={d} className="py-2 text-center text-[11px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayTasks = getTasksForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
          const isTodayDate = isToday(day)

          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDay(day)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelectDay(day)}
              className={cn(
                'relative min-h-[80px] p-1.5 text-left transition-colors cursor-pointer',
                'border-b border-r border-border/40',
                'hover:bg-accent/50',
                !isCurrentMonth && 'opacity-35',
                isSelected && 'bg-primary/8 ring-1 ring-inset ring-primary/30',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  isTodayDate && 'bg-primary text-primary-foreground',
                  !isTodayDate && 'text-foreground',
                )}
              >
                {format(day, 'd')}
              </span>

              <div className="mt-1 flex flex-col gap-0.5">
                {dayTasks.slice(0, 3).map(task => (
                  <TaskChip key={task.id} task={task} projects={projects} onEdit={onEditTask} compact />
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[9px] text-muted-foreground px-1">
                    +{dayTasks.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ---- Week Grid ----

interface WeekGridProps {
  days: Date[]
  selectedDay: Date | null
  onSelectDay: (day: Date) => void
  getTasksForDay: (day: Date) => Task[]
  onEditTask: (task: Task) => void
  projects: ApiProject[]
  WEEKDAYS: string[]
}

function WeekGrid({ days, selectedDay, onSelectDay, getTasksForDay, onEditTask, projects, WEEKDAYS }: WeekGridProps) {
  return (
    <>
      {/* Headers */}
      <div className="grid grid-cols-7 border-b border-border/60">
        {days.map((day, i) => {
          const isTodayDate = isToday(day)
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
          return (
            <button
              key={i}
              onClick={() => onSelectDay(day)}
              className={cn(
                'flex flex-col items-center py-3 gap-1 transition-colors hover:bg-accent/40',
                isSelected && 'bg-primary/8',
              )}
            >
              <span className="text-[11px] font-medium text-muted-foreground">{WEEKDAYS[i]}</span>
              <span
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                  isTodayDate && 'bg-primary text-primary-foreground',
                  !isTodayDate && isSelected && 'ring-2 ring-primary/50 text-primary',
                  !isTodayDate && !isSelected && 'text-foreground',
                )}
              >
                {format(day, 'd')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Task columns */}
      <div className="grid grid-cols-7 divide-x divide-border/40 min-h-[400px]">
        {days.map((day, i) => {
          const dayTasks = getTasksForDay(day)
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
          const isTodayDate = isToday(day)
          return (
            <div
              key={i}
              className={cn(
                'p-2 flex flex-col gap-1.5 transition-colors',
                isTodayDate && 'bg-primary/3',
                isSelected && 'bg-primary/6',
              )}
            >
              {dayTasks.length === 0 && (
                <span className="text-[10px] text-muted-foreground/40 text-center mt-4">—</span>
              )}
              {dayTasks.map(task => (
                <TaskChip key={task.id} task={task} projects={projects} onEdit={onEditTask} />
              ))}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ---- Task chip (used in both views) ----

function TaskChip({
  task,
  projects,
  onEdit,
  compact = false,
}: {
  task: Task
  projects: ApiProject[]
  onEdit: (t: Task) => void
  compact?: boolean
}) {
  const statusIcon =
    task.status === 'completado' ? (
      <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-emerald-500" />
    ) : task.status === 'en-progreso' ? (
      <Clock className="h-2.5 w-2.5 shrink-0 text-amber-500" />
    ) : (
      <Circle className="h-2.5 w-2.5 shrink-0 text-slate-400" />
    )

  return (
    <button
      onClick={e => { e.stopPropagation(); onEdit(task) }}
      className={cn(
        'flex items-center gap-1 w-full text-left rounded px-1 py-0.5 transition-colors',
        'bg-muted/60 hover:bg-muted',
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', getProjectDot(projects, task.project))} />
      <span className={cn(
        'text-foreground/80 truncate leading-tight flex-1',
        compact ? 'text-[10px]' : 'text-[11px]',
      )}>
        {task.title}
      </span>
      {!compact && statusIcon}
    </button>
  )
}

// ---- Side panel task item ----

function TaskSideItem({ task, projects, onEdit }: { task: Task; projects: ApiProject[]; onEdit: (t: Task) => void }) {
  const statusLabel = COLUMNS.find(c => c.id === task.status)?.title ?? task.status
  // Show a hint when the position comes from createdAt rather than an explicit date
  const isCreatedAtBased = !task.date && !!task.createdAt

  return (
    <button
      onClick={() => onEdit(task)}
      className={cn(
        'flex items-start gap-2.5 w-full text-left rounded-xl p-2.5',
        'bg-muted/40 hover:bg-muted/70 transition-colors group border border-transparent hover:border-border/60',
      )}
    >
      <span className={cn('w-2 h-2 rounded-full mt-1 shrink-0', getProjectDot(projects, task.project))} />
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-xs font-medium text-foreground truncate',
          task.status === 'completado' && 'line-through text-muted-foreground',
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <Badge
            variant="outline"
            className={cn('text-[9px] font-medium px-1 py-0 h-4 capitalize border-0', getProjectBadge(projects, task.project))}
          >
            {getProjectLabel(projects, task.project)}
          </Badge>
          <span className="text-[9px] text-muted-foreground">{statusLabel}</span>
          {isCreatedAtBased && (
            <span className="text-[9px] text-muted-foreground/50 italic">Creación</span>
          )}
        </div>
      </div>
    </button>
  )
}
