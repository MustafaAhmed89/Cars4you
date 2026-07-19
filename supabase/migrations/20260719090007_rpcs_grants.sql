-- Cars4you :: 0007 — RPCs (phone reveal, view logging) + view grants
-- These SECURITY DEFINER functions are the ONLY way seller phone is released and
-- the only way view counts are mutated, keeping those rules server-side.

-- create_enquiry: records a lead, notifies the seller, and reveals the seller's
-- phone to the buyer. Idempotent per (listing, buyer).
create or replace function public.create_enquiry(p_listing_id uuid, p_message text default null)
returns table (enquiry_id uuid, seller_name text, seller_phone text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller_id uuid;
  v_buyer_id  uuid := auth.uid();
  v_enquiry_id uuid;
begin
  if v_buyer_id is null then
    raise exception 'authentication required';
  end if;

  select seller_id into v_seller_id
  from public.listings
  where id = p_listing_id and status = 'active';

  if v_seller_id is null then
    raise exception 'listing not found or not active';
  end if;
  if v_seller_id = v_buyer_id then
    raise exception 'cannot enquire on your own listing';
  end if;

  insert into public.enquiries (listing_id, buyer_id, seller_id, message)
  values (p_listing_id, v_buyer_id, v_seller_id, p_message)
  on conflict (listing_id, buyer_id)
    do update set message = coalesce(excluded.message, public.enquiries.message)
  returning id into v_enquiry_id;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    v_seller_id, 'enquiry', 'New enquiry on your car',
    'A buyer is interested in your listing.',
    jsonb_build_object('listing_id', p_listing_id, 'enquiry_id', v_enquiry_id)
  );

  return query
    select v_enquiry_id, p.full_name, p.phone
    from public.profiles p
    where p.id = v_seller_id;
end;
$$;

-- log_listing_view: bump the denormalized counter, store a raw view row, and
-- record recently-viewed for authenticated users. Callable anonymously.
create or replace function public.log_listing_view(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_viewer uuid := auth.uid();
begin
  update public.listings set view_count = view_count + 1 where id = p_listing_id;
  insert into public.listing_views (listing_id, viewer_id) values (p_listing_id, v_viewer);

  if v_viewer is not null then
    insert into public.recently_viewed (user_id, listing_id, viewed_at)
    values (v_viewer, p_listing_id, now())
    on conflict (user_id, listing_id) do update set viewed_at = now();
  end if;
end;
$$;

-- Grants ---------------------------------------------------------------------
grant select on public.seller_public_profiles to anon, authenticated;
grant execute on function public.create_enquiry(uuid, text) to authenticated;
grant execute on function public.log_listing_view(uuid) to anon, authenticated;
