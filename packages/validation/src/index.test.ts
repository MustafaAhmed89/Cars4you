import { describe, it, expect } from 'vitest';
import {
  phoneOtpRequestSchema,
  phoneOtpVerifySchema,
  listingInputSchema,
  listingFilterSchema,
} from './index.js';

// A syntactically valid UUID reused across listing cases.
const UUID = '11111111-1111-1111-1111-111111111111';

describe('phone validation', () => {
  it('accepts a bare 10-digit Indian mobile', () => {
    expect(phoneOtpRequestSchema.safeParse({ phone: '9876543210' }).success).toBe(true);
  });

  it('accepts +91 and 91 prefixed numbers', () => {
    expect(phoneOtpRequestSchema.safeParse({ phone: '+919876543210' }).success).toBe(true);
    expect(phoneOtpRequestSchema.safeParse({ phone: '919876543210' }).success).toBe(true);
  });

  it('rejects numbers with an invalid leading digit', () => {
    // Indian mobiles start 6-9; 1xxxxxxxxx is invalid.
    expect(phoneOtpRequestSchema.safeParse({ phone: '1234567890' }).success).toBe(false);
  });

  it('rejects too-short and too-long numbers', () => {
    expect(phoneOtpRequestSchema.safeParse({ phone: '98765' }).success).toBe(false);
    expect(phoneOtpRequestSchema.safeParse({ phone: '98765432100' }).success).toBe(false);
  });
});

describe('phoneOtpVerifySchema', () => {
  it('requires an exactly 6-character token', () => {
    expect(
      phoneOtpVerifySchema.safeParse({ phone: '9876543210', token: '123456' }).success,
    ).toBe(true);
    expect(
      phoneOtpVerifySchema.safeParse({ phone: '9876543210', token: '12345' }).success,
    ).toBe(false);
  });
});

describe('listingInputSchema', () => {
  const base = {
    make_id: UUID,
    model_id: UUID,
    year: 2020,
    price: 500000,
    km_driven: 30000,
    fuel: 'petrol',
    transmission: 'manual',
  };

  it('accepts a valid listing and defaults owners to 1', () => {
    const res = listingInputSchema.safeParse(base);
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.owners).toBe(1);
  });

  it('rejects a year after the current year and before 1950', () => {
    expect(listingInputSchema.safeParse({ ...base, year: 2027 }).success).toBe(false);
    expect(listingInputSchema.safeParse({ ...base, year: 1949 }).success).toBe(false);
  });

  it('rejects a non-positive price', () => {
    expect(listingInputSchema.safeParse({ ...base, price: 0 }).success).toBe(false);
    expect(listingInputSchema.safeParse({ ...base, price: -100 }).success).toBe(false);
  });

  it('rejects km_driven outside 0..1,000,000', () => {
    expect(listingInputSchema.safeParse({ ...base, km_driven: -1 }).success).toBe(false);
    expect(listingInputSchema.safeParse({ ...base, km_driven: 1_000_001 }).success).toBe(false);
  });

  it('rejects an unknown fuel value', () => {
    expect(listingInputSchema.safeParse({ ...base, fuel: 'nuclear' }).success).toBe(false);
  });
});

describe('listingFilterSchema', () => {
  it('defaults sort to "newest" when omitted', () => {
    const res = listingFilterSchema.safeParse({});
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.sort).toBe('newest');
  });
});
