import type { Cars4youClient } from './client.js';
import type { ListingCard, ListingInsert, Listing, ListingPhoto } from '@cars4you/types';
import type { ListingFilter, ListingInput } from '@cars4you/validation';

// Shapes returned by embedded selects. Declared explicitly and applied via
// `.returns<T>()` because the hand-authored Database type carries empty
// Relationships metadata (the generated type from `pnpm db:types` will include
// full FK relationships, at which point these can be inferred instead).
type PhotoRef = { storage_path: string; is_cover: boolean; position: number };
type ListingListRow = Pick<
  Listing,
  'id' | 'title' | 'year' | 'price' | 'km_driven' | 'fuel' | 'transmission' | 'created_at'
> & { listing_photos: PhotoRef[]; cities: { name: string } | null };
type ListingDetailRow = Listing & { listing_photos: ListingPhoto[]; cities: { name: string } | null };
type FavoriteRow = {
  listing_id: string;
  listings: (Listing & { listing_photos: PhotoRef[] }) | null;
};

const PHOTO_BUCKET = 'listing-photos';

function publicPhotoUrl(client: Cars4youClient, path: string | null | undefined): string | null {
  if (!path) return null;
  return client.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

// --- Catalog ----------------------------------------------------------------
export async function fetchMakes(client: Cars4youClient) {
  const { data, error } = await client.from('car_makes').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function fetchModels(client: Cars4youClient, makeId: string) {
  const { data, error } = await client
    .from('car_models')
    .select('*')
    .eq('make_id', makeId)
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchCities(client: Cars4youClient) {
  const { data, error } = await client.from('cities').select('*').order('name');
  if (error) throw error;
  return data;
}

// --- Discovery (E4) ---------------------------------------------------------
export async function fetchListings(
  client: Cars4youClient,
  filter: Partial<ListingFilter> = {},
): Promise<ListingCard[]> {
  let query = client
    .from('listings')
    .select(
      'id,title,year,price,km_driven,fuel,transmission,created_at,listing_photos(storage_path,is_cover,position),cities(name)',
    )
    .eq('status', 'active');

  if (filter.q) query = query.textSearch('search_vector', filter.q, { type: 'websearch' });
  if (filter.make_id) query = query.eq('make_id', filter.make_id);
  if (filter.model_id) query = query.eq('model_id', filter.model_id);
  if (filter.fuel) query = query.eq('fuel', filter.fuel);
  if (filter.transmission) query = query.eq('transmission', filter.transmission);
  if (filter.body_type) query = query.eq('body_type', filter.body_type);
  if (filter.city_id) query = query.eq('registration_city_id', filter.city_id);
  if (filter.price_min !== undefined) query = query.gte('price', filter.price_min);
  if (filter.price_max !== undefined) query = query.lte('price', filter.price_max);
  if (filter.year_min !== undefined) query = query.gte('year', filter.year_min);
  if (filter.year_max !== undefined) query = query.lte('year', filter.year_max);
  if (filter.km_max !== undefined) query = query.lte('km_driven', filter.km_max);
  if (filter.owners_max !== undefined) query = query.lte('owners', filter.owners_max);

  switch (filter.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'year_desc': query = query.order('year', { ascending: false }); break;
    case 'km_asc': query = query.order('km_driven', { ascending: true }); break;
    default: query = query.order('published_at', { ascending: false, nullsFirst: false });
  }

  const { data, error } = await query.limit(50).returns<ListingListRow[]>();
  if (error) throw error;

  return (data ?? []).map((row): ListingCard => {
    const photos = row.listing_photos ?? [];
    const cover = photos.find((p) => p.is_cover) ?? photos.slice().sort((a, b) => a.position - b.position)[0];
    return {
      id: row.id,
      title: row.title,
      year: row.year,
      price: row.price,
      km_driven: row.km_driven,
      fuel: row.fuel,
      transmission: row.transmission,
      created_at: row.created_at,
      cover_photo_url: publicPhotoUrl(client, cover?.storage_path),
      city_display: row.cities?.name ?? null,
    };
  });
}

export async function fetchListingById(client: Cars4youClient, id: string) {
  const res = await client
    .from('listings')
    .select('*, listing_photos(*), cities(name)')
    .eq('id', id)
    .single();
  if (res.error) throw res.error;
  const data = res.data as unknown as ListingDetailRow;

  const seller = await client
    .from('seller_public_profiles')
    .select('*')
    .eq('id', data.seller_id)
    .maybeSingle();

  const photos = (data.listing_photos ?? []).map((p) => ({
    ...p,
    url: publicPhotoUrl(client, p.storage_path),
  }));

  return { ...data, photos, seller: seller.data };
}

// --- Listing management (E3) ------------------------------------------------
export async function createListing(
  client: Cars4youClient,
  sellerId: string,
  input: ListingInput,
  title: string,
) {
  const payload: ListingInsert = {
    ...input,
    seller_id: sellerId,
    title,
    status: 'pending', // enters the moderation queue
  };
  const { data, error } = await client.from('listings').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function fetchMyListings(client: Cars4youClient, sellerId: string) {
  const { data, error } = await client
    .from('listings')
    .select('*, listing_photos(storage_path,is_cover,position)')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function markListingSold(client: Cars4youClient, id: string) {
  const { error } = await client.from('listings').update({ status: 'sold' }).eq('id', id);
  if (error) throw error;
}

// --- Engagement (E5) --------------------------------------------------------
export async function createEnquiry(client: Cars4youClient, listingId: string, message?: string) {
  const { data, error } = await client.rpc('create_enquiry', {
    p_listing_id: listingId,
    // p_message is an optional RPC arg (text default null); when undefined it is
    // omitted from the request and the DB default applies.
    p_message: message,
  });
  if (error) throw error;
  return data?.[0] ?? null; // { enquiry_id, seller_name, seller_phone }
}

export async function logListingView(client: Cars4youClient, listingId: string) {
  await client.rpc('log_listing_view', { p_listing_id: listingId });
}

export async function toggleFavorite(client: Cars4youClient, userId: string, listingId: string) {
  const existing = await client
    .from('favorites')
    .select('listing_id')
    .eq('user_id', userId)
    .eq('listing_id', listingId)
    .maybeSingle();

  if (existing.data) {
    const { error } = await client.from('favorites').delete().eq('user_id', userId).eq('listing_id', listingId);
    if (error) throw error;
    return false;
  }
  const { error } = await client.from('favorites').insert({ user_id: userId, listing_id: listingId });
  if (error) throw error;
  return true;
}

export async function fetchFavorites(client: Cars4youClient, userId: string) {
  const { data, error } = await client
    .from('favorites')
    .select('listing_id, listings(*, listing_photos(storage_path,is_cover,position))')
    .eq('user_id', userId)
    .returns<FavoriteRow[]>();
  if (error) throw error;
  return data;
}
