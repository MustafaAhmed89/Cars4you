# Cars4you — Data Model (ERD)

Postgres via Supabase. Every table has RLS enabled (see migration `..._rls_policies.sql`).
Auth users live in `auth.users` (Supabase-managed); `profiles.id` = `auth.users.id`.

## Relationships (text ERD)

```
auth.users 1───1 profiles
profiles   1───0..1 dealers                 (verified business role)
profiles   1───* listings         (seller_id)
profiles   1───* enquiries         (buyer_id / seller_id)
profiles   1───* favorites / recently_viewed / saved_searches / notifications

cities     1───* profiles / dealers / listings(registration_city_id)
car_makes  1───* car_models 1───* car_variants
car_makes  1───* listings (make_id)
car_models 1───* listings (model_id)
car_variants 0..1─* listings (variant_id)

listings   1───* listing_photos
listings   1───* enquiries
listings   1───* chat_threads 1───* chat_messages
listings   1───* listing_views / reports / listing_reviews
```

## Key tables
| Table | Purpose | Notable columns |
|---|---|---|
| `profiles` | one per auth user | `role` (individual/dealer/admin), `phone` (PII) |
| `dealers` | verified dealer role | `verification_status`, `gst_number` |
| `car_makes/models/variants` | catalog taxonomy | admin-writable, world-readable |
| `cities` | geography | used for reg city + user city |
| `listings` | the core object | `status` lifecycle, `price`, `search_vector` (generated), `view_count` |
| `listing_photos` | gallery | `is_cover`, `position`, `storage_path` |
| `favorites` / `recently_viewed` | buyer engagement | composite PK (user, listing) |
| `enquiries` | leads (phone reveal) | unique (listing, buyer) |
| `chat_threads` / `chat_messages` | in-app chat | unique (listing, buyer) |
| `saved_searches` | alerts (Phase 2) | `filters` jsonb |
| `notifications` | in-app/push feed | `type`, `data` jsonb |
| `listing_views` | analytics | raw view events |
| `reports` / `listing_reviews` | moderation | admin-only |

## Access-control highlights
- **Seller phone is never exposed by RLS.** It is released only through the
  `create_enquiry` SECURITY DEFINER RPC, which also records the lead + notifies
  the seller. Public seller display uses the `seller_public_profiles` view
  (name/city/dealer-badge only).
- `listings` are publicly readable only when `status = 'active'`; sellers see
  their own; admins see all (`is_admin()`).
- View counts mutate only via `log_listing_view` RPC.

## Regenerating types
After changing the schema, run `pnpm db:types` to regenerate
`packages/types/src/database.types.ts` from the local database.
