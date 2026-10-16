import { describe, expect, it } from 'vitest';

import { formatMoney, isCurrency, parseAmount, toMinor } from './currency';

const normalizeSpaces = (s: string) => s.replace(/\s/g, ' ');

describe('currency', () => {
  it('recognises supported currencies only', () => {
    expect(isCurrency('IDR')).toBe(true);
    expect(isCurrency('PLN')).toBe(true);
    expect(isCurrency('GBP')).toBe(false);
  });

  it('converts major to minor units without float drift', () => {
    expect(toMinor(19.99, 'EUR')).toBe(1999);
    expect(toMinor(1_250_000, 'IDR')).toBe(125_000_000);
  });

  it('parses amounts in local and international notation', () => {
    expect(parseAmount('1.250.000', 'IDR')).toBe(125_000_000);
    expect(parseAmount('Rp 50.000', 'IDR')).toBe(5_000_000);
    expect(parseAmount('1,250.50', 'USD')).toBe(125_050);
    expect(parseAmount('12,5', 'PLN')).toBe(1250);
    expect(parseAmount('-7.25', 'EUR')).toBe(-725);
    expect(parseAmount('abc', 'EUR')).toBeNull();
  });

  it('formats rupiah without decimals and others with two', () => {
    expect(normalizeSpaces(formatMoney(125_000_000, 'IDR'))).toBe('Rp 1.250.000');
    expect(formatMoney(125_050, 'USD')).toBe('$1,250.50');
    expect(normalizeSpaces(formatMoney(1999, 'EUR'))).toBe('19,99 €');
    expect(normalizeSpaces(formatMoney(1_250_000, 'PLN'))).toBe('12 500,00 zł');
  });
});
