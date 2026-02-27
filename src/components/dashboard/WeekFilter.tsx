'use client'

import * as React from 'react'
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    isSameDay,
    startOfMonth,
    subMonths,
} from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import {
    type WeekRange,
    formatWeekRange,
    getWeekNumber,
    getWeekRange,
    getWeekStart,
    isSameWeek,
} from '@/lib/date-utils'

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

interface WeekFilterProps {
    title?: string
    value?: WeekRange
    onChange: (range: WeekRange | undefined) => void
    disabled?: boolean
    className?: string
    yearsRange?: number
}

export function WeekFilter({
    title = 'Semana',
    value,
    onChange,
    disabled,
    className,
    yearsRange = 5,
}: WeekFilterProps) {
    const now = new Date()

    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
    const [currentMonth, setCurrentMonth] = React.useState<Date>(
        value?.startDate ? startOfMonth(value.startDate) : startOfMonth(now)
    )
    const [hoveredWeek, setHoveredWeek] = React.useState<Date | null>(null)

    React.useEffect(() => {
        if (value?.startDate) {
            setCurrentMonth(startOfMonth(value.startDate))
        }
    }, [value?.startDate])

    const hasValue = Boolean(value?.startDate && value?.endDate)

    const handleClose = () => setIsPopoverOpen(false)
    const handleTogglePopover = () => setIsPopoverOpen((prev) => !prev)

    const years = React.useMemo(() => {
        const currentYear = now.getFullYear()
        return Array.from(
            { length: yearsRange * 2 + 1 },
            (_, i) => currentYear - yearsRange + i
        )
    }, [yearsRange, now])

    const { weeks } = React.useMemo(() => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)
        const calendarStart = getWeekStart(monthStart)
        const lastWeekStart = getWeekStart(monthEnd)
        const calendarEnd = getWeekRange(lastWeekStart).endDate

        const allDays = eachDayOfInterval({
            start: calendarStart,
            end: calendarEnd,
        })

        const groupedWeeks: Date[][] = []
        for (let i = 0; i < allDays.length; i += 7) {
            groupedWeeks.push(allDays.slice(i, i + 7))
        }

        return { weeks: groupedWeeks }
    }, [currentMonth])

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

    const handleWeekSelect = (weekStart: Date) => {
        const range = getWeekRange(weekStart)
        onChange(range)
        setIsPopoverOpen(false)
    }

    const handleGoToCurrentWeek = () => {
        const range = getWeekRange(now)
        onChange(range)
        setCurrentMonth(startOfMonth(now))
        setIsPopoverOpen(false)
    }

    const handleClear = (e?: React.MouseEvent) => {
        e?.stopPropagation()
        onChange(undefined)
        setCurrentMonth(startOfMonth(now))
        handleClose()
    }

    const isWeekSelected = (day: Date) => value?.startDate ? isSameWeek(day, value.startDate) : false
    const isWeekHovered = (day: Date) => hoveredWeek ? isSameWeek(day, hoveredWeek) : false
    const isCurrentWeek = (day: Date) => isSameWeek(day, now)
    const isTodayDate = (day: Date) => isSameDay(day, now)
    const isCurrentMonth = (day: Date) => day.getMonth() === currentMonth.getMonth()

    const displayText = React.useMemo(() => {
        if (!value?.startDate || !value?.endDate) return null
        const weekNum = getWeekNumber(value.startDate)
        return `S${weekNum} · ${formatWeekRange(value.startDate, value.endDate)}`
    }, [value])

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={disabled}
                    variant="outline"
                    size="sm"
                    className={cn(
                        'h-9 border-dashed rounded-lg px-3 transition-colors text-xs hover:bg-muted font-medium bg-background',
                        hasValue && 'bg-primary/5 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary',
                        className
                    )}
                    onClick={handleTogglePopover}
                    suppressHydrationWarning
                >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {title}
                    {hasValue && displayText && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge variant="secondary" className="rounded-sm px-1.5 py-0 font-normal lg:hidden h-5 bg-background border border-border/40">
                                S{getWeekNumber(value!.startDate)}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex items-center">
                                <Badge variant="secondary" className="rounded-sm px-1.5 py-0 font-normal h-5 bg-background border border-border/40 hover:bg-background">
                                    {displayText}
                                </Badge>
                            </div>
                        </>
                    )}
                    {hasValue && (
                        <span
                            role="button"
                            aria-label="Limpiar filtro"
                            className="ml-2 inline-flex cursor-pointer items-center justify-center rounded-sm p-0.5 hover:bg-primary/20 transition-colors"
                            onClick={handleClear}
                        >
                            <X className="h-3 w-3" />
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            {isPopoverOpen && (
                <PopoverContent
                    className="w-auto p-0 rounded-xl shadow-lg border-border/60"
                    align="end"
                    side="bottom"
                    avoidCollisions
                    onInteractOutside={handleClose}
                    onEscapeKeyDown={handleClose}
                >
                    <div className="p-3">
                        {/* Header / Month-Year Selectors */}
                        <div className="mb-3 flex items-center justify-between gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={handlePrevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1">
                                <Select
                                    value={currentMonth.getMonth().toString()}
                                    onValueChange={(val) => {
                                        const newDate = new Date(currentMonth)
                                        newDate.setMonth(Number.parseInt(val, 10))
                                        setCurrentMonth(newDate)
                                    }}
                                >
                                    <SelectTrigger className="h-7 border-none bg-transparent text-sm font-semibold shadow-none focus:ring-0 w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map((month, idx) => (
                                            <SelectItem key={month} value={idx.toString()}>{month}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={currentMonth.getFullYear().toString()}
                                    onValueChange={(val) => {
                                        const newDate = new Date(currentMonth)
                                        newDate.setFullYear(Number.parseInt(val, 10))
                                        setCurrentMonth(newDate)
                                    }}
                                >
                                    <SelectTrigger className="h-7 border-none bg-transparent text-sm font-semibold shadow-none focus:ring-0 w-[80px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={handleNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Days Header */}
                        <div className="mb-1 grid grid-cols-8 gap-0">
                            <div className="p-1.5 text-center text-[10px] font-bold uppercase text-muted-foreground/60 w-8">Sx</div>
                            {WEEK_DAYS.map((day) => (
                                <div key={day} className="p-1.5 text-center text-[10px] font-bold uppercase text-muted-foreground/60 w-8">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="space-y-0.5">
                            {weeks.map((week, weekIdx) => {
                                const weekStart = getWeekStart(week[0])
                                const weekNum = getWeekNumber(weekStart)
                                const selected = isWeekSelected(week[0])
                                const hovered = isWeekHovered(week[0])
                                const current = isCurrentWeek(week[0])

                                return (
                                    <div
                                        key={weekIdx}
                                        role="button"
                                        tabIndex={0}
                                        className={cn(
                                            'grid cursor-pointer grid-cols-8 gap-0 rounded-md transition-colors items-center',
                                            selected && 'bg-primary/10',
                                            !selected && hovered && 'bg-muted/60',
                                            !selected && !hovered && current && 'ring-1 ring-inset ring-primary/40'
                                        )}
                                        onClick={() => handleWeekSelect(weekStart)}
                                        onMouseEnter={() => setHoveredWeek(weekStart)}
                                        onMouseLeave={() => setHoveredWeek(null)}
                                    >
                                        <div
                                            className={cn(
                                                'rounded-l-md p-1.5 text-center text-[10px] font-bold w-8',
                                                selected ? 'text-primary' : 'text-muted-foreground/60'
                                            )}
                                        >
                                            {weekNum}
                                        </div>
                                        {week.map((day, dayIdx) => (
                                            <div
                                                key={dayIdx}
                                                className={cn(
                                                    'p-1.5 flex items-center justify-center text-[12px] tabular-nums w-8 h-8 rounded-full transition-colors',
                                                    !isCurrentMonth(day) && !selected && 'text-muted-foreground/40',
                                                    isTodayDate(day) && !selected && 'bg-accent font-bold',
                                                    isTodayDate(day) && selected && 'bg-primary text-primary-foreground font-bold shadow-sm',
                                                    !isTodayDate(day) && selected && 'text-primary'
                                                )}
                                            >
                                                {day.getDate()}
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Footer */}
                        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground/60">Filtro</span>
                            <div className="flex gap-1.5">
                                {hasValue && (
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] rounded transition-colors" onClick={handleClear}>
                                        Limpiar
                                    </Button>
                                )}
                                <Button variant="secondary" size="sm" className="h-6 px-2 text-[11px] rounded transition-colors" onClick={handleGoToCurrentWeek}>
                                    Semana actual
                                </Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            )}
        </Popover>
    )
}
