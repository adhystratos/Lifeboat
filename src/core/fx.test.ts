import { describe, expect, it } from 'vitest';

import { convertMinor, FxRate, MissingRateError } from './fx';

const rates: FxRate[] = [
  { base: 'EUR', quote: 'IDR', rate: 17_000 },
  { base: 'EUR', quote: 'USD', rate: 1.1 },
  { base: 'EUR', quote: 'PLN', rate: 4.25 },
];

describe('fx', () => {
  it('returns the same amount for the same currency', () => {
    expect(convertMinor(500, 'IDR', 'IDR', [])).toBe(500);
  });

  it('uses direct and inverse rates', () => {
    expect(convertMinor(100, 'EUR', 'IDR', rates)).toBe(1_700_000); // €1 → Rp 17.000
    expect(convertMinor(1_700_000, 'IDR', 'EUR', rates)).toBe(100);
  });

  it('crosses through a shared currency', () => {
    // $11 → €10 → Rp 170.000
    expect(convertMinor(1100, 'USD', 'IDR', rates)).toBe(17_000_000);
    // 42,50 zł → €10 → $11
    expect(convertMinor(4250, 'PLN', 'USD', rates)).toBe(1100);
  });

  it('throws when no path exists', () => {
    expect(() => convertMinor(100, 'USD', 'PLN', [])).toThrow(MissingRateError);
  });
});
