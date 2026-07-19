import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createCars4youClient } from '@cars4you/api-client';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surfaced early in dev so a missing .env is obvious.
  console.warn('[cars4you] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createCars4youClient({
  url: url ?? '',
  anonKey: anonKey ?? '',
  authStorage: AsyncStorage,
});
