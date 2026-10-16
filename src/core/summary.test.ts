import { describe, expect, it } from 'vitest';

import { localToday, monthBounds, summarize } from './summary';

describe('summarize', () => {
  const rates = [{ base: 'EUR' as const, quote: 'IDR' as const, rate: 17_000 }];

  it('totals income and expenses in the base currency and skips transfers', () => {
    const s = summarize(
      [
        { type: 'income', amountMinor: 1_000_000_000, currency: 'IDR', categoryId: 'salary' },
        { type: 'expense', amountMinor: 5_000_000, currency: 'IDR', categoryId: 'food' },
        { type: 'expense', amountMinor: 1000, currency: 'EUR', categoryId: 'travel' }, // €10
        { type: 'expense', amountMinor: 2_000_000, currency: 'IDR', categoryId: 'food' },
        { type: 'transfer', amountMinor: 99_999_999, currency: 'IDR', categoryId: null },
      ],
      'IDR',
      rates,
    );
    expect(s.incomeMinor).toBe(1_000_000_000);
    expect(s.expenseMinor).toBe(5_000_000 + 17_000_000 + 2_000_000);
    expect(s.netMinor).toBe(1_000_000_000 - 24_000_000);
    expect(s.expenseByCategory).toEqual([
      { categoryId: 'travel', amountMinor: 17_000_000 },
      { categoryId: 'food', amountMinor: 7_000_000 },
    ]);
    expect(s.missingRates).toEqual([]);
  });

  it('reports currencies it could not convert instead of guessing', () => {
    const s = summarize(
      [{ type: 'expense', amountMinor: 500, currency: 'PLN', categoryId: null }],
      'IDR',
      rates,
    );
    expect(s.expenseMinor).toBe(0);
    expect(s.missingRates).toEqual(['PLN']);
  });
});

describe('dates', () => {
  it('finds month bounds, including February in leap years', () => {
    expect(monthBounds('2026-10-16')).toEqual({ start: '2026-10-01', end: '2026-10-31' });
    expect(monthBounds('2028-02-03')).toEqual({ start: '2028-02-01', end: '2028-02-29' });
  });

  it('formats the local date', () => {
    expect(localToday(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});
