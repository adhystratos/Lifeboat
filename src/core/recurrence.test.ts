import { describe, expect, it } from 'vitest';

import { nextOccurrence, occurrencesBetween, parseRule } from './recurrence';

describe('recurrence', () => {
  it('parses a rule', () => {
    expect(parseRule('RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=3')).toEqual({
      freq: 'WEEKLY',
      interval: 2,
      count: 3,
      until: undefined,
    });
    expect(() => parseRule('FREQ=HOURLY')).toThrow();
  });

  it('expands weekly occurrences within a window', () => {
    expect(occurrencesBetween('2026-10-01', 'FREQ=WEEKLY', '2026-10-05', '2026-10-31')).toEqual([
      '2026-10-08',
      '2026-10-15',
      '2026-10-22',
      '2026-10-29',
    ]);
  });

  it('clamps monthly bills on the 31st to the end of shorter months', () => {
    expect(occurrencesBetween('2026-01-31', 'FREQ=MONTHLY', '2026-01-01', '2026-04-30')).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ]);
  });

  it('respects COUNT and UNTIL', () => {
    expect(occurrencesBetween('2026-01-01', 'FREQ=DAILY;COUNT=2', '2026-01-01', '2026-12-31')).toHaveLength(2);
    expect(nextOccurrence('2026-01-15', 'FREQ=MONTHLY;UNTIL=20260320', '2026-03-16')).toBeNull();
    expect(nextOccurrence('2026-01-15', 'FREQ=MONTHLY', '2026-03-16')).toBe('2026-04-15');
  });

  it('handles leap-day yearly events', () => {
    expect(occurrencesBetween('2024-02-29', 'FREQ=YEARLY', '2025-01-01', '2028-12-31')).toEqual([
      '2025-02-28',
      '2026-02-28',
      '2027-02-28',
      '2028-02-29',
    ]);
  });
});
