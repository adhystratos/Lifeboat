import { useState } from 'react';

import { ChipGroup, closeForm, DayField, Field, FormScreen, isDay, TextField } from '@/components/form';
import { localDateTime, localToday } from '@/core';
import { useCreateTask, useWorkspace } from '@/lib/queries';

type When = 'day' | 'none';

export default function NewTaskScreen() {
  const { data: workspace } = useWorkspace();
  const create = useCreateTask();
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState<When>('day');
  const [day, setDay] = useState(localToday());
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  // Without a time, a task is due at the end of its day.
  const dueAt = when === 'none' ? null : isDay(day) ? localDateTime(day, time.trim() || '23:59') : undefined;
  const valid = Boolean(workspace && title.trim() && dueAt !== undefined && (when === 'none' || dueAt));

  function save() {
    if (!valid || !workspace || dueAt === undefined) return;
    create.mutate(
      { workspace_id: workspace.id, title: title.trim(), due_at: dueAt, notes: notes.trim() || null },
      { onSuccess: closeForm },
    );
  }

  return (
    <FormScreen title="New task" onSave={save} canSave={valid} saving={create.isPending} error={create.error?.message} saveLabel="Add task">
      <Field label="What needs doing">
        <TextField value={title} onChangeText={setTitle} placeholder="e.g. Send the invoice" autoFocus onSubmitEditing={save} />
      </Field>
      <Field label="When">
        <ChipGroup
          options={[
            { value: 'day', label: 'On a day' },
            { value: 'none', label: 'No date' },
          ]}
          value={when}
          onChange={setWhen}
        />
      </Field>
      {when === 'day' ? (
        <>
          <Field label="Day">
            <DayField value={day} onChange={setDay} />
          </Field>
          <Field label="Time" hint="Optional, 24-hour, like 14:30. Without a time it is due by the end of the day.">
            <TextField value={time} onChangeText={setTime} placeholder="HH:MM" keyboardType="numbers-and-punctuation" />
          </Field>
        </>
      ) : null}
      <Field label="Notes">
        <TextField value={notes} onChangeText={setNotes} placeholder="Optional" multiline style={{ minHeight: 80, paddingTop: 12 }} />
      </Field>
    </FormScreen>
  );
}
