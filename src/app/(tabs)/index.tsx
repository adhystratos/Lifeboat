import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AddRow, BillRow, EventRow, TaskRow } from '@/components/agenda-rows';
import { IconButton } from '@/components/button';
import { TextField } from '@/components/form';
import { SampleNotice } from '@/components/sample-notice';
import { EmptyState, Row, Screen, Section } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { DATE_LOCALE, Spacing } from '@/constants/theme';
import { addDays, billOccurrences, dayOf, dayRange, localDateTime, localToday } from '@/core';
import { useTheme } from '@/hooks/use-theme';
import { Bill, useBills, useCreateTask, useEvents, useTasks, useWorkspace } from '@/lib/queries';

const weekday = new Intl.DateTimeFormat(DATE_LOCALE, { weekday: 'long' });
const longDate = new Intl.DateTimeFormat(DATE_LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });

/** Bills are listed from overdue up to this many days ahead. */
const BILL_HORIZON = 7;

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
    // Open first, then by due time; done entries keep their place at the bottom with a stamp.
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
      for (const occurrence of billOccurrences(bill, addDays(today, -90), addDays(today, BILL_HORIZON), today)) {
        const key = `${bill.id}:${occurrence.day}`;
        const recentlyPaid = occurrence.status === 'paid' && (fresh.has(key) || occurrence.day >= today);
        if (occurrence.status !== 'paid' || recentlyPaid) items.push({ bill, occurrence });
      }
    }
    return items.sort((a, b) => a.occurrence.day.localeCompare(b.occurrence.day));
  })();

  const openToday = groups.dueToday.filter((t) => !t.completed_at).length;
  const doneToday = groups.dueToday.length - openToday;
  const billsDue = billItems.filter((b) => b.occurrence.status === 'due' || b.occurrence.status === 'overdue').length;
  const overdueCount = groups.overdue.length + billItems.filter((b) => b.occurrence.status === 'overdue').length;
  const eventList = events.data ?? [];

  const summary = [
    `${openToday} ${openToday === 1 ? 'task' : 'tasks'} left`,
    doneToday ? `${doneToday} done` : null,
    `${eventList.length} ${eventList.length === 1 ? 'event' : 'events'}`,
    billsDue ? `${billsDue} ${billsDue === 1 ? 'bill' : 'bills'} due` : null,
  ]
    .filter(Boolean)
    .join(' · ');

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
      actions={<IconButton icon="plus" label="New entry" onCover onPress={() => router.push('/new')} />}
      cover={
        <View style={styles.cover}>
          <ThemedText type="display" themeColor="coverText">
            {weekday.format(now)}
          </ThemedText>
          <ThemedText type="heading" themeColor="coverText">
            {longDate.format(now)}
          </ThemedText>
          <View style={styles.summary}>
            <ThemedText type="default" themeColor="coverTextSecondary">
              {summary}
            </ThemedText>
            {overdueCount ? (
              <ThemedText type="defaultBold" themeColor="coverAlert">
                {overdueCount} overdue
              </ThemedText>
            ) : null}
          </View>
        </View>
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

      <Section title="Tasks" action={{ label: 'New task', onPress: () => router.push('/new-task') }}>
        {tasks.isLoading ? <Loading /> : null}
        {tasks.error ? <EmptyState>Couldn&apos;t load tasks: {tasks.error.message}</EmptyState> : null}
        {!tasks.isLoading && !groups.dueToday.length ? (
          <EmptyState>Nothing due today. Type a task above and press Enter to add one.</EmptyState>
        ) : null}
        {groups.dueToday.map((t) => (
          <TaskRow key={t.id} task={t} fresh={fresh.has(t.id)} onToggled={markFresh} />
        ))}
      </Section>

      <Section title="Schedule" action={{ label: 'Calendar', onPress: () => router.push('/calendar') }}>
        {events.isLoading ? <Loading /> : null}
        {!events.isLoading && !eventList.length ? (
          <EmptyState action={{ label: 'Add an event', onPress: () => router.push('/new-event') }}>
            Your day is open. Events you add appear here in time order.
          </EmptyState>
        ) : null}
        {eventList.map((e) => (
          <EventRow key={e.id} event={e} />
        ))}
      </Section>

      <Section
        title="Bills"
        action={{ label: 'New bill', onPress: () => router.push('/new-bill') }}
        note={billItems.length ? `Overdue and due in the next ${BILL_HORIZON} days.` : undefined}>
        {bills.isLoading ? <Loading /> : null}
        {!bills.isLoading && !billItems.length ? (
          <EmptyState action={{ label: 'Add a bill', onPress: () => router.push('/new-bill') }}>
            No bills due this week. Add rent, subscriptions or a regular income, and they will show up here when due.
          </EmptyState>
        ) : null}
        {billItems.map(({ bill, occurrence }) => {
          const key = `${bill.id}:${occurrence.day}`;
          return <BillRow key={key} bill={bill} occurrence={occurrence} fresh={fresh.has(key)} onPaid={markFresh} />;
        })}
      </Section>

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
  return (
    <Row title="Loading…" muted leading={<ActivityIndicator />} />
  );
}

const styles = StyleSheet.create({
  cover: { gap: Spacing.one, marginTop: Spacing.three },
  summary: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.three, marginTop: Spacing.two },
  quickAdd: { minHeight: 52 },
});
