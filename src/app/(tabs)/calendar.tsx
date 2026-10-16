import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BillRow, EventRow, TaskRow } from '@/components/agenda-rows';
import { Button, IconButton } from '@/components/button';
import { SampleNotice } from '@/components/sample-notice';
import { EmptyState, Screen, Section, Sheet } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { FontFiles, Spacing } from '@/constants/theme';
import {
  addDays,
  addMonths,
  billOccurrences,
  BillOccurrence,
  dayOf,
  dayRange,
  localToday,
  magnitude,
  monthGrid,
} from '@/core';
import { useTheme } from '@/hooks/use-theme';
import { Bill, CalendarEvent, Task, useBills, useEvents, useTasks } from '@/lib/queries';

const monthName = new Intl.DateTimeFormat(undefined, { month: 'long', timeZone: 'UTC' });
const fullDay = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const narrowWeekday = new Intl.DateTimeFormat(undefined, { weekday: 'short', timeZone: 'UTC' });
const accessibleDay = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', timeZone: 'UTC' });

const utc = (day: string) => new Date(`${day}T00:00:00Z`);

/** Monday to Sunday labels, from a known Monday. */
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => narrowWeekday.format(utc(addDays('2026-10-19', i))));

/** Dot diameter for each magnitude step (0 = no dot). */
const DOT = [0, 5, 8, 11] as const;

type DayEntries = { events: CalendarEvent[]; tasks: Task[]; bills: { bill: Bill; occurrence: BillOccurrence }[] };

export default function CalendarScreen() {
  const theme = useTheme();
  const today = localToday();
  const [month, setMonth] = useState(addMonths(today, 0));
  const [selected, setSelected] = useState(today);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const markFresh = (key: string) => setFresh((s) => new Set(s).add(key));

  const weeks = useMemo(() => monthGrid(month), [month]);
  const first = weeks[0][0];
  const last = weeks.at(-1)!.at(-1)!;
  const events = useEvents(dayRange(first).from, dayRange(last).to);
  const tasks = useTasks();
  const bills = useBills();

  const byDay = useMemo(() => {
    const map = new Map<string, DayEntries>();
    const entry = (day: string) => {
      let e = map.get(day);
      if (!e) map.set(day, (e = { events: [], tasks: [], bills: [] }));
      return e;
    };
    for (const ev of events.data ?? []) {
      // Multi-day events appear on every day they cover within the grid.
      for (let d = dayOf(ev.starts_at); d <= dayOf(ev.ends_at) && d <= last; d = addDays(d, 1)) {
        if (d >= first && !(ev.all_day && d === dayOf(ev.ends_at) && d !== dayOf(ev.starts_at))) entry(d).events.push(ev);
      }
    }
    for (const t of tasks.data ?? []) {
      if (t.due_at) {
        const d = dayOf(t.due_at);
        if (d >= first && d <= last) entry(d).tasks.push(t);
      }
    }
    for (const bill of bills.data ?? []) {
      for (const occurrence of billOccurrences(bill, first, last, today)) entry(occurrence.day).bills.push({ bill, occurrence });
    }
    return map;
  }, [events.data, tasks.data, bills.data, first, last, today]);

  const day = byDay.get(selected) ?? { events: [], tasks: [], bills: [] };
  const empty = !day.events.length && !day.tasks.length && !day.bills.length;
  const shownMonth = utc(month);

  function go(offset: number) {
    const next = addMonths(month, offset);
    setMonth(next);
    setSelected(next.slice(0, 7) === today.slice(0, 7) ? today : next);
  }

  return (
    <Screen
      title="Calendar"
      actions={
        <>
          <IconButton icon="chevron-left" label="Previous month" onCover onPress={() => go(-1)} />
          <IconButton icon="chevron-right" label="Next month" onCover onPress={() => go(1)} />
        </>
      }
      cover={
        <View style={styles.cover}>
          <ThemedText type="display" themeColor="coverText">
            {monthName.format(shownMonth)}
          </ThemedText>
          <View style={styles.coverLine}>
            <ThemedText type="heading" themeColor="coverTextSecondary" numeric>
              {shownMonth.getUTCFullYear()}
            </ThemedText>
            {month.slice(0, 7) !== today.slice(0, 7) || selected !== today ? (
              <Button
                label="Back to today"
                variant="cover"
                compact
                onPress={() => {
                  setMonth(addMonths(today, 0));
                  setSelected(today);
                }}
              />
            ) : null}
          </View>
        </View>
      }>
      <SampleNotice />

      <Sheet padded>
        <View style={styles.week}>
          {WEEKDAYS.map((w) => (
            <ThemedText key={w} type="caption" themeColor="textSecondary" style={styles.weekday}>
              {w}
            </ThemedText>
          ))}
        </View>
        {weeks.map((week) => (
          <View key={week[0]} style={styles.week}>
            {week.map((d) => {
              const entries = byDay.get(d);
              const count = entries ? entries.events.length + entries.tasks.length + entries.bills.length : 0;
              const size = DOT[magnitude(count)];
              const inMonth = d.slice(0, 7) === month.slice(0, 7);
              const isToday = d === today;
              const isSelected = d === selected;
              const overdue = entries?.bills.some((b) => b.occurrence.status === 'overdue') ||
                entries?.tasks.some((t) => !t.completed_at && d < today);
              return (
                <Pressable
                  key={d}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${accessibleDay.format(utc(d))}${isToday ? ', today' : ''}, ${count} ${count === 1 ? 'entry' : 'entries'}`}
                  onPress={() => {
                    setSelected(d);
                    if (!inMonth) setMonth(addMonths(d, 0));
                  }}
                  style={({ hovered }) => [
                    styles.cell,
                    hovered && !isSelected && { backgroundColor: theme.background },
                    isSelected && { borderColor: theme.accent, backgroundColor: theme.background },
                  ]}>
                  <View style={[styles.numeral, isToday && { backgroundColor: theme.cover }]}>
                    <ThemedText
                      numeric
                      style={[
                        styles.numeralText,
                        { color: isToday ? theme.gold : inMonth ? theme.text : theme.textSecondary },
                        !inMonth && styles.outside,
                      ]}>
                      {Number(d.slice(8))}
                    </ThemedText>
                  </View>
                  <View style={styles.dotSlot}>
                    {size ? (
                      <View
                        style={{
                          width: size,
                          height: size,
                          borderRadius: size / 2,
                          backgroundColor: overdue ? theme.stampRed : inMonth ? theme.accent : theme.textSecondary,
                        }}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
        <View style={styles.legend} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {[1, 2, 4].map((n, i) => (
            <View key={n} style={styles.legendItem}>
              <View style={{ width: DOT[i + 1], height: DOT[i + 1], borderRadius: 6, backgroundColor: theme.accent }} />
              <ThemedText type="caption" themeColor="textSecondary">
                {n === 1 ? '1 entry' : n === 2 ? '2 to 3' : '4 or more'}
              </ThemedText>
            </View>
          ))}
          <View style={styles.legendItem}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.stampRed }} />
            <ThemedText type="caption" themeColor="textSecondary">
              Something overdue
            </ThemedText>
          </View>
        </View>
      </Sheet>

      <Section
        title={selected === today ? `Today, ${accessibleDay.format(utc(selected))}` : fullDay.format(utc(selected))}
        action={{ label: 'New event', onPress: () => router.push({ pathname: '/new-event', params: { day: selected } }) }}>
        {empty ? (
          <EmptyState action={{ label: 'Add an event on this day', onPress: () => router.push({ pathname: '/new-event', params: { day: selected } }) }}>
            Nothing planned. Events, tasks and bills due on this day appear here.
          </EmptyState>
        ) : null}
        {day.events.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
        {day.tasks.map((t) => (
          <TaskRow key={t.id} task={t} fresh={fresh.has(t.id)} onToggled={markFresh} />
        ))}
        {day.bills.map(({ bill, occurrence }) => {
          const key = `${bill.id}:${occurrence.day}`;
          return <BillRow key={key} bill={bill} occurrence={occurrence} fresh={fresh.has(key)} onPaid={markFresh} />;
        })}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: { gap: Spacing.one, marginTop: Spacing.three },
  coverLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three, minHeight: 36 },
  week: { flexDirection: 'row', gap: Spacing.one },
  weekday: { flex: 1, textAlign: 'center' },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 64,
  },
  numeral: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  numeralText: { fontFamily: FontFiles.bold, fontSize: 18, lineHeight: 22 },
  outside: { fontFamily: FontFiles.medium },
  dotSlot: { height: 14, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, paddingTop: Spacing.one },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
});
