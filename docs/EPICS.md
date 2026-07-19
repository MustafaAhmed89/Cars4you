# Cars4you — MVP Epics & Use Cases

Status legend: 🟢 scaffolded in Phase 0 · 🟡 Phase 1 build · ⚪ Phase 2/3

## E1 — Identity & Accounts 🟡
- Phone-OTP signup/login (primary); email fallback.
- Profile: name, phone, email, city, avatar.
- One user can buy **and** sell. Dealer is a verified role (see E7).
- **Built in Phase 0:** `profiles` table + auto-create trigger, phone-OTP auth
  helpers (`requestPhoneOtp`/`verifyPhoneOtp`), sign-in screen.

## E2 — Vehicle Catalog (master data) 🟢
- Make → Model → Variant → Year taxonomy; fuel, transmission, body type, owners,
  color, cities.
- **Built:** `car_makes`/`car_models`/`car_variants`/`cities` tables, seed data,
  `fetchMakes`/`fetchModels`/`fetchCities`.

## E3 — Create & Manage Listing (Seller) 🟡
- Guided form: make/model/variant/year, km, owners, fuel, transmission, reg city,
  color, price, description.
- Multi-photo upload with cover + reorder → Storage (`listing-photos` bucket).
- Lifecycle: `draft → pending → active → sold / expired / rejected`.
- My Listings: edit, mark sold, renew, delete.
- **Built in Phase 0:** `listings` + `listing_photos`, lifecycle triggers,
  `createListing`/`fetchMyListings`/`markListingSold`, Sell screen (photo upload
  is the Phase-1 addition).

## E4 — Discovery: Browse / Search / Filter (Buyer) 🟡
- Home feed, keyword search (`search_vector` + trigram), filters (price, year, km,
  fuel, transmission, body, city), sort (newest/price/year/km).
- Listing detail: gallery, specs, masked seller, similar cars.
- **Built:** `fetchListings(filter)`, `fetchListingById`, home + detail screens.

## E5 — Buyer Engagement 🟡
- Favorites/wishlist, recently viewed.
- **Enquiry + phone reveal** via `create_enquiry` RPC (records lead, notifies
  seller, returns phone). In-app chat (`chat_threads`/`chat_messages`, realtime).
- **Built in Phase 0:** favorites/enquiry/chat schema, `create_enquiry` +
  `log_listing_view` RPCs, `toggleFavorite`/`fetchFavorites`, enquiry flow on the
  detail screen. Chat UI is a Phase-1 build.

## E6 — Notifications ⚪→🟡
- Push + in-app + email: new enquiry, chat message, listing approved/rejected,
  price drop on saved car.
- **Built in Phase 0:** `notifications` table + insert on enquiry. Push delivery
  (`notify` edge function + Expo Push) is Phase 1.

## E7 — Dealer role (secondary) ⚪
- Dealer registration + KYC (GST/docs, admin-approved), dealer dashboard, verified
  badge.
- **Built in Phase 0:** `dealers` table + verification status; `dealer-docs`
  storage bucket. UI + verification workflow are Phase 2.

## E8 — Admin & Moderation ⚪
- Listing moderation queue (approve/reject + reason), dealer verification, catalog
  management, report handling.
- **Built in Phase 0:** `listing_reviews`, `reports`, admin RLS via `is_admin()`.
  Admin console (`apps/admin`) is Phase 2.

## Cross-cutting
Media pipeline (compress/thumbnail), PII masking (phone only via enquiry), rate
limiting, RLS on every table, analytics (`listing_views`), error monitoring,
CI + EAS builds.
