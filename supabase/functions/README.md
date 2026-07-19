# Edge Functions

Server-side logic that shouldn't live in the client.

## Design note
The **phone-reveal** and **view-logging** flows are implemented as Postgres
`SECURITY DEFINER` RPCs (`create_enquiry`, `log_listing_view` — see migration
`20260719090007_rpcs_grants.sql`) rather than edge functions, because they are
pure data operations gated by `auth.uid()`. This keeps the rules transactional
and avoids a network hop.

Edge functions are reserved here for work that needs external services or
secrets, planned for Phase 1:

- `notify` — fan out push notifications (Expo Push / FCM / APNs) when a
  `notifications` row is inserted (invoked via a DB webhook / `pg_net`).
- `moderate-image` — optional NSFW / plate-blur pass on uploaded listing photos.

Each function lives in its own folder: `supabase/functions/<name>/index.ts`.
Run locally with `supabase functions serve <name>`.
