# Weekly Activity Hub

Visual weekly task planner with **Kanban**, **Calendar** and **Metrics** views. Built with Next.js, React 19 and Tailwind CSS 4.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| Drag & Drop | dnd-kit |
| Charts | Recharts |
| Data fetching | TanStack React Query v5 + axios |
| Language | TypeScript 5 |

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- The [weekly-activity-hub-api](https://github.com/rogerinfas/weekly-activity-hub-api) running on port **7000**

## Environment variables

Create a `.env.local` file at the project root:

```env
# URL of the backend API — defaults to http://localhost:7000
NEXT_PUBLIC_API_URL=http://localhost:7000
```

## Setup

```bash
# Install dependencies
pnpm install
```

## Running the app

```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start
```

Open **http://localhost:3000** in your browser.

## Features

### Kanban board

- Three columns: **Pendiente** (`backlog`), **En Progreso** (`en-progreso`), **Completado** (`completado`).
- Drag cards between columns and reorder within a column — position is persisted to the server.
- Inline editing: click the pencil icon or the `+` button in a column header to create or edit a task.
- Auto-saves on click-outside or pressing **Enter**.

### Calendar view

- Monthly calendar showing tasks on their scheduled date.
- Click a task to jump directly to its Kanban card in edit mode.

### Metrics dashboard

- **Weekly progress chart** — daily completion rate for the current week.
- **Category pie chart** — task distribution by project.
- **Monthly history chart** — completed vs. created tasks per month.
- **Week filter** — navigate to any past/future week.

### Dark mode

- Toggles via the moon/sun button in the header.
- Preference is saved to `localStorage` (`wah-dark`) and respects the OS default on first visit.

## Project structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx          # Fonts, metadata, Providers wrapper
│   ├── page.tsx            # Root page — React Query hooks, tab routing
│   └── providers.tsx       # QueryClientProvider
├── components/
│   ├── calendar/
│   │   └── CalendarView.tsx
│   ├── dashboard/
│   │   ├── CategoryPieChart.tsx
│   │   ├── MetricsDashboard.tsx
│   │   ├── MonthlyHistoryChart.tsx
│   │   ├── WeekFilter.tsx
│   │   └── WeeklyProgressChart.tsx
│   ├── kanban/
│   │   ├── AddTaskModal.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanCard.tsx
│   │   └── KanbanColumn.tsx
│   └── ui/                 # shadcn/ui primitives
└── lib/
    ├── api/
    │   ├── client.config.ts  # axios instance
    │   └── tasks.ts          # CRUD helpers
    ├── date-utils.ts
    ├── types.ts              # Task, Status, Project types + constants
    └── utils.ts
```

## Running together with the API

```bash
# Terminal 1 — API (port 7000)
cd ../weekly-activity-hub-api
pnpm start:dev

# Terminal 2 — Frontend (port 3000)
pnpm dev
```
