# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Cars4you — a used-car marketplace (Cars24/CarDekho-style). Individuals list cars; buyers and **dealers** discover and contact them. Dealers are a **verified role on the same platform/schema**, not a separate app. Mobile-first (Expo iOS+Android); Next.js web app + SEO site come later.

Read `docs/DECISIONS.md` (ADRs — why the stack is what it is) and `docs/JOURNAL.md` (chronological build log) before making structural changes. `docs/EPICS.md` (E1–E8) is the scope map and marks what's scaffolded vs. Phase 1/2/3.

## Commands

All run from the repo root. `pnpm` is the package manager (v11.15.0, pinned).

```bash
pnpm install                       # install workspace deps
pnpm typecheck                     # tsc --noEmit across all packages (Turbo)
pnpm lint                          # eslint across all packages
pnpm test                          # run tests across all packages
pnpm --filter mobile dev           # run the Expo app
pnpm --filter <pkg> <script>       # scope any script to one workspace
```

Workspace names: `mobile`, `@cars4you/types`, `@cars4you/validation`, `@cars4you/api-client`, `@cars4you/config`.

Database (requires Docker Desktop — not yet installed on the dev machine):
```bash
pnpm db:start                      # local Supabase (applies migrations + seed.sql)
pnpm db:reset                      # reset + reseed
pnpm db:types                      # regenerate packages/types/src/database.types.ts from local DB
```

There are **no unit tests yet** — package `test` scripts are `echo` no-ops. When adding tests, wire the real runner into each package's `test` script; `pnpm test` (Turbo) picks it up automatically.

## Architecture

**Monorepo (Turborepo + pnpm).** `apps/*` = deployables (only `apps/mobile` exists; `web`/`site`/`admin` are planned). `packages/*` = shared code. The deliberate boundary (ADR-0006): **share non-UI logic, build UI per platform.** So business logic, types, and data access live in packages and are consumed by every app; UI is not shared.

**Data flow is one-directional through the packages:**
```
supabase/migrations (SQL schema + RLS)
   → packages/types        (enum arrays + Database type mirroring the schema)
   → packages/validation   (Zod schemas; import enum arrays from types)
   → packages/api-client   (typed Supabase client + all query/RPC/auth functions)
   → apps/mobile           (screens call api-client; never call Supabase table ops directly)
```
Screens/components must go through `@cars4you/api-client` — do not scatter `supabase.from(...)` calls into the UI. Add a new data operation as an exported function in `packages/api-client/src/queries.ts` (or `auth.ts`).

**Enums have one source of truth:** the `const` arrays in `packages/types/src/enums.ts`. Postgres enum types (migration `..._init_extensions_enums.sql`), Zod schemas, and TS unions all derive from these. Change one, change all three in lockstep.

### Supabase security model (important)
- **RLS is enabled on every table.** Listings are publicly readable only when `status = 'active'`; owners see their own; admins see all via the `is_admin()` SECURITY DEFINER helper.
- **Seller phone is PII and is never exposed by RLS** (RLS is row-level, not column-level). It is released only through the `create_enquiry` SECURITY DEFINER RPC, which also records the lead and notifies the seller. Public seller display uses the `seller_public_profiles` view (name/city/dealer-badge only, no phone).
- **`listings.view_count` mutates only via the `log_listing_view` RPC.** Don't update it directly.
- When adding a feature that needs privileged/cross-row logic, prefer a SECURITY DEFINER RPC (see migration `..._rpcs_grants.sql`) over loosening RLS.

### Migrations
Timestamp-prefixed SQL in `supabase/migrations/`, applied in filename order. They are layered by dependency: extensions/enums → catalog → profiles/dealers → listings → engagement → RLS → RPCs. A new table needs: the table DDL, `alter table ... enable row level security`, its policies, and (if PII/privileged) an RPC — then run `pnpm db:types`.

## Conventions & gotchas

- **`packages/types/src/database.types.ts` is hand-authored as a stopgap** (no local DB yet). It must satisfy postgrest-js `GenericSchema`: **every table AND view needs a `Relationships` field** — omitting it on the view once made the whole client resolve to `never`. Because hand-authored tables carry empty `Relationships: []`, embedded selects (`listing_photos(...)`, `cities(name)`) can't be inferred, so `api-client` types those results explicitly via `.returns<T>()` or a cast. Once `pnpm db:types` runs against a real DB, this file is regenerated and those explicit types can be dropped.
- **Metro is monorepo-aware** (`apps/mobile/metro.config.js`): it watches the workspace root and resolves from both node_modules. Workspace packages export raw `src/index.ts` (no build step) and Metro transpiles them. Keep package `main` pointing at `src/index.ts`.
- **`.npmrc` uses `node-linker=hoisted`** (required for Expo/Metro under pnpm). npm warns about the pnpm-only keys in it — harmless.
- **Dev-machine caches live on `D:`** (`D:\dev-cache\` for npm cache + pnpm store + pnpm global), set in global config, intentionally not committed so the repo stays portable.
- **ESLint flat config** is shared from `@cars4you/config/eslint/base`; each package has a one-line `eslint.config.mjs` re-exporting it. CJS tooling files (babel/metro configs) get Node globals via an override there.
- Prices are INR; format via `formatPrice`/`formatKm` in `apps/mobile/src/lib/theme.ts`.

## Git

Remote: `github.com/MustafaAhmed89/Cars4you`, default branch `main`.

When writing commit messages, NEVER auto-add your agent name as co-author.
