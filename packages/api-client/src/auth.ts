import type { Cars4youClient } from './client.js';

/** Send a phone OTP (India-first primary sign-in). */
export async function requestPhoneOtp(client: Cars4youClient, phone: string) {
  const normalized = phone.startsWith('+') ? phone : `+91${phone.replace(/^91/, '')}`;
  const { error } = await client.auth.signInWithOtp({ phone: normalized });
  if (error) throw error;
  return normalized;
}

/** Verify the 6-digit SMS code and establish a session. */
export async function verifyPhoneOtp(client: Cars4youClient, phone: string, token: string) {
  const { data, error } = await client.auth.verifyOtp({ phone, token, type: 'sms' });
  if (error) throw error;
  return data.session;
}

/** Email/password fallback sign-in. */
export async function signInWithEmail(client: Cars4youClient, email: string, password: string) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut(client: Cars4youClient) {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUserId(client: Cars4youClient): Promise<string | null> {
  const { data } = await client.auth.getSession();
  return data.session?.user.id ?? null;
}
