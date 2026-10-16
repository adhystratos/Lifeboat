import { describe, expect, it } from 'vitest';

import { netWorth, netWorthPartial } from './networth';

describe('netWorth', () => {
  it('sums accounts and assets, subtracts liabilities, in the base currency', () => {
    const result = netWorth(
      {
        accounts: [
          { amountMinor: 1_000_000_000, currency: 'IDR' }, // Rp 10.000.000
          { amountMinor: 10_000, currency: 'EUR' }, // €100
        ],
        assets: [{ amountMinor: 50_000_000_000, currency: 'IDR' }], // Rp 500.000.000
        liabilities: [{ amountMinor: 20_000_000_000, currency: 'IDR' }], // Rp 200.000.000
      },
      'IDR',
      [{ base: 'EUR', quote: 'IDR', rate: 17_000 }],
    );
    expect(result.accounts).toBe(1_170_000_000);
    expect(result.total).toBe(1_170_000_000 + 50_000_000_000 - 20_000_000_000);
  });
});

describe('netWorthPartial', () => {
  it('leaves out holdings without a rate and lists their currency', () => {
    const result = netWorthPartial(
      {
        accounts: [
          { amountMinor: 1_000_000_00, currency: 'IDR' },
          { amountMinor: 100_00, currency: 'PLN' },
        ],
        assets: [{ amountMinor: 50_00, currency: 'EUR' }],
        liabilities: [{ amountMinor: 200_000_00, currency: 'IDR' }],
      },
      'IDR',
      [{ base: 'EUR', quote: 'IDR', rate: 17_000 }],
    );
    expect(result.missing).toEqual(['PLN']);
    expect(result.accounts).toBe(1_000_000_00);
    expect(result.assets).toBe(850_000_00);
    expect(result.total).toBe(1_000_000_00 + 850_000_00 - 200_000_00);
  });
});
