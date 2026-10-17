import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { DATE_LOCALE, Spacing } from '@/constants/theme';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { addDays, BillOccurrence, dayOf, describeRule, formatMoney, localToday, nextDueAfter } from '@/core';
import { confirmTap } from '@/lib/haptics';
import { Bill, CalendarEvent, Task, useDeleteEvent, useDeleteTask, usePayBill, useToggleTask, useUndoBillPayment } from '@/lib/queries';

import { BillMark } from './bill-mark';
import { Button, ConfirmDelete } from './button';
import { Check } from './check';
import { Row } from './screen';
import { StatusLabel } from './status-label';
import { ThemedText } from './themed-text';
import { useToast } from './toast';

const time = new Intl.DateTimeFormat(DATE_LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false });
const weekdayShort = new Intl.DateTimeFormat(DATE_LOCALE, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

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
              if (!done) {
                confirmTap();
                onToggled?.(task.id);
              }
            }}
          />
        }
        title={task.title}
        muted={done}
        subtitle={subtitle}
        trailing={
          done ? (
            <StatusLabel kind="done" day={dayOf(task.completed_at!)} fresh={fresh} />
          ) : overdue ? (
            <StatusLabel kind="overdue" />
          ) : null
        }
        onPress={() => setOpen((o) => !o)}
        accessibilityHint="Shows more options"
      />
      {open ? (
        <RowActions>
          <ConfirmDelete label="Delete task" onConfirm={() => remove.mutate(task.id)} loading={remove.isPending} />
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
        trailing={live ? <View style={[styles.liveDot, { backgroundColor: theme.todayMark }]} /> : null}
        onPress={() => setOpen((o) => !o)}
        accessibilityHint="Shows more options"
      />
      {open ? (
        <RowActions>
          <ConfirmDelete label="Delete event" onConfirm={() => remove.mutate(event.id)} loading={remove.isPending} />
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
  const undo = useUndoBillPayment();
  const toast = useToast();
  const today = localToday();
  const income = bill.type === 'income';
  const payable = occurrence.status !== 'paid' && occurrence.day === bill.next_due_on;
  const status =
    occurrence.status === 'paid' ? (
      <StatusLabel kind="paid" label={income ? 'Received' : 'Paid'} day={fresh ? today : undefined} fresh={fresh} />
    ) : occurrence.status === 'overdue' ? (
      <StatusLabel kind="overdue" day={occurrence.day} />
    ) : occurrence.status === 'due' ? (
      <StatusLabel kind="due" label="Due today" />
    ) : (
      <StatusLabel kind="scheduled" label="Due" day={occurrence.day} />
    );

  return (
    <View style={styles.bill}>
      <View style={styles.billTop}>
        <View style={styles.billMark}>
          <BillMark />
        </View>
        <View style={styles.billText}>
          <ThemedText numberOfLines={1}>{bill.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {bill.account.name} · {describeRule(bill.recurrence_rule)}
          </ThemedText>
        </View>
        <ThemedText type="defaultBold" numeric themeColor={income ? 'positive' : 'text'}>
          {income ? '+' : '−'}
          {formatMoney(bill.amount_minor, bill.account.currency)}
        </ThemedText>
      </View>
      <View style={styles.billBottom}>
        {status}
        {payable ? (
          <Button
            label={income ? 'Mark received' : 'Mark paid'}
            compact
            variant="plain"
            icon="check"
            loading={pay.isPending}
            onPress={() => {
              const next_due = nextDueAfter(bill, occurrence.day);
              pay.mutate(
                { bill, due_on: occurrence.day, paid_on: today, next_due },
                {
                  onSuccess: (transaction_id) => {
                    confirmTap();
                    onPaid?.(`${bill.id}:${occurrence.day}`);
                    toast({
                      message: `${bill.name} ${income ? 'received' : 'paid'}`,
                      action: {
                        label: 'Undo',
                        onPress: () =>
                          undo.mutate(
                            { transaction_id, bill_id: bill.id, due_on: occurrence.day, next_due },
                            { onError: (e) => toast({ message: e.message }) },
                          ),
                      },
                    });
                  },
                },
              );
            }}
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
  bill: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, gap: 10 },
  billTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  billMark: { width: 28, paddingTop: 3, alignItems: 'center' },
  billText: { flex: 1, gap: 2 },
  billBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three, minHeight: 40, paddingLeft: 44 },
  add: { paddingHorizontal: Spacing.three, paddingVertical: 14 },
  pressed: { opacity: 0.6 },
});
