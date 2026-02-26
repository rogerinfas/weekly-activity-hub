#!/usr/bin/env bash
# Ejecuta desde la raíz del proyecto: ./scripts/git-setup-and-push.sh
# Crea el repo, varios commits y sube a GitHub.
# Antes: crea un repo vacío "weekly-activity-hub" en github.com/tu-usuario

set -e
cd "$(dirname "$0")/.."

# Si ya existe .git, solo añadimos remote y hacemos push
if [ ! -d .git ]; then
  git init
  git branch -M main

  git add .gitignore eslint.config.mjs next.config.ts postcss.config.mjs tsconfig.json next-env.d.ts components.json
  git commit -m "chore: add project config and tooling"

  git add package.json pnpm-lock.yaml 2>/dev/null || git add package.json
  git commit -m "chore: add dependencies (weekly-activity-hub)"

  git add src/lib
  git commit -m "feat(lib): add types, mock data and utils"

  git add src/components/ui
  git commit -m "feat(ui): add shadcn components"

  git add src/components/kanban
  git commit -m "feat(kanban): add board with drag and drop"

  git add src/components/calendar
  git commit -m "feat(calendar): add calendar view"

  git add src/components/dashboard
  git commit -m "feat(dashboard): add metrics and charts"

  git add src/app public
  git commit -m "feat(app): add layout, page and global styles"

  git add README.md 2>/dev/null || true
  git add -A
  git status --short
  if [ -n "$(git status --short)" ]; then
    git commit -m "docs: add README and remaining files"
  fi
fi

echo ""
echo "Listo. Ahora añade tu remote y sube:"
echo "  git remote add origin https://github.com/TU_USUARIO/weekly-activity-hub.git"
echo "  git push -u origin main"
echo ""
echo "O si ya tienes el remote:"
echo "  git push -u origin main"
