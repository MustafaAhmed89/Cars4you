-- Cars4you :: 0006 — Row-Level Security on every table
-- Principle: catalog is world-readable; listings are public only when active;
-- personal rows (favorites, enquiries, chat, notifications) are owner-scoped;
-- moderation is admin-only. Seller PII (phone) is never exposed by these policies —
-- it is released only through the create_enquiry RPC (migration 0007).

-- Enable RLS everywhere ------------------------------------------------------
alter table public.cities            enable row level security;
alter table public.car_makes         enable row level security;
alter table public.car_models        enable row level security;
alter table public.car_variants      enable row level security;
alter table public.profiles          enable row level security;
alter table public.dealers           enable row level security;
alter table public.listings          enable row level security;
alter table public.listing_photos    enable row level security;
alter table public.favorites         enable row level security;
alter table public.recently_viewed   enable row level security;
alter table public.enquiries         enable row level security;
alter table public.chat_threads      enable row level security;
alter table public.chat_messages     enable row level security;
alter table public.saved_searches    enable row level security;
alter table public.notifications     enable row level security;
alter table public.listing_views     enable row level security;
alter table public.reports           enable row level security;
alter table public.listing_reviews   enable row level security;

-- Catalog: world-readable, admin-writable -----------------------------------
create policy "catalog readable" on public.cities       for select using (true);
create policy "catalog readable" on public.car_makes    for select using (true);
create policy "catalog readable" on public.car_models   for select using (true);
create policy "catalog readable" on public.car_variants for select using (true);

create policy "catalog admin write" on public.cities       for all using (public.is_admin()) with check (public.is_admin());
create policy "catalog admin write" on public.car_makes    for all using (public.is_admin()) with check (public.is_admin());
create policy "catalog admin write" on public.car_models   for all using (public.is_admin()) with check (public.is_admin());
create policy "catalog admin write" on public.car_variants for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: own row + admin. Public seller info goes through the view. -------
create policy "profiles self read"   on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles admin all"   on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- Dealers: verified dealers are publicly visible; owners manage their own. ----
create policy "dealers public read" on public.dealers
  for select using (verification_status = 'verified' or profile_id = auth.uid() or public.is_admin());
create policy "dealers self insert" on public.dealers
  for insert with check (profile_id = auth.uid());
create policy "dealers self update" on public.dealers
  for update using (profile_id = auth.uid() or public.is_admin()) with check (profile_id = auth.uid() or public.is_admin());
create policy "dealers admin all" on public.dealers
  for all using (public.is_admin()) with check (public.is_admin());

-- Listings: active are public; sellers see/manage their own; admins moderate. -
create policy "listings public read" on public.listings
  for select using (status = 'active' or seller_id = auth.uid() or public.is_admin());
create policy "listings owner insert" on public.listings
  for insert with check (seller_id = auth.uid());
create policy "listings owner update" on public.listings
  for update using (seller_id = auth.uid() or public.is_admin()) with check (seller_id = auth.uid() or public.is_admin());
create policy "listings owner delete" on public.listings
  for delete using (seller_id = auth.uid() or public.is_admin());

-- Listing photos follow the parent listing's visibility. ---------------------
create policy "photos read" on public.listing_photos
  for select using (
    exists (select 1 from public.listings l
            where l.id = listing_id
              and (l.status = 'active' or l.seller_id = auth.uid() or public.is_admin()))
  );
create policy "photos owner write" on public.listing_photos
  for all using (
    exists (select 1 from public.listings l where l.id = listing_id and (l.seller_id = auth.uid() or public.is_admin()))
  ) with check (
    exists (select 1 from public.listings l where l.id = listing_id and (l.seller_id = auth.uid() or public.is_admin()))
  );

-- Favorites / recently viewed: strictly owner-scoped. ------------------------
create policy "favorites owner" on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "recently viewed owner" on public.recently_viewed
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Enquiries: visible to the buyer and the seller. Insert via RPC (definer),
-- but allow a direct buyer insert too for flexibility. -----------------------
create policy "enquiries participant read" on public.enquiries
  for select using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());
create policy "enquiries buyer insert" on public.enquiries
  for insert with check (buyer_id = auth.uid());
create policy "enquiries seller update" on public.enquiries
  for update using (seller_id = auth.uid()) with check (seller_id = auth.uid());

-- Chat: only the two participants of a thread. -------------------------------
create policy "threads participant read" on public.chat_threads
  for select using (buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());
create policy "threads buyer insert" on public.chat_threads
  for insert with check (buyer_id = auth.uid());

create policy "messages participant read" on public.chat_messages
  for select using (
    exists (select 1 from public.chat_threads t
            where t.id = thread_id and (t.buyer_id = auth.uid() or t.seller_id = auth.uid()))
  );
create policy "messages participant insert" on public.chat_messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from public.chat_threads t
                where t.id = thread_id and (t.buyer_id = auth.uid() or t.seller_id = auth.uid()))
  );
create policy "messages mark read" on public.chat_messages
  for update using (
    exists (select 1 from public.chat_threads t
            where t.id = thread_id and (t.buyer_id = auth.uid() or t.seller_id = auth.uid()))
  );

-- Saved searches / notifications: owner-scoped. ------------------------------
create policy "saved searches owner" on public.saved_searches
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications owner read" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifications owner update" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Listing views: anyone may log a view; only admins read the raw table. ------
create policy "views insert any" on public.listing_views
  for insert with check (true);
create policy "views admin read" on public.listing_views
  for select using (public.is_admin());

-- Reports: reporters create + read their own; admins see all. ----------------
create policy "reports insert" on public.reports
  for insert with check (reporter_id = auth.uid());
create policy "reports read" on public.reports
  for select using (reporter_id = auth.uid() or public.is_admin());
create policy "reports admin update" on public.reports
  for update using (public.is_admin()) with check (public.is_admin());

-- Moderation actions: admin only. -------------------------------------------
create policy "reviews admin all" on public.listing_reviews
  for all using (public.is_admin()) with check (public.is_admin());
