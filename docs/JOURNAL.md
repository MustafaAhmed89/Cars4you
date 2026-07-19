# Build Journal — Cars4you

Chronological log of what was built and why, so the project can be restructured
later with full context. Append newest entries at the bottom.

---

## 2026-07-19 — Phase 0: project initialization

**Environment set up**
- Tooling present: Node 25, npm 11, git 2.52. Installed pnpm 11.15.0.
- **Heavy installs relocated to `D:`** (dev machine has limited C:): npm cache →
  `D:\dev-cache\npm-cache`; pnpm store → `D:\dev-cache\pnpm-store`; pnpm global →
  `D:\dev-cache\pnpm-global`. Set in global/user config (not committed) to keep
  the repo portable. pnpm store on `D:` hardlinks into `D:\CarsRide\node_modules`.
- Docker + gh CLI + Supabase CLI **not installed** on this machine (see Pending).

**Monorepo scaffold**
- Turborepo + pnpm workspace: `apps/*`, `packages/*`. Root `package.json`,
  `turbo.json`, `tsconfig.base.json`, prettier, `.npmrc` (hoisted linker),
  `.env.example`, `.gitignore`, `README.md`, GitHub Actions CI (`ci.yml`).
- `packages/config`: shared ESLint (flat) + tsconfig presets. Added a Node-globals
  override so CJS tooling files (babel/metro configs) lint cleanly.

**Database (Supabase)**
- `supabase/config.toml` (local ports, `listing-photos` + `dealer-docs` buckets,
  phone-OTP test config).
- 7 migrations: extensions+enums+helpers → catalog → profiles+dealers (+ new-user
  trigger + seller view) → listings (+ lifecycle triggers, search_vector, indexes)
  → engagement (favorites/enquiries/chat/notifications/views/moderation) → RLS on
  every table → RPCs (`create_enquiry`, `log_listing_view`) + grants.
- `supabase/seed.sql`: India-first makes/models/variants + cities.
- Phone reveal + view counting implemented as SECURITY DEFINER RPCs (see ADR-0005).

**Shared packages**
- `@cars4you/types`: canonical enum arrays + labels, hand-authored `Database` type
  (regeneratable via `pnpm db:types`), convenience Row aliases.
- `@cars4you/validation`: Zod schemas (profile, listing, enquiry, filters, OTP).
- `@cars4you/api-client`: typed Supabase client factory (AsyncStorage-pluggable),
  auth helpers, and query/RPC functions for catalog, discovery, listings,
  favorites, enquiry.
- **Type gotcha resolved:** everything resolved to `never` until the
  `seller_public_profiles` view was given a `Relationships: []` field — postgrest-js
  requires it for the schema to satisfy `GenericSchema` (ADR-0007). Embedded-select
  results typed via explicit `.returns<T>()`.

**Mobile app (Expo)**
- `apps/mobile`: Expo SDK 52, Expo Router, monorepo-aware Metro config, dark theme
  tokens, auth context. Screens: home feed (`fetchListings`), phone-OTP sign-in,
  listing detail (enquiry → phone reveal + tap-to-call, view logging), sell form
  (`createListing`). Versions are point-in-time; run `npx expo install --fix` to
  reconcile if needed.

**Verification done**
- `pnpm typecheck` — 5/5 packages pass.
- `pnpm lint` — 4/4 (config has no lint task) pass.

**Source control**
- Initial Phase-0 commit (`4729c9e`, 64 files) pushed to
  `github.com/MustafaAhmed89/Cars4you` on `main`. Git Credential Manager had cached
  HTTPS auth, so no `gh` CLI was needed.

**Pending (needs the user / machine setup)**
- Install Docker Desktop → `pnpm db:start` to validate migrations + seed against a
  real DB, then `pnpm db:types` to regenerate types.
- Run the app on a simulator/device: `pnpm --filter mobile dev`.
