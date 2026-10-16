import { Currency } from './currency';
import { convertMinor, FxRate } from './fx';

export type Holding = { amountMinor: number; currency: Currency };

export type NetWorthInput = {
  accounts: Holding[];
  assets: Holding[];
  liabilities: Holding[];
};

export type NetWorth = {
  currency: Currency;
  accounts: number;
  assets: number;
  liabilities: number;
  total: number;
};

function sumIn(items: Holding[], base: Currency, rates: FxRate[]): number {
  return items.reduce((sum, h) => sum + convertMinor(h.amountMinor, h.currency, base, rates), 0);
}

/** Net worth = accounts + assets − liabilities, all converted to `base`. */
export function netWorth(input: NetWorthInput, base: Currency, rates: FxRate[]): NetWorth {
  const accounts = sumIn(input.accounts, base, rates);
  const assets = sumIn(input.assets, base, rates);
  const liabilities = sumIn(input.liabilities, base, rates);
  return { currency: base, accounts, assets, liabilities, total: accounts + assets - liabilities };
}

export type PartialNetWorth = NetWorth & {
  /** Currencies left out of the totals because no rate to `base` exists yet. */
  missing: Currency[];
};

/**
 * Like `netWorth`, but holdings without an exchange rate are left out and
 * listed in `missing` instead of failing the whole calculation.
 */
export function netWorthPartial(input: NetWorthInput, base: Currency, rates: FxRate[]): PartialNetWorth {
  const missing = new Set<Currency>();
  const sum = (items: Holding[]) =>
    items.reduce((total, h) => {
      try {
        return total + convertMinor(h.amountMinor, h.currency, base, rates);
      } catch {
        missing.add(h.currency);
        return total;
      }
    }, 0);
  const accounts = sum(input.accounts);
  const assets = sum(input.assets);
  const liabilities = sum(input.liabilities);
  return {
    currency: base,
    accounts,
    assets,
    liabilities,
    total: accounts + assets - liabilities,
    missing: [...missing],
  };
}
