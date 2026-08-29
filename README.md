# Hourboard

Private 8-hour work log. Next.js App Router, Clerk, and Prisma. Each signed-in user has their own board.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Clerk authentication
- Prisma 6 + Postgres
- Server Actions + Route Handlers
- Zustand, TanStack Query, Zod, Motion, Recharts

## Setup

```bash
npm install
npx prisma db push
npm run dev
```

Copy `.env.example` to `.env` and `.env.local`. Set `DATABASE_URL` to Postgres and add Clerk keys (`npx clerk@latest init` can write the Clerk keys). Open [http://localhost:3000](http://localhost:3000), create an account, and you get an empty private board.

Signed-out visitors see the marketing landing page. After sign-in, `/` is the dashboard.

## Deploy

Public repo: [github.com/thowfeek-dev/hourboard](https://github.com/thowfeek-dev/hourboard)

Import it on Vercel as **hourboard**:

[https://vercel.com/new/clone?repository-url=https://github.com/thowfeek-dev/hourboard&project-name=hourboard](https://vercel.com/new/clone?repository-url=https://github.com/thowfeek-dev/hourboard&project-name=hourboard)

Then add:

- `DATABASE_URL` — Neon **pooled** URL (`…-pooler.…neon.tech`). Do not include `channel_binding=require` (Prisma rejects it). Optional: `DIRECT_URL` with the non-pooler hostname.
- Clerk keys. For `*.vercel.app`, add `https://hourboard.vercel.app` in Clerk → allowed origins / redirect URLs. Prefer a **production** Clerk instance (`pk_live_`) on the live domain.
- `NEXT_PUBLIC_APP_URL` — `https://hourboard.vercel.app`

Vercel builds run `prisma db push` so tables are created automatically. After changing env vars, redeploy.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm test` — Vitest (stats)
- `npm run db:studio` — Prisma Studio
