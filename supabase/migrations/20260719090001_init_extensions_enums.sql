-- Cars4you :: 0001 — extensions, enums, shared helpers
-- Foundation objects other migrations depend on.

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";        -- fuzzy search on make/model text
create extension if not exists "unaccent";

-- ---------------------------------------------------------------------------
-- Enumerated domains
-- ---------------------------------------------------------------------------
create type user_role as enum ('individual', 'dealer', 'admin');
create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
create type listing_status as enum ('draft', 'pending', 'active', 'sold', 'expired', 'rejected');
create type fuel_type as enum ('petrol', 'diesel', 'cng', 'lpg', 'electric', 'hybrid');
create type transmission_type as enum ('manual', 'automatic', 'amt', 'cvt', 'dct');
create type body_type as enum ('hatchback', 'sedan', 'suv', 'muv', 'coupe', 'convertible', 'pickup', 'van', 'other');
create type enquiry_status as enum ('new', 'contacted', 'closed');
create type notification_type as enum ('enquiry', 'chat_message', 'listing_approved', 'listing_rejected', 'price_drop');
create type report_status as enum ('open', 'reviewed', 'actioned', 'dismissed');

-- ---------------------------------------------------------------------------
-- Shared helper functions
-- ---------------------------------------------------------------------------

-- Auto-maintain updated_at on any table with that column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admin check used across RLS policies. SECURITY DEFINER so it bypasses RLS on
-- profiles and avoids recursive policy evaluation.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
