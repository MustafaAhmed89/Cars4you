# Cars4you (CarsRide)

A used-car marketplace — individuals list their cars for sale; buyers and dealers discover and contact them. Mobile-first (iOS + Android), with a web app and SEO marketing site to follow. Dealers are a **verified role on the same platform**, not a separate product.

> Status: **Phase 0 — initialization.** See `docs/JOURNAL.md` for the running build log and `docs/DECISIONS.md` for architecture decisions.

## Tech stack

| Layer | Choice |
|---|---|
| Mobile (iOS/Android) | React Native + Expo (TypeScript) |
| Web app + marketing site | Next.js (later phase) |
| Backend / data | Supabase — Postgres, Auth, Storage, Realtime, Edge Functions, RLS |
| Monorepo | Turborepo + pnpm |
| Source control | GitHub `MustafaAhmed89/Cars4you` |

## Repository layout

```
apps/
  mobile/     Expo React Native app (Phase 1)
  web/        Next.js web app (Phase 3)
  site/       Next.js marketing + SEO site (Phase 3)
  admin/      Next.js moderation console (Phase 2)
packages/
  types/      Shared TS types (generated from DB)
  validation/ Zod schemas
  api-client/ Typed Supabase client + data helpers
  ui/         Shared primitives / design tokens
  config/     ESLint + tsconfig presets
supabase/
  migrations/ SQL schema + RLS policies
  functions/  Edge functions
  seed/       Reference data
docs/         PRD, epics, ERD, decisions, journal
```

## Getting started

Prerequisites: Node ≥ 20, pnpm, Docker (for local Supabase), and the Supabase CLI (`npx supabase`).

```bash
pnpm install               # install workspace deps
pnpm db:start              # start local Supabase (Docker); prints local URL + anon key
pnpm db:types              # regenerate packages/types/src/database.types.ts from the local DB
pnpm --filter mobile dev   # run the Expo app
```

Copy `.env.example` → `.env` and fill in the Supabase URL + anon key printed by `pnpm db:start`.

## Common commands

| Command | What it does |
|---|---|
| `pnpm dev` | Run all apps in dev (Turbo) |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Repo-wide checks |
| `pnpm --filter <pkg> <script>` | Run a script in one workspace |
| `pnpm db:start` / `pnpm db:reset` | Local Supabase up / reset+reseed |
| `pnpm db:types` | Regenerate DB types after a migration |
