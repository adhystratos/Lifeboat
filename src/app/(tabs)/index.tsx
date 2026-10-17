import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { AddRow, BillRow, EventRow, TaskRow } from '@/components/agenda-rows';
import { TextField } from '@/components/form';
import { SampleNotice } from '@/components/sample-notice';
import { EmptyState, Row, Screen, Section, TileChip, TileChips } from '@/components/screen';
import { DATE_LOCALE } from '@/constants/theme';
import { addDays, billListStart, billOccurrences, dayOf, dayRange, eventOnDay, localDateTime, localToday } from '@/core';
import { useTheme } from '@/hooks/use-theme';
import { Bill, useBills, useCreateTask, useEvents, useTasks, useWorkspace } from '@/lib/queries';

const longDate = new Intl.DateTimeFormat(DATE_LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });

/** Bills are listed from overdue up to this many days ahead. */
const BILL_HORIZON = 7;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function TodayScreen() {
  const today = localToday();
  const now = new Date();
  const { from, to } = dayRange(today);
  const theme = useTheme();
  const { data: workspace } = useWorkspace();
  const tasks = useTasks();
  const events = useEvents(from, to);
  const bills = useBills();
  const createTask = useCreateTask();
  const [draft, setDraft] = useState('');
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const markFresh = (key: string) => setFresh((s) => new Set(s).add(key));

  const groups = (() => {
    const all = tasks.data ?? [];
    const overdue = all.filter((t) => !t.completed_at && t.due_at && dayOf(t.due_at) < today);
    const dueToday = all.filter(
      (t) =>
        (t.due_at && dayOf(t.due_at) === today) ||
        (t.completed_at && dayOf(t.completed_at) === today && !(t.due_at && dayOf(t.due_at) > today)),
    );
    const anytime = all.filter((t) => !t.due_at && !t.completed_at);
    // Open first, then by due time; done entries keep their place at the bottom with their label.
    dueToday.sort(
      (a, b) =>
        Number(Boolean(a.completed_at)) - Number(Boolean(b.completed_at)) ||
        (a.due_at ?? '').localeCompare(b.due_at ?? ''),
    );
    return { overdue, dueToday, anytime };
  })();

  const billItems = (() => {
    const items: { bill: Bill; occurrence: ReturnType<typeof billOccurrences>[number] }[] = [];
    for (const bill of bills.data ?? []) {
      const from = billListStart(bill, addDays(today, -90));
      for (const occurrence of billOccurrences(bill, from, addDays(today, BILL_HORIZON), today)) {
        const key = `${bill.id}:${occurrence.day}`;
        const recentlyPaid = occurrence.status === 'paid' && (fresh.has(key) || occurrence.day >= today);
        if (occurrence.status !== 'paid' || recentlyPaid) items.push({ bill, occurrence });
      }
    }
    return items.sort((a, b) => a.occurrence.day.localeCompare(b.occurrence.day));
  })();

  const openToday = groups.dueToday.filter((t) => !t.completed_at).length;
  const billsDue = billItems.filter((b) => b.occurrence.status === 'due' || b.occurrence.status === 'overdue').length;
  const overdueCount = groups.overdue.length + billItems.filter((b) => b.occurrence.status === 'overdue').length;
  // The query also returns events that end exactly at midnight, such as yesterday's all-day events.
  const eventList = (events.data ?? []).filter((e) => eventOnDay(e.starts_at, e.ends_at, today));

  const loading = tasks.isLoading || events.isLoading || bills.isLoading;
  // Sections with nothing in them stay out of the way; a fully open day gets one line instead.
  const showTasks = tasks.isLoading || Boolean(tasks.error) || groups.dueToday.length > 0;
  const showSchedule = events.isLoading || eventList.length > 0;
  const showBills = bills.isLoading || billItems.length > 0;
  const nothingToday =
    !loading && !tasks.error && !groups.overdue.length && !showTasks && !showSchedule && !showBills;

  function addTask() {
    const title = draft.trim();
    if (!title || !workspace) return;
    createTask.mutate(
      { workspace_id: workspace.id, title, due_at: localDateTime(today, '23:59') },
      { onSuccess: () => setDraft('') },
    );
  }

  return (
    <Screen
      title="Today"
      subtitle={longDate.format(now)}
      tone="agenda"
      tile={
        loading ? null : (
          <TileChips>
            <TileChip label={`${openToday} to do`} />
            {eventList.length ? <TileChip label={plural(eventList.length, 'event', 'events')} /> : null}
            {billsDue ? <TileChip label={plural(billsDue, 'bill due', 'bills due')} /> : null}
            {overdueCount ? <TileChip label={`${overdueCount} overdue`} alert /> : null}
          </TileChips>
        )
      }>
      <SampleNotice />

      <TextField
        value={draft}
        onChangeText={setDraft}
        placeholder="Add a task for today"
        returnKeyType="done"
        onSubmitEditing={addTask}
        editable={!createTask.isPending}
        accessibilityLabel="New task for today"
        style={[styles.quickAdd, { backgroundColor: theme.backgroundElement }]}
      />

      {groups.overdue.length ? (
        <Section title="Overdue">
          {groups.overdue.map((t) => (
            <TaskRow key={t.id} task={t} fresh={fresh.has(t.id)} onToggled={markFresh} />
          ))}
        </Section>
      ) : null}

      {nothingToday ? (
        <Section>
          <EmptyState action={{ label: 'Add something', onPress: () => router.push('/new') }}>
            Nothing planned today.
          </EmptyState>
        </Section>
      ) : null}

      {showTasks ? (
        <Section title="Tasks" action={{ label: 'New task', onPress: () => router.push('/new-task') }}>
          {tasks.isLoading ? <Loading /> : null}
          {tasks.error ? <EmptyState>Couldn&apos;t load tasks: {tasks.error.message}</EmptyState> : null}
          {groups.dueToday.map((t) => (
            <TaskRow key={t.id} task={t} fresh={fresh.has(t.id)} onToggled={markFresh} />
          ))}
        </Section>
      ) : null}

      {showSchedule ? (
        <Section title="Schedule" action={{ label: 'Calendar', onPress: () => router.push('/calendar') }}>
          {events.isLoading ? <Loading /> : null}
          {eventList.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </Section>
      ) : null}

      {showBills ? (
        <Section
          title="Bills"
          action={{ label: 'New bill', onPress: () => router.push('/new-bill') }}
          note={billItems.length ? `Overdue and due in the next ${BILL_HORIZON} days.` : undefined}>
          {bills.isLoading ? <Loading /> : null}
          {billItems.map(({ bill, occurrence }) => {
            const key = `${bill.id}:${occurrence.day}`;
            return <BillRow key={key} bill={bill} occurrence={occurrence} fresh={fresh.has(key)} onPaid={markFresh} />;
          })}
        </Section>
      ) : null}

      {groups.anytime.length ? (
        <Section title="Anytime">
          {groups.anytime.map((t) => (
            <TaskRow key={t.id} task={t} fresh={fresh.has(t.id)} onToggled={markFresh} />
          ))}
          <AddRow label="Task without a date" onPress={() => router.push('/new-task')} />
        </Section>
      ) : null}
    </Screen>
  );
}

function Loading() {
  return <Row title="Loading…" muted leading={<ActivityIndicator />} />;
}

const styles = StyleSheet.create({
  quickAdd: { minHeight: 52 },
});
