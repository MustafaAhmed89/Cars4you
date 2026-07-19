import { describe, it, expect } from 'vitest';
import { formatPrice, formatKm } from './theme.js';

describe('formatPrice', () => {
  it('formats with the rupee symbol and Indian (lakh/crore) grouping', () => {
    expect(formatPrice(1234567)).toBe('₹12,34,567');
    expect(formatPrice(500000)).toBe('₹5,00,000');
  });

  it('formats small values without grouping', () => {
    expect(formatPrice(999)).toBe('₹999');
  });
});

describe('formatKm', () => {
  it('formats with Indian grouping and a km suffix', () => {
    expect(formatKm(30000)).toBe('30,000 km');
    expect(formatKm(120000)).toBe('1,20,000 km');
  });
});
