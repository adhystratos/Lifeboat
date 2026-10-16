/**
 * Currencies supported by Lifeboat. Amounts are always stored as integer
 * minor units (e.g. cents) alongside their currency, never as floats.
 */
export const CURRENCIES = ['IDR', 'EUR', 'USD', 'PLN'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = 'IDR';

/** Stored precision: ISO 4217 minor units. IDR officially has 2. */
export const MINOR_UNITS: Record<Currency, number> = { IDR: 2, EUR: 2, USD: 2, PLN: 2 };

/** Displayed precision: rupiah amounts are shown without decimals. */
export const DISPLAY_DECIMALS: Record<Currency, number> = { IDR: 0, EUR: 2, USD: 2, PLN: 2 };

const LOCALES: Record<Currency, string> = {
  IDR: 'id-ID',
  EUR: 'de-DE',
  USD: 'en-US',
  PLN: 'pl-PL',
};

export function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}

export function toMinor(major: number, currency: Currency): number {
  return Math.round(major * 10 ** MINOR_UNITS[currency]);
}

export function toMajor(minor: number, currency: Currency): number {
  return minor / 10 ** MINOR_UNITS[currency];
}

/**
 * Parses user input like "1.250.000", "1,250.50" or "12,5" into minor units.
 * The last "." or "," followed by 1-2 digits is treated as the decimal
 * separator; every other separator is a thousands separator.
 */
export function parseAmount(input: string, currency: Currency): number | null {
  const cleaned = input.replace(/[^\d.,-]/g, '');
  if (!/\d/.test(cleaned)) return null;
  const negative = cleaned.startsWith('-');
  const unsigned = cleaned.replace(/-/g, '');
  const match = unsigned.match(/^(.*)[.,](\d{1,2})$/);
  const whole = (match ? match[1] : unsigned).replace(/[.,]/g, '');
  const fraction = match ? match[2] : '';
  const value = Number(`${whole || '0'}.${fraction || '0'}`);
  if (!Number.isFinite(value)) return null;
  return toMinor(negative ? -value : value, currency);
}

export function formatMoney(minor: number, currency: Currency): string {
  const decimals = DISPLAY_DECIMALS[currency];
  return new Intl.NumberFormat(LOCALES[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(toMajor(minor, currency));
}
