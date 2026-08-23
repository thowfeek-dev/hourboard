---
name: fullstack-prisma
description: Prisma ORM with Next.js App Router in one codebase — schema design, SQLite/Postgres, Server Actions, route handlers, and seed data. Use when adding a backend to a Next.js app, modeling relational data, writing migrations, or choosing Prisma vs client-only storage.
---

# Fullstack Prisma (Next.js)

Use Prisma when the product needs a real backend in the **same** Next.js repo. Prefer a relational schema over nested JSON blobs or IndexedDB-only storage.

## Defaults

- One Next.js app = API + UI. No separate backend service unless scale requires it.
- SQLite for local/zero-config (`file:./dev.db`). Same schema works on Postgres via `DATABASE_URL`.
- Mutations: Server Actions. File downloads / uploads: Route Handlers.
- Singleton `PrismaClient` in `src/lib/db.ts`. Never instantiate per request.
- Validate inputs with Zod at the action/route boundary. Never trust the client.

## Schema rules

- Model real entities (`Task`, `DailyLog`, `Project`) — do not store `AppData` as one JSON column.
- Date keys as `YYYY-MM-DD` strings when the product navigates by calendar day.
- Use `@unique([date, slotNumber])` for slot-based daily planners.
- Junction tables for many-to-many (`TaskTag`).
- Computed stats stay in TypeScript (`lib/stats.ts`), not denormalized columns, unless a query is proven hot.

## File layout

```
prisma/schema.prisma
prisma/seed.ts
src/lib/db.ts              # Prisma singleton
src/lib/validators/        # Zod
src/server/actions/        # Server Actions
src/app/api/*/route.ts     # import/export, binary
```

## Workflow

1. Edit `schema.prisma`
2. `npx prisma db push` (dev) or `npx prisma migrate dev` (shared/prod)
3. `npx prisma generate`
4. Seed with `npx prisma db seed`
5. Keep `prisma generate` in `postinstall`

## Avoid

- Client components importing `@prisma/client`
- Returning raw Prisma errors to the UI
- Mixing IndexedDB as source of truth when Prisma exists (Prisma wins)
---
