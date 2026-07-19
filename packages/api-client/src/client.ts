import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@cars4you/types';

export type Cars4youClient = SupabaseClient<Database>;

export interface CreateClientOptions {
  url: string;
  anonKey: string;
  /**
   * Platform storage adapter for the auth session. Pass AsyncStorage on React
   * Native; omit on web to use the default (localStorage).
   */
  authStorage?: {
    getItem: (key: string) => Promise<string | null> | string | null;
    setItem: (key: string, value: string) => Promise<void> | void;
    removeItem: (key: string) => Promise<void> | void;
  };
}

export function createCars4youClient({ url, anonKey, authStorage }: CreateClientOptions): Cars4youClient {
  return createClient<Database>(url, anonKey, {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      // React Native has no URL to parse tokens from; harmless on web.
      detectSessionInUrl: false,
    },
  });
}
