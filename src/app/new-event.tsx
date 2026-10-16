import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChipGroup, closeForm, DayField, Field, FormScreen, isDay, TextField } from '@/components/form';
import { Spacing } from '@/constants/theme';
import { addDays, dayRange, localDateTime, localToday } from '@/core';
import { useCreateEvent, useWorkspace } from '@/lib/queries';

export default function NewEventScreen() {
  const params = useLocalSearchParams<{ day?: string }>();
  const { data: workspace } = useWorkspace();
  const create = useCreateEvent();
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(params.day && isDay(params.day) ? params.day : localToday());
  const [allDay, setAllDay] = useState<'timed' | 'allday'>('timed');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');
  const [location, setLocation] = useState('');

  let startsAt: string | null = null;
  let endsAt: string | null = null;
  if (isDay(day)) {
    if (allDay === 'allday') {
      startsAt = dayRange(day).from;
      endsAt = dayRange(day).to;
    } else {
      startsAt = localDateTime(day, start);
      // An end time earlier than the start means the event runs past midnight.
      const sameDayEnd = localDateTime(day, end);
      endsAt = sameDayEnd && startsAt && sameDayEnd < startsAt ? localDateTime(addDays(day, 1), end) : sameDayEnd;
    }
  }
  const valid = Boolean(workspace && title.trim() && startsAt && endsAt && endsAt > startsAt);

  function save() {
    if (!valid || !workspace || !startsAt || !endsAt) return;
    create.mutate(
      {
        workspace_id: workspace.id,
        title: title.trim(),
        starts_at: startsAt,
        ends_at: endsAt,
        all_day: allDay === 'allday',
        location: location.trim() || null,
      },
      { onSuccess: closeForm },
    );
  }

  return (
    <FormScreen title="New event" onSave={save} canSave={valid} saving={create.isPending} error={create.error?.message} saveLabel="Add event">
      <Field label="Title">
        <TextField value={title} onChangeText={setTitle} placeholder="e.g. Consecutive session, Ministry of Trade" autoFocus />
      </Field>
      <Field label="Day">
        <DayField value={day} onChange={setDay} />
      </Field>
      <Field label="Time">
        <ChipGroup
          options={[
            { value: 'timed', label: 'Set times' },
            { value: 'allday', label: 'All day' },
          ]}
          value={allDay}
          onChange={setAllDay}
        />
      </Field>
      {allDay === 'timed' ? (
        <View style={styles.times}>
          <View style={styles.time}>
            <Field label="Starts">
              <TextField value={start} onChangeText={setStart} placeholder="HH:MM" keyboardType="numbers-and-punctuation" />
            </Field>
          </View>
          <View style={styles.time}>
            <Field label="Ends">
              <TextField value={end} onChangeText={setEnd} placeholder="HH:MM" keyboardType="numbers-and-punctuation" />
            </Field>
          </View>
        </View>
      ) : null}
      <Field label="Place">
        <TextField value={location} onChangeText={setLocation} placeholder="Optional" onSubmitEditing={save} />
      </Field>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  times: { flexDirection: 'row', gap: Spacing.three },
  time: { flex: 1 },
});
