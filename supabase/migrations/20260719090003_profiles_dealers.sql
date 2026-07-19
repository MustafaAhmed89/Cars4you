-- Cars4you :: 0003 — identity: profiles + dealers (E1, E7)
-- One profile per auth user. A user can both buy and sell. A dealer is a verified
-- role layered on the same profile (role='dealer' + a dealers row).

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  email        text,
  city_id      uuid references public.cities(id) on delete set null,
  avatar_url   text,
  role         user_role not null default 'individual',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.dealers (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid not null unique references public.profiles(id) on delete cascade,
  business_name        text not null,
  gst_number           text,
  address              text,
  city_id              uuid references public.cities(id) on delete set null,
  verification_status  verification_status not null default 'pending',
  verified_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index dealers_verification_idx on public.dealers(verification_status);

create trigger dealers_set_updated_at
  before update on public.dealers
  for each row execute function public.set_updated_at();

-- Auto-create a profile whenever a new auth user is created (phone or email).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone, email, full_name)
  values (
    new.id,
    new.phone,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Public, phone-free view of a seller for display on listings.
create view public.seller_public_profiles as
  select p.id, p.full_name, p.avatar_url, p.role, p.city_id, c.name as city_name,
         (d.verification_status = 'verified') as is_verified_dealer,
         d.business_name
  from public.profiles p
  left join public.cities c on c.id = p.city_id
  left join public.dealers d on d.profile_id = p.id;
