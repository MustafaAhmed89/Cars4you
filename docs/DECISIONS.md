# Architecture Decision Records — Cars4you

ADR format: Context → Decision → Alternatives → Consequences. Newest first.
These are deliberately reversible records so the project can be restructured later
without losing rationale.

---

## ADR-0001 — Cross-platform mobile via React Native + Expo
- **Context:** Ship one app to iOS + Android now, web later, with a small team.
- **Decision:** React Native + Expo (TypeScript), Expo Router, EAS builds.
- **Alternatives:** Flutter (no code-sharing with the JS web/site, weak web SEO);
  native Kotlin+Swift (2× the work).
- **Consequences:** Shared TS logic with web layers; native modules go through
  Expo config plugins/EAS. New Architecture enabled.

## ADR-0002 — Next.js for web app + marketing/SEO site
- **Context:** Marketplaces win organic traffic via search-indexed listing pages.
- **Decision:** Next.js (SSR/SSG) for `apps/web` and `apps/site` (Phase 3).
- **Alternatives:** Flutter Web / RN-web (poor SEO for public listing pages).
- **Consequences:** React skills + shared packages reused; separate UI layer from
  the RN app (shared logic, not shared components — see ADR-0006).

## ADR-0003 — Supabase as the backend platform
- **Context:** Need Auth (phone OTP), relational data for faceted search, file
  storage, realtime chat, and RLS — fast, without heavy ops.
- **Decision:** Supabase (managed Postgres + Auth + Storage + Realtime + Edge
  Functions + RLS).
- **Alternatives:** Firebase (NoSQL — weak multi-facet filtering); custom
  NestJS+Postgres (most control, most ops — deferred as the "graduate to" path).
- **Consequences:** Own the data (plain Postgres, no lock-in). Search starts as
  Postgres FTS + `pg_trgm`; move to Meilisearch/Typesense when the catalog grows.

## ADR-0004 — Turborepo + pnpm monorepo
- **Context:** Multiple apps sharing types/validation/data-access.
- **Decision:** Single monorepo (`apps/*`, `packages/*`) on GitHub
  `MustafaAhmed89/Cars4you`; pnpm workspaces + Turbo pipelines.
- **Consequences:** `pnpm install` heavy caches relocated to `D:` (store + npm
  cache) on the dev machine; CI pins pnpm 11.15.0.

## ADR-0005 — Phone reveal & view counting as SECURITY DEFINER RPCs
- **Context:** Seller phone is PII; RLS is row-level, not column-level.
- **Decision:** Expose seller phone only via the `create_enquiry` RPC (records
  lead + notifies seller); mutate `view_count` only via `log_listing_view`. Public
  seller display via the `seller_public_profiles` view.
- **Alternatives:** Column-level grants (fragile); edge function (extra hop for a
  pure data op).
- **Consequences:** Contact rules are transactional and server-enforced.

## ADR-0006 — Share logic, not UI (revisit Tamagui/Solito in Phase 3)
- **Context:** Maximal cross-platform UI sharing is powerful but adds complexity.
- **Decision:** v1 shares non-UI packages (`types`, `validation`, `api-client`);
  UI is built per platform.
- **Consequences:** Simpler now; if UI duplication hurts in Phase 3, adopt
  Tamagui + Solito then.

## ADR-0007 — Hand-authored DB types as a stopgap
- **Context:** No local Docker/Supabase on the dev machine yet, so
  `supabase gen types` can't run.
- **Decision:** Hand-author `packages/types/src/database.types.ts` (must satisfy
  postgrest-js `GenericSchema` — every table/view needs a `Relationships` field).
  Embedded-select results are typed via explicit `.returns<T>()` / casts.
- **Consequences:** Regenerate with `pnpm db:types` once Docker + Supabase CLI are
  available; then embedded selects can be inferred and the explicit types removed.
