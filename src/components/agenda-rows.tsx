import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { addDays, BillOccurrence, dayOf, describeRule, formatMoney, localToday, nextDueAfter } from '@/core';
import { Bill, CalendarEvent, Task, useDeleteEvent, useDeleteTask, usePayBill, useToggleTask } from '@/lib/queries';

import { Button } from './button';
import { Check } from './check';
import { Row } from './screen';
import { Stamp } from './stamp';
import { ThemedText } from './themed-text';

const time = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
const weekdayShort = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

export function timeOf(iso: string): string {
  return time.format(new Date(iso));
}

/** "Today", "Yesterday", "Tomorrow" or "Mon 20 Oct". */
export function relativeDay(day: string, today = localToday()): string {
  if (day === today) return 'Today';
  if (day === addDays(today, -1)) return 'Yesterday';
  if (day === addDays(today, 1)) return 'Tomorrow';
  return weekdayShort.format(new Date(`${day}T00:00:00Z`));
}

/** Tasks without a set time are stored as due at 23:59 local time. */
export function isEndOfDay(iso: string): boolean {
  const d = new Date(iso);
  return d.getHours() === 23 && d.getMinutes() === 59;
}

export function TaskRow({ task, fresh, onToggled }: { task: Task; fresh?: boolean; onToggled?: (id: string) => void }) {
  const toggle = useToggleTask();
  const remove = useDeleteTask();
  const [open, setOpen] = useState(false);
  const today = localToday();
  const done = Boolean(task.completed_at);
  const dueDay = task.due_at ? dayOf(task.due_at) : null;
  const overdue = !done && dueDay !== null && dueDay < today;

  const subtitle = task.due_at
    ? [
        relativeDay(dueDay!, today),
        isEndOfDay(task.due_at) ? null : timeOf(task.due_at),
      ]
        .filter(Boolean)
        .join(', ')
    : 'No date';

  return (
    <View>
      <Row
        leading={
          <Check
            checked={done}
            label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
            onToggle={() => {
              toggle.mutate({ id: task.id, completedAt: done ? null : new Date().toISOString() });
              if (!done) onToggled?.(task.id);
            }}
          />
        }
        title={task.title}
        muted={done}
        subtitle={subtitle}
        trailing={
          done ? (
            <Stamp kind="done" day={dayOf(task.completed_at!)} fresh={fresh} />
          ) : overdue ? (
            <Stamp kind="overdue" />
          ) : null
        }
        onPress={() => setOpen((o) => !o)}
        accessibilityHint="Shows more options"
      />
      {open ? (
        <RowActions>
          <Button label="Delete task" variant="danger" compact icon="trash-2" onPress={() => remove.mutate(task.id)} loading={remove.isPending} />
        </RowActions>
      ) : null}
    </View>
  );
}

export function EventRow({ event }: { event: CalendarEvent }) {
  const theme = useTheme();
  const now = useNow();
  const remove = useDeleteEvent();
  const [open, setOpen] = useState(false);
  const past = new Date(event.ends_at).getTime() < now;
  const live = !past && new Date(event.starts_at).getTime() <= now;
  return (
    <View>
      <Row
        leading={
          <View style={styles.timeCol}>
            {event.all_day ? (
              <ThemedText type="caption" themeColor="textSecondary">
                All day
              </ThemedText>
            ) : (
              <>
                <ThemedText type="smallBold" numeric themeColor={past ? 'textSecondary' : 'text'}>
                  {timeOf(event.starts_at)}
                </ThemedText>
                <ThemedText type="caption" numeric themeColor="textSecondary">
                  {timeOf(event.ends_at)}
                </ThemedText>
              </>
            )}
          </View>
        }
        title={event.title}
        muted={past}
        subtitle={[live ? 'Happening now' : null, event.location].filter(Boolean).join(' · ') || undefined}
        trailing={live ? <View style={[styles.liveDot, { backgroundColor: theme.stampViolet }]} /> : null}
        onPress={() => setOpen((o) => !o)}
        accessibilityHint="Shows more options"
      />
      {open ? (
        <RowActions>
          <Button label="Delete event" variant="danger" compact icon="trash-2" onPress={() => remove.mutate(event.id)} loading={remove.isPending} />
        </RowActions>
      ) : null}
    </View>
  );
}

/**
 * One occurrence of a bill. Unpaid occurrences offer "Mark paid", which
 * records the transaction and moves the schedule forward in one step.
 */
export function BillRow({
  bill,
  occurrence,
  fresh,
  onPaid,
}: {
  bill: Bill;
  occurrence: BillOccurrence;
  fresh?: boolean;
  onPaid?: (key: string) => void;
}) {
  const pay = usePayBill();
  const today = localToday();
  const income = bill.type === 'income';
  const payable = occurrence.status !== 'paid' && occurrence.day === bill.next_due_on;
  const stamp =
    occurrence.status === 'paid' ? (
      <Stamp kind="paid" label={income ? 'Received' : 'Paid'} fresh={fresh} />
    ) : occurrence.status === 'overdue' ? (
      <Stamp kind="overdue" day={occurrence.day} />
    ) : occurrence.status === 'due' ? (
      <Stamp kind="due" label="Due today" />
    ) : (
      <Stamp kind="scheduled" label="Due" day={occurrence.day} />
    );

  return (
    <View style={styles.bill}>
      <View style={styles.billTop}>
        <View style={styles.billText}>
          <ThemedText numberOfLines={1}>{bill.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {bill.account.name} · {describeRule(bill.recurrence_rule)}
          </ThemedText>
        </View>
        <ThemedText type="defaultBold" numeric themeColor={income ? 'stampGreen' : 'text'}>
          {income ? '+' : '−'}
          {formatMoney(bill.amount_minor, bill.account.currency)}
        </ThemedText>
      </View>
      <View style={styles.billBottom}>
        {stamp}
        {payable ? (
          <Button
            label={income ? 'Mark received' : 'Mark paid'}
            compact
            variant="plain"
            icon="check"
            loading={pay.isPending}
            onPress={() =>
              pay.mutate(
                {
                  bill,
                  due_on: occurrence.day,
                  paid_on: today,
                  next_due: nextDueAfter(bill, occurrence.day),
                },
                { onSuccess: () => onPaid?.(`${bill.id}:${occurrence.day}`) },
              )
            }
          />
        ) : null}
      </View>
      {pay.error ? (
        <ThemedText type="small" themeColor="danger">
          {pay.error.message}
        </ThemedText>
      ) : null}
    </View>
  );
}

function RowActions({ children }: { children: React.ReactNode }) {
  return <View style={styles.actions}>{children}</View>;
}

/** Wraps a tappable "add" row at the end of a sheet. */
export function AddRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
      <ThemedText type="link">+ {label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  timeCol: { width: 48, alignItems: 'flex-start' },
  liveDot: { width: 10, height: 10, borderRadius: 5 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.three, paddingBottom: Spacing.three },
  bill: { paddingHorizontal: Spacing.three, paddingVertical: 14, gap: Spacing.two },
  billTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  billText: { flex: 1, gap: 2 },
  billBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three, minHeight: 36 },
  add: { paddingHorizontal: Spacing.three, paddingVertical: 14 },
  pressed: { opacity: 0.6 },
});
