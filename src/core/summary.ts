import { Currency } from './currency';
import { convertMinor, FxRate, MissingRateError } from './fx';

export type SummaryTransaction = {
  type: 'income' | 'expense' | 'transfer';
  amountMinor: number;
  currency: Currency;
  categoryId: string | null;
};

export type CategoryTotal = { categoryId: string | null; amountMinor: number };

export type MonthSummary = {
  currency: Currency;
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
  /** Expense totals per category, largest first. */
  expenseByCategory: CategoryTotal[];
  /** Currencies left out because no exchange rate to `base` was available. */
  missingRates: Currency[];
};

/**
 * Totals income and expenses in the base currency. Transfers move money
 * between your own accounts, so they are neither income nor spending.
 */
export function summarize(
  transactions: SummaryTransaction[],
  base: Currency,
  rates: FxRate[],
): MonthSummary {
  let incomeMinor = 0;
  let expenseMinor = 0;
  const byCategory = new Map<string | null, number>();
  const missing = new Set<Currency>();

  for (const t of transactions) {
    if (t.type === 'transfer') continue;
    let amount: number;
    try {
      amount = convertMinor(t.amountMinor, t.currency, base, rates);
    } catch (e) {
      if (e instanceof MissingRateError) {
        missing.add(t.currency);
        continue;
      }
      throw e;
    }
    if (t.type === 'income') {
      incomeMinor += amount;
    } else {
      expenseMinor += amount;
      byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + amount);
    }
  }

  return {
    currency: base,
    incomeMinor,
    expenseMinor,
    netMinor: incomeMinor - expenseMinor,
    expenseByCategory: [...byCategory]
      .map(([categoryId, amountMinor]) => ({ categoryId, amountMinor }))
      .sort((a, b) => b.amountMinor - a.amountMinor),
    missingRates: [...missing],
  };
}

/** First and last calendar day of the month containing `day` ("YYYY-MM-DD"). */
export function monthBounds(day: string): { start: string; end: string } {
  const [y, m] = day.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, '0');
  return { start: `${y}-${mm}-01`, end: `${y}-${mm}-${String(last).padStart(2, '0')}` };
}

/** Today's calendar date in the device's time zone, as "YYYY-MM-DD". */
export function localToday(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
