import { describe, expect, it } from 'vitest';

import {
  addDays,
  addMonths,
  billListStart,
  billOccurrences,
  dayRange,
  describeRule,
  eventLastDay,
  eventOnDay,
  firstDueDay,
  isDay,
  latestPerKey,
  localDateTime,
  magnitude,
  monthGrid,
  nextDueAfter,
  ruleFor,
  weekdayIndex,
} from './agenda';

describe('calendar days', () => {
  it('adds days and months across boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addMonths('2026-10-17', 1)).toBe('2026-11-01');
    expect(addMonths('2026-01-31', -1)).toBe('2025-12-01');
  });

  it('numbers weekdays from Monday', () => {
    expect(weekdayIndex('2026-10-19')).toBe(0); // Monday
    expect(weekdayIndex('2026-10-18')).toBe(6); // Sunday
  });

  it('builds Monday-first month grids with full weeks', () => {
    const grid = monthGrid('2026-10-17');
    expect(grid[0][0]).toBe('2026-09-28');
    expect(grid[0][3]).toBe('2026-10-01');
    expect(grid.at(-1)?.at(-1)).toBe('2026-11-01');
    expect(grid.every((week) => week.length === 7)).toBe(true);
    expect(grid).toHaveLength(5);
  });

  it('ramps dot size in fixed steps', () => {
    expect([0, 1, 2, 3, 4, 9].map(magnitude)).toEqual([0, 1, 2, 2, 3, 3]);
  });

  it('parses local times', () => {
    const iso = localDateTime('2026-10-17', '9:30');
    expect(iso && new Date(iso).getHours()).toBe(9);
    expect(iso && new Date(iso).getMinutes()).toBe(30);
    expect(localDateTime('2026-10-17', '24:00')).toBeNull();
    expect(localDateTime('2026-10-17', 'noon')).toBeNull();
  });

  it('accepts only real calendar days', () => {
    expect(isDay('2026-10-17')).toBe(true);
    expect(isDay('2028-02-29')).toBe(true);
    expect(['2026-02-29', '2026-02-31', '2026-13-01', '2026-1-5', ''].some(isDay)).toBe(false);
  });

  it('keeps an event that ends at midnight on its own day', () => {
    const allDay = dayRange('2026-10-26');
    expect(eventLastDay(allDay.from, allDay.to)).toBe('2026-10-26');
    expect(eventOnDay(allDay.from, allDay.to, '2026-10-26')).toBe(true);
    expect(eventOnDay(allDay.from, allDay.to, '2026-10-27')).toBe(false);
    expect(eventLastDay(allDay.from, allDay.from)).toBe('2026-10-26');

    const late = localDateTime('2026-10-26', '22:00')!;
    const early = localDateTime('2026-10-27', '01:00')!;
    expect(eventOnDay(late, early, '2026-10-27')).toBe(true);
    expect(eventOnDay(late, early, '2026-10-25')).toBe(false);
  });
});

describe('bills', () => {
  const rent = { starts_on: '2026-01-05', recurrence_rule: 'FREQ=MONTHLY', next_due_on: '2026-09-05' };

  it('marks occurrences paid, overdue, due and upcoming', () => {
    expect(billOccurrences(rent, '2026-08-01', '2026-11-30', '2026-10-05')).toEqual([
      { day: '2026-08-05', status: 'paid' },
      { day: '2026-09-05', status: 'overdue' },
      { day: '2026-10-05', status: 'due' },
      { day: '2026-11-05', status: 'upcoming' },
    ]);
  });

  it('treats an ended schedule as fully paid', () => {
    const ended = { ...rent, next_due_on: null };
    expect(billOccurrences(ended, '2026-10-01', '2026-10-31', '2026-10-20')[0].status).toBe('paid');
  });

  it('moves the due date forward after a payment', () => {
    expect(nextDueAfter(rent, '2026-09-05')).toBe('2026-10-05');
    const short = { ...rent, recurrence_rule: 'FREQ=MONTHLY;COUNT=2', next_due_on: '2026-02-05' };
    expect(nextDueAfter(short, '2026-02-05')).toBeNull();
  });

  it('lists a long-overdue bill from its oldest unpaid occurrence', () => {
    const yearly = { starts_on: '2025-06-01', recurrence_rule: 'FREQ=YEARLY', next_due_on: '2026-06-01' };
    const since = addDays('2026-10-17', -90);
    expect(billListStart(yearly, since)).toBe('2026-06-01');
    expect(billOccurrences(yearly, billListStart(yearly, since), '2026-10-24', '2026-10-17')).toEqual([
      { day: '2026-06-01', status: 'overdue' },
    ]);
    expect(billListStart(rent, '2026-08-01')).toBe('2026-08-01');
    expect(billListStart({ ...rent, next_due_on: null }, '2026-08-01')).toBe('2026-08-01');
  });

  it('starts new bills at their next occurrence, not in the past', () => {
    expect(firstDueDay('2026-01-05', 'FREQ=MONTHLY', '2026-10-17')).toBe('2026-11-05');
    expect(firstDueDay('2026-12-01', 'FREQ=MONTHLY', '2026-10-17')).toBe('2026-12-01');
  });

  it('builds and describes rules', () => {
    expect(ruleFor('QUARTERLY')).toBe('FREQ=MONTHLY;INTERVAL=3');
    expect(describeRule(ruleFor('QUARTERLY'))).toBe('Quarterly');
    expect(describeRule(ruleFor('MONTHLY'))).toBe('Monthly');
    expect(describeRule('FREQ=WEEKLY;INTERVAL=2')).toBe('Every 2 weeks');
  });
});

describe('valuations', () => {
  it('keeps the latest row per key', () => {
    const rows = [
      { id: 'a', on: '2026-01-01', v: 1 },
      { id: 'a', on: '2026-06-01', v: 2 },
      { id: 'b', on: '2026-03-01', v: 3 },
      { id: 'a', on: '2026-02-01', v: 4 },
    ];
    const latest = latestPerKey(rows, (r) => r.id, (r) => r.on);
    expect(latest.get('a')?.v).toBe(2);
    expect(latest.get('b')?.v).toBe(3);
  });
});
