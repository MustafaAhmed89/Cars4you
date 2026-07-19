import { describe, it, expect, vi } from 'vitest';
import type { Cars4youClient } from './client.js';
import { requestPhoneOtp } from './auth.js';

// Minimal fake exposing only auth.signInWithOtp, which is all requestPhoneOtp touches.
function makeClient(error: unknown = null) {
  const signInWithOtp = vi.fn(async (_args: { phone: string }) => ({ error }));
  const client = { auth: { signInWithOtp } } as unknown as Cars4youClient;
  return { client, signInWithOtp };
}

describe('requestPhoneOtp normalization', () => {
  it('prefixes a bare number with +91', async () => {
    const { client, signInWithOtp } = makeClient();
    const result = await requestPhoneOtp(client, '9876543210');
    expect(result).toBe('+919876543210');
    expect(signInWithOtp).toHaveBeenCalledWith({ phone: '+919876543210' });
  });

  it('collapses a leading 91 into a single +91', async () => {
    const { client } = makeClient();
    expect(await requestPhoneOtp(client, '919876543210')).toBe('+919876543210');
  });

  it('leaves an already +91-prefixed number unchanged', async () => {
    const { client } = makeClient();
    expect(await requestPhoneOtp(client, '+919876543210')).toBe('+919876543210');
  });

  it('throws when the auth call returns an error', async () => {
    const { client } = makeClient(new Error('sms failed'));
    await expect(requestPhoneOtp(client, '9876543210')).rejects.toThrow('sms failed');
  });
});
