import { Currency, MINOR_UNITS } from './currency';

/** A rate saying 1 unit of `base` equals `rate` units of `quote`. */
export type FxRate = { base: Currency; quote: Currency; rate: number };

export class MissingRateError extends Error {
  constructor(from: Currency, to: Currency) {
    super(`No exchange rate from ${from} to ${to}`);
  }
}

/** Finds a direct, inverse, or cross rate (via any shared currency). */
export function findRate(rates: FxRate[], from: Currency, to: Currency): number {
  if (from === to) return 1;
  const direct = rates.find((r) => r.base === from && r.quote === to);
  if (direct) return direct.rate;
  const inverse = rates.find((r) => r.base === to && r.quote === from);
  if (inverse) return 1 / inverse.rate;
  for (const r of rates) {
    const via = r.base === from ? r.quote : r.quote === from ? r.base : null;
    if (!via || via === to) continue;
    const leg2 =
      rates.find((x) => x.base === via && x.quote === to) ??
      rates.find((x) => x.base === to && x.quote === via);
    if (leg2) return findRate([r], from, via) * findRate([leg2], via, to);
  }
  throw new MissingRateError(from, to);
}

export function convertMinor(
  minor: number,
  from: Currency,
  to: Currency,
  rates: FxRate[],
): number {
  if (from === to) return minor;
  const major = minor / 10 ** MINOR_UNITS[from];
  return Math.round(major * findRate(rates, from, to) * 10 ** MINOR_UNITS[to]);
}
