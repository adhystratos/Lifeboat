import { localToday } from './summary';
import { Frequency, nextOccurrence, occurrencesBetween, parseRule } from './recurrence';

/**
 * Calendar-day helpers and bill schedules. Days are "YYYY-MM-DD" strings in
 * the device's time zone; timestamps are ISO strings.
 */

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** First day of the month `n` months away from the month containing `day`. */
export function addMonths(day: string, n: number): string {
  const [y, m] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 10);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

/**
 * The weeks (Monday first) that cover the month containing `day`. Each week
 * holds seven days; days outside the month are included so rows are full.
 */
export function monthGrid(day: string): string[][] {
  const first = `${day.slice(0, 7)}-01`;
  const [y, m] = day.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  let cursor = addDays(first, -weekdayIndex(first));
  const weeks: string[][] = [];
  while (cursor <= last) {
    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/**
 * Dot size on the calendar: 0 = nothing, 1 = one entry, 2 = two or three,
 * 3 = four or more. A fixed ramp so a busy day always reads the same.
 */
export function magnitude(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  return 3;
}

/** The local calendar day of an ISO timestamp. */
export function dayOf(iso: string): string {
  return localToday(new Date(iso));
}

/** [start, end) of a local calendar day as ISO timestamps. */
export function dayRange(day: string): { from: string; to: string } {
  const [y, m, d] = day.split('-').map(Number);
  return {
    from: new Date(y, m - 1, d).toISOString(),
    to: new Date(y, m - 1, d + 1).toISOString(),
  };
}

/** A local day plus "HH:MM" as an ISO timestamp, or null if the time is invalid. */
export function localDateTime(day: string, time: string): string | null {
  const match = time.trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, hours, minutes).toISOString();
}

// ---------------------------------------------------------------------------
// Bills (recurring items)
// ---------------------------------------------------------------------------

export type BillSchedule = {
  starts_on: string;
  recurrence_rule: string;
  /** The earliest unpaid occurrence; null once the schedule has ended. */
  next_due_on: string | null;
};

export type BillStatus = 'paid' | 'overdue' | 'due' | 'upcoming';

export type BillOccurrence = { day: string; status: BillStatus };

/**
 * Occurrences of a bill within [from, to]. Everything before `next_due_on`
 * counts as paid; unpaid days before `today` are overdue.
 */
export function billOccurrences(
  bill: BillSchedule,
  from: string,
  to: string,
  today: string,
): BillOccurrence[] {
  return occurrencesBetween(bill.starts_on, bill.recurrence_rule, from, to).map((day) => ({
    day,
    status:
      bill.next_due_on === null || day < bill.next_due_on
        ? 'paid'
        : day < today
          ? 'overdue'
          : day === today
            ? 'due'
            : 'upcoming',
  }));
}

/** The first due day for a new bill: its next occurrence on or after today. */
export function firstDueDay(startsOn: string, rrule: string, today: string): string | null {
  return nextOccurrence(startsOn, rrule, startsOn > today ? startsOn : today);
}

/** Where `next_due_on` moves after the occurrence on `paidDay` is paid. */
export function nextDueAfter(bill: BillSchedule, paidDay: string): string | null {
  return nextOccurrence(bill.starts_on, bill.recurrence_rule, addDays(paidDay, 1));
}

export type Repeat = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export function ruleFor(repeat: Repeat): string {
  return repeat === 'QUARTERLY' ? 'FREQ=MONTHLY;INTERVAL=3' : `FREQ=${repeat};INTERVAL=1`;
}

const UNIT: Record<Frequency, [string, string]> = {
  DAILY: ['Daily', 'days'],
  WEEKLY: ['Weekly', 'weeks'],
  MONTHLY: ['Monthly', 'months'],
  YEARLY: ['Yearly', 'years'],
};

/** "Monthly", "Every 3 months", … */
export function describeRule(rrule: string): string {
  const rule = parseRule(rrule);
  if (rule.freq === 'MONTHLY' && rule.interval === 3) return 'Quarterly';
  const [single, plural] = UNIT[rule.freq];
  return rule.interval === 1 ? single : `Every ${rule.interval} ${plural}`;
}

// ---------------------------------------------------------------------------
// Valuations
// ---------------------------------------------------------------------------

/** The latest row per key, by a "YYYY-MM-DD" date field (ties: later in the list wins). */
export function latestPerKey<T>(rows: T[], key: (row: T) => string, date: (row: T) => string) {
  const latest = new Map<string, T>();
  for (const row of rows) {
    const current = latest.get(key(row));
    if (!current || date(row) >= date(current)) latest.set(key(row), row);
  }
  return latest;
}
