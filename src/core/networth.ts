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
