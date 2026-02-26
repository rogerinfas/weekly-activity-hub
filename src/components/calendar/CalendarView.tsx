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
} from 'date-fns'
import { es } from 'date-fns/locale'
import { Task, CATEGORY_DOT_COLORS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarViewProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
}

export function CalendarView({ tasks, onEditTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  const tasksWithDate = tasks.filter(t => t.date)

  const getTasksForDay = (day: Date) =>
    tasksWithDate.filter(t => isSameDay(new Date(t.date! + 'T00:00:00'), day))

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : []

  const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="flex gap-5 flex-col lg:flex-row">
      {/* Calendar grid */}
      <div className="flex-1 bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate(d => subMonths(d, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentDate(d => addMonths(d, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border/60">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-[11px] font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayTasks = getTasksForDay(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
            const isTodayDate = isToday(day)

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={cn(
                  'relative min-h-[72px] p-1.5 text-left transition-colors',
                  'border-b border-r border-border/40 last:border-r-0',
                  'hover:bg-accent/50',
                  !isCurrentMonth && 'opacity-35',
                  isSelected && 'bg-primary/8 ring-1 ring-inset ring-primary/30',
                )}
              >
                {/* Day number */}
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    isTodayDate && 'bg-primary text-primary-foreground',
                    !isTodayDate && 'text-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>

                {/* Task dots */}
                <div className="mt-1 flex flex-col gap-0.5">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-center gap-1 rounded px-1 py-0.5',
                        'bg-muted/60 hover:bg-muted transition-colors',
                      )}
                      onClick={e => { e.stopPropagation(); onEditTask(task) }}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', CATEGORY_DOT_COLORS[task.category])} />
                      <span className="text-[10px] text-foreground/70 truncate leading-tight">
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] text-muted-foreground px-1">
                      +{dayTasks.length - 3} más
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Side panel: tasks without date + selected day */}
      <div className="w-full lg:w-72 flex flex-col gap-4">
        {/* Selected day detail */}
        {selectedDay && (
          <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {format(selectedDay, "d 'de' MMMM", { locale: es })}
            </h3>
            {selectedDayTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin tareas asignadas</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedDayTasks.map(task => (
                  <TaskSideItem key={task.id} task={task} onEdit={onEditTask} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Unscheduled tasks */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm p-4 flex-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Sin fecha asignada
          </h3>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto scrollbar-thin">
            {tasks.filter(t => !t.date).length === 0 ? (
              <p className="text-xs text-muted-foreground">Todas las tareas tienen fecha</p>
            ) : (
              tasks
                .filter(t => !t.date)
                .map(task => (
                  <TaskSideItem key={task.id} task={task} onEdit={onEditTask} />
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskSideItem({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  return (
    <button
      onClick={() => onEdit(task)}
      className={cn(
        'flex items-start gap-2 w-full text-left rounded-lg p-2.5',
        'bg-muted/40 hover:bg-muted/70 transition-colors group',
      )}
    >
      <span className={cn('w-2 h-2 rounded-full mt-1 shrink-0', CATEGORY_DOT_COLORS[task.category])} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{task.title}</p>
        <p className="text-[10px] text-muted-foreground capitalize">{task.category} · {task.priority}</p>
      </div>
    </button>
  )
}
