/**
 * A small subset of RFC 5545 RRULE: FREQ, INTERVAL, COUNT and UNTIL.
 * Dates are calendar days as "YYYY-MM-DD" strings so time zones never shift
 * a bill to the wrong day.
 */
export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type Rule = {
  freq: Frequency;
  interval: number;
  count?: number;
  until?: string;
};

const FREQUENCIES: Frequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

export function parseRule(rrule: string): Rule {
  const parts = Object.fromEntries(
    rrule
      .replace(/^RRULE:/, '')
      .split(';')
      .filter(Boolean)
      .map((p) => p.split('=') as [string, string]),
  );
  const freq = parts.FREQ as Frequency;
  if (!FREQUENCIES.includes(freq)) throw new Error(`Unsupported FREQ in "${rrule}"`);
  const until = parts.UNTIL
    ? parts.UNTIL.replace(/^(\d{4})(\d{2})(\d{2}).*$/, '$1-$2-$3')
    : undefined;
  return {
    freq,
    interval: parts.INTERVAL ? Math.max(1, Number(parts.INTERVAL)) : 1,
    count: parts.COUNT ? Number(parts.COUNT) : undefined,
    until,
  };
}

function toUtc(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** The n-th occurrence (0 = start). Month-end dates clamp, e.g. Jan 31 → Feb 28. */
function nth(start: Date, rule: Rule, n: number): Date {
  const step = n * rule.interval;
  const y = start.getUTCFullYear();
  const m = start.getUTCMonth();
  const d = start.getUTCDate();
  switch (rule.freq) {
    case 'DAILY':
      return new Date(Date.UTC(y, m, d + step));
    case 'WEEKLY':
      return new Date(Date.UTC(y, m, d + step * 7));
    case 'MONTHLY': {
      const target = new Date(Date.UTC(y, m + step, 1));
      const ty = target.getUTCFullYear();
      const tm = target.getUTCMonth();
      return new Date(Date.UTC(ty, tm, Math.min(d, daysInMonth(ty, tm))));
    }
    case 'YEARLY':
      return new Date(Date.UTC(y + step, m, Math.min(d, daysInMonth(y + step, m))));
  }
}

/** All occurrences of `rrule` starting at `start` that fall within [from, to]. */
export function occurrencesBetween(
  start: string,
  rrule: string,
  from: string,
  to: string,
): string[] {
  const rule = parseRule(rrule);
  const startDate = toUtc(start);
  const result: string[] = [];
  for (let n = 0; ; n++) {
    if (rule.count !== undefined && n >= rule.count) break;
    const day = toDay(nth(startDate, rule, n));
    if (rule.until && day > rule.until) break;
    if (day > to) break;
    if (day >= from) result.push(day);
  }
  return result;
}

/** The first occurrence on or after `onOrAfter`, or null if the rule has ended. */
export function nextOccurrence(start: string, rrule: string, onOrAfter: string): string | null {
  const rule = parseRule(rrule);
  const startDate = toUtc(start);
  for (let n = 0; ; n++) {
    if (rule.count !== undefined && n >= rule.count) return null;
    const day = toDay(nth(startDate, rule, n));
    if (rule.until && day > rule.until) return null;
    if (day >= onOrAfter) return day;
  }
}
