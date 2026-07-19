-- Cars4you :: 0004 — listings + photos (E3)
-- Lifecycle: draft -> pending -> active -> sold / expired / rejected.

create table public.listings (
  id                    uuid primary key default gen_random_uuid(),
  seller_id             uuid not null references public.profiles(id) on delete cascade,
  make_id               uuid not null references public.car_makes(id),
  model_id              uuid not null references public.car_models(id),
  variant_id            uuid references public.car_variants(id),
  title                 text not null,
  year                  smallint not null check (year between 1950 and 2100),
  price                 numeric(12, 2) not null check (price > 0),
  km_driven             integer not null check (km_driven >= 0),
  owners                smallint not null default 1 check (owners between 1 and 15),
  fuel                  fuel_type not null,
  transmission          transmission_type not null,
  body_type             body_type,
  color                 text,
  registration_city_id  uuid references public.cities(id),
  registration_number   text,               -- PII: never selected in public reads
  description           text,
  status                listing_status not null default 'draft',
  is_dealer_listing     boolean not null default false,
  view_count            integer not null default 0,
  search_vector         tsvector generated always as (
                          to_tsvector('simple',
                            coalesce(title, '') || ' ' || coalesce(color, '') || ' ' || coalesce(description, ''))
                        ) stored,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  published_at          timestamptz,
  sold_at               timestamptz,
  expires_at            timestamptz
);

create index listings_status_idx        on public.listings(status);
create index listings_seller_idx        on public.listings(seller_id);
create index listings_make_model_idx    on public.listings(make_id, model_id);
create index listings_price_idx         on public.listings(price);
create index listings_year_idx          on public.listings(year);
create index listings_reg_city_idx      on public.listings(registration_city_id);
create index listings_published_idx     on public.listings(published_at desc);
create index listings_search_idx        on public.listings using gin(search_vector);
create index listings_title_trgm_idx    on public.listings using gin(title gin_trgm_ops);

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Stamp published_at the first time a listing becomes active.
create or replace function public.stamp_listing_published()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'active' and old.status is distinct from 'active' and new.published_at is null then
    new.published_at = now();
  end if;
  if new.status = 'sold' and old.status is distinct from 'sold' then
    new.sold_at = now();
  end if;
  return new;
end;
$$;

create trigger listings_stamp_lifecycle
  before update on public.listings
  for each row execute function public.stamp_listing_published();

create table public.listing_photos (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings(id) on delete cascade,
  storage_path  text not null,
  position      smallint not null default 0,
  is_cover      boolean not null default false,
  created_at    timestamptz not null default now()
);
create index listing_photos_listing_idx on public.listing_photos(listing_id);
