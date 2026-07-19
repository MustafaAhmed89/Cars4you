import { describe, it, expect } from 'vitest';
import type { Cars4youClient } from './client.js';
import { fetchListings } from './queries.js';

// A fake Supabase client: the query builder is chainable (every filter/order/limit
// returns itself) and thenable (awaiting it resolves to { data, error }). Storage
// getPublicUrl echoes the path so we can assert cover-photo selection.
function makeClient(rows: unknown[]) {
  const builder: Record<string, unknown> = {};
  for (const m of ['from', 'select', 'eq', 'textSearch', 'gte', 'lte', 'order', 'limit', 'returns']) {
    builder[m] = () => builder;
  }
  builder.then = (onFulfilled: (r: { data: unknown[]; error: null }) => unknown) =>
    Promise.resolve({ data: rows, error: null }).then(onFulfilled);

  const client = {
    from: () => builder,
    storage: {
      from: () => ({ getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn/${path}` } }) }),
    },
  } as unknown as Cars4youClient;
  return client;
}

const baseRow = {
  id: 'l1',
  title: '2020 Honda City',
  year: 2020,
  price: 800000,
  km_driven: 25000,
  fuel: 'petrol',
  transmission: 'manual',
  created_at: '2026-01-01T00:00:00Z',
};

describe('fetchListings mapping', () => {
  it('picks the is_cover photo as the cover and maps the city name', async () => {
    const client = makeClient([
      {
        ...baseRow,
        listing_photos: [
          { storage_path: 'a.jpg', is_cover: false, position: 1 },
          { storage_path: 'b.jpg', is_cover: true, position: 2 },
        ],
        cities: { name: 'Mumbai' },
      },
    ]);
    const card = (await fetchListings(client))[0]!;
    expect(card.cover_photo_url).toBe('https://cdn/b.jpg');
    expect(card.city_display).toBe('Mumbai');
    expect(card.title).toBe('2020 Honda City');
  });

  it('falls back to the lowest-position photo when none is marked cover', async () => {
    const client = makeClient([
      {
        ...baseRow,
        listing_photos: [
          { storage_path: 'x.jpg', is_cover: false, position: 3 },
          { storage_path: 'y.jpg', is_cover: false, position: 1 },
        ],
        cities: { name: 'Pune' },
      },
    ]);
    const card = (await fetchListings(client))[0]!;
    expect(card.cover_photo_url).toBe('https://cdn/y.jpg');
  });

  it('yields null cover and city when there are no photos or city', async () => {
    const client = makeClient([{ ...baseRow, listing_photos: [], cities: null }]);
    const card = (await fetchListings(client))[0]!;
    expect(card.cover_photo_url).toBeNull();
    expect(card.city_display).toBeNull();
  });
});
