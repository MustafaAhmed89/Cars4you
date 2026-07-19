-- Cars4you :: 0002 — vehicle catalog + geography reference data (E2)
-- Read-only to end users; maintained by admins. Underpins structured listings + filters.

create table public.cities (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  state       text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

create table public.car_makes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  logo_url    text,
  created_at  timestamptz not null default now()
);

create table public.car_models (
  id          uuid primary key default gen_random_uuid(),
  make_id     uuid not null references public.car_makes(id) on delete cascade,
  name        text not null,
  slug        text not null,
  body_type   body_type,
  created_at  timestamptz not null default now(),
  unique (make_id, name)
);
create index car_models_make_id_idx on public.car_models(make_id);

create table public.car_variants (
  id            uuid primary key default gen_random_uuid(),
  model_id      uuid not null references public.car_models(id) on delete cascade,
  name          text not null,
  fuel          fuel_type,
  transmission  transmission_type,
  created_at    timestamptz not null default now(),
  unique (model_id, name)
);
create index car_variants_model_id_idx on public.car_variants(model_id);
