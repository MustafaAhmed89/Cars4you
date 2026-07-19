# Cars4you — Product Requirements (MVP)

**Status:** DRAFT · Author: Mustafa Ahmed · Created 2026-07-19

## 1. Problem & vision
Selling a used car privately is slow and low-trust; buying one means chasing
scattered listings across classifieds and dealers. **Cars4you** is a mobile-first
marketplace where individuals list their cars in minutes and buyers (individuals
and dealers) discover, filter, and contact sellers directly. Dealers operate as a
verified role on the **same** platform rather than a separate app.

## 2. Target users
- **Seller (individual):** owns a car, wants to list and get genuine leads.
- **Buyer (individual):** searching by budget, city, and car attributes.
- **Dealer:** buys inventory and/or lists stock; verified business account.
- **Admin:** moderates listings, verifies dealers, manages the catalog.

## 3. MVP goals & non-goals
**Goals (go-live):** account creation (phone OTP), create/manage listings with
photos, browse/search/filter, contact seller (enquiry → phone reveal) + in-app
chat, notifications, basic moderation.
**Non-goals (v1):** payments/escrow, vehicle inspection/valuation engine,
financing/insurance, auctions, delivery logistics, multi-language.

## 4. Primary market
India-first (INR pricing, phone-OTP sign-in, India catalog + cities). Architecture
is region-agnostic for later expansion.

## 5. Success metrics (initial)
- Time-to-publish a listing < 5 minutes.
- % listings receiving ≥ 1 enquiry within 7 days.
- Buyer contact conversion (view → enquiry) rate.
- Listings approved within moderation SLA.

## 6. Scope
See **EPICS.md** for the epic/use-case breakdown (E1–E8) and **ERD.md** for the
data model. Architecture rationale is in **DECISIONS.md**; running build log in
**JOURNAL.md**.

## 7. Release phases
- **Phase 1 (go-live):** E1–E6 on iOS + Android.
- **Phase 2:** Dealer role + admin console (E7, E8), saved-search alerts.
- **Phase 3:** Next.js web app + SEO marketing/listing site.
