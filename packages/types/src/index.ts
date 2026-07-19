export * from './enums.js';
export type { Database, Json } from './database.types.js';

import type { Database } from './database.types.js';

type Tables = Database['public']['Tables'];

// Convenience Row aliases for the app layer.
export type Profile = Tables['profiles']['Row'];
export type Dealer = Tables['dealers']['Row'];
export type City = Tables['cities']['Row'];
export type CarMake = Tables['car_makes']['Row'];
export type CarModel = Tables['car_models']['Row'];
export type CarVariant = Tables['car_variants']['Row'];
export type Listing = Tables['listings']['Row'];
export type ListingInsert = Tables['listings']['Insert'];
export type ListingPhoto = Tables['listing_photos']['Row'];
export type Enquiry = Tables['enquiries']['Row'];
export type ChatThread = Tables['chat_threads']['Row'];
export type ChatMessage = Tables['chat_messages']['Row'];
export type Notification = Tables['notifications']['Row'];
export type SellerPublicProfile = Database['public']['Views']['seller_public_profiles']['Row'];

// A listing joined with its cover photo + display name, as returned by the
// discovery queries in @cars4you/api-client. `cover_photo_url` and `city_display`
// are composed by the client, not raw DB columns.
export type ListingCard = Pick<
  Listing,
  'id' | 'title' | 'year' | 'price' | 'km_driven' | 'fuel' | 'transmission' | 'created_at'
> & {
  cover_photo_url: string | null;
  city_display: string | null;
};
