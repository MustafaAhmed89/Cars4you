-- Cars4you :: 0005 — buyer engagement, messaging, notifications, moderation
-- (E5, E6, E8)

-- Favorites / wishlist -------------------------------------------------------
create table public.favorites (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.recently_viewed (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  viewed_at   timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- Enquiries / leads (phone reveal) ------------------------------------------
create table public.enquiries (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references public.listings(id) on delete cascade,
  buyer_id        uuid not null references public.profiles(id) on delete cascade,
  seller_id       uuid not null references public.profiles(id) on delete cascade,
  message         text,
  phone_revealed  boolean not null default true,
  status          enquiry_status not null default 'new',
  created_at      timestamptz not null default now(),
  unique (listing_id, buyer_id)
);
create index enquiries_seller_idx on public.enquiries(seller_id);
create index enquiries_buyer_idx  on public.enquiries(buyer_id);

-- In-app chat ----------------------------------------------------------------
create table public.chat_threads (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid not null references public.listings(id) on delete cascade,
  buyer_id         uuid not null references public.profiles(id) on delete cascade,
  seller_id        uuid not null references public.profiles(id) on delete cascade,
  created_at       timestamptz not null default now(),
  last_message_at  timestamptz not null default now(),
  unique (listing_id, buyer_id)
);
create index chat_threads_buyer_idx  on public.chat_threads(buyer_id);
create index chat_threads_seller_idx on public.chat_threads(seller_id);

create table public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.chat_threads(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index chat_messages_thread_idx on public.chat_messages(thread_id, created_at);

-- Saved searches (Phase 2 alerts) -------------------------------------------
create table public.saved_searches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text,
  filters     jsonb not null,
  notify      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Notifications --------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        notification_type not null,
  title       text not null,
  body        text,
  data        jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

-- Analytics: raw listing views ----------------------------------------------
create table public.listing_views (
  id          bigint generated always as identity primary key,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  viewer_id   uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index listing_views_listing_idx on public.listing_views(listing_id);

-- Moderation: reports + review actions (E8) ---------------------------------
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references public.listings(id) on delete cascade,
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  reason       text not null,
  status       report_status not null default 'open',
  created_at   timestamptz not null default now()
);

create table public.listing_reviews (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings(id) on delete cascade,
  moderator_id  uuid not null references public.profiles(id) on delete cascade,
  action        text not null check (action in ('approved', 'rejected')),
  reason        text,
  created_at    timestamptz not null default now()
);
create index listing_reviews_listing_idx on public.listing_reviews(listing_id);
