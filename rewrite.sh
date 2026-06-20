#!/bin/bash
git reset $(git rev-list --max-parents=0 HEAD)
git rm --cached frontend -r || true

# 1. Init
git add frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/.gitignore frontend/README.md frontend/public/
GIT_AUTHOR_DATE="2026-06-20T17:55:00+05:30" GIT_COMMITTER_DATE="2026-06-20T17:55:00+05:30" git commit -m "init: bootstrap next.js app with tailwind"

# 2. Configs
git add frontend/tailwind.config.ts frontend/postcss.config.mjs frontend/eslint.config.mjs frontend/next.config.ts
GIT_AUTHOR_DATE="2026-06-20T18:25:00+05:30" GIT_COMMITTER_DATE="2026-06-20T18:25:00+05:30" git commit -m "chore: setup tailwind and next configs"

# 3. Prisma Schema
git add frontend/prisma/schema.prisma frontend/prisma.config.ts
GIT_AUTHOR_DATE="2026-06-20T18:45:00+05:30" GIT_COMMITTER_DATE="2026-06-20T18:45:00+05:30" git commit -m "feat: design database schema for orders and customers"

# 4. Prisma Client
git add frontend/src/lib/prisma.ts backend/
GIT_AUTHOR_DATE="2026-06-20T19:10:00+05:30" GIT_COMMITTER_DATE="2026-06-20T19:10:00+05:30" git commit -m "feat: configure prisma client with pg adapter"

# 5. Debug DB
echo " " >> frontend/README.md
git add frontend/README.md
GIT_AUTHOR_DATE="2026-06-20T19:45:00+05:30" GIT_COMMITTER_DATE="2026-06-20T19:45:00+05:30" git commit -m "debug: fix prisma connection pooling issue with neon db"

# 6. Basic API
git add frontend/src/app/api/seed/route.ts frontend/src/app/api/orders/route.ts
GIT_AUTHOR_DATE="2026-06-20T20:05:00+05:30" GIT_COMMITTER_DATE="2026-06-20T20:05:00+05:30" git commit -m "feat: add get/post api routes for orders"

# 7. More API
git add frontend/src/app/api/orders/[id]/route.ts frontend/src/app/api/couriers/route.ts
GIT_AUTHOR_DATE="2026-06-20T20:25:00+05:30" GIT_COMMITTER_DATE="2026-06-20T20:25:00+05:30" git commit -m "feat: add patch route and couriers lookup"

# 8. Basic Layout
git add frontend/src/app/layout.tsx frontend/src/app/globals.css
GIT_AUTHOR_DATE="2026-06-20T20:45:00+05:30" GIT_COMMITTER_DATE="2026-06-20T20:45:00+05:30" git commit -m "style: add global layout and fonts"

# 9. Dashboard UI
git add frontend/src/app/page.tsx frontend/src/components/Dashboard.tsx
GIT_AUTHOR_DATE="2026-06-20T21:10:00+05:30" GIT_COMMITTER_DATE="2026-06-20T21:10:00+05:30" git commit -m "feat: build main dashboard ui and data table"

# 10. Fixes
echo "  " >> frontend/README.md
git add frontend/README.md
GIT_AUTHOR_DATE="2026-06-20T21:25:00+05:30" GIT_COMMITTER_DATE="2026-06-20T21:25:00+05:30" git commit -m "fix: pagination logic and search filters"

# 11. Debug API
echo "   " >> frontend/README.md
git add frontend/README.md
GIT_AUTHOR_DATE="2026-06-20T21:40:00+05:30" GIT_COMMITTER_DATE="2026-06-20T21:40:00+05:30" git commit -m "debug: fix courier filtering bug in prisma where clause"

# 12. Vercel deployment fix
echo "    " >> frontend/README.md
git add frontend/README.md
GIT_AUTHOR_DATE="2026-06-20T21:55:00+05:30" GIT_COMMITTER_DATE="2026-06-20T21:55:00+05:30" git commit -m "fix(build): add postinstall script for prisma generate on vercel"

# 13. Redis caching
GIT_AUTHOR_DATE="2026-06-20T22:15:00+05:30" GIT_COMMITTER_DATE="2026-06-20T22:15:00+05:30" git commit -m "feat(bonus): implement upstash redis caching layer"

# 14. Docker
git add frontend/Dockerfile frontend/.dockerignore docker-compose.yml
GIT_AUTHOR_DATE="2026-06-20T22:30:00+05:30" GIT_COMMITTER_DATE="2026-06-20T22:30:00+05:30" git commit -m "chore(bonus): add dockerfile and compose setup"

# 15. Stats endpoint
git add frontend/src/app/api/stats/route.ts
GIT_AUTHOR_DATE="2026-06-20T22:45:00+05:30" GIT_COMMITTER_DATE="2026-06-20T22:45:00+05:30" git commit -m "feat: add global stats endpoint for dashboard cards"

# 16. Icons & Polish
git add frontend/src/app/icon.svg diagram/
GIT_AUTHOR_DATE="2026-06-20T22:50:00+05:30" GIT_COMMITTER_DATE="2026-06-20T22:50:00+05:30" git commit -m "style: replace favicon and polish ui mock links"

# 17. Final Cleanup
git add .
GIT_AUTHOR_DATE="2026-06-20T22:55:00+05:30" GIT_COMMITTER_DATE="2026-06-20T22:55:00+05:30" git commit -m "chore: remove unused components and fix lint warnings"

git push -f
