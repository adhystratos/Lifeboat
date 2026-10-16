import { useState } from 'react';

import { AmountField, ChipGroup, closeForm, Field, FormScreen, TextField } from '@/components/form';
import { CURRENCIES, Currency, localToday, parseAmount } from '@/core';
import { ASSET_TYPES } from '@/lib/labels';
import { AssetType, useCreateAsset, useWorkspace } from '@/lib/queries';

export default function NewAssetScreen() {
  const { data: workspace } = useWorkspace();
  const create = useCreateAsset();
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('property');
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const chosen = currency ?? workspace?.base_currency ?? 'IDR';
  const valueMinor = parseAmount(value, chosen);
  const valid = Boolean(workspace && name.trim() && valueMinor !== null && valueMinor >= 0);

  function save() {
    if (!valid || !workspace || valueMinor === null) return;
    create.mutate(
      {
        workspace_id: workspace.id,
        name: name.trim(),
        type,
        currency: chosen,
        notes: notes.trim() || null,
        value_minor: valueMinor,
        valued_on: localToday(),
      },
      { onSuccess: closeForm },
    );
  }

  return (
    <FormScreen title="New asset" onSave={save} canSave={valid} saving={create.isPending} error={create.error?.message} saveLabel="Add asset">
      <Field label="Name">
        <TextField value={name} onChangeText={setName} placeholder="e.g. Apartment, gold 25 g" autoFocus />
      </Field>
      <Field label="Kind">
        <ChipGroup options={ASSET_TYPES} value={type} onChange={setType} />
      </Field>
      <Field label="Currency">
        <ChipGroup options={CURRENCIES.map((c) => ({ value: c, label: c }))} value={chosen} onChange={setCurrency} />
      </Field>
      <Field label="What it's worth today" hint="Your best estimate. You can record a new value any time from the Net worth screen.">
        <AmountField currency={chosen} value={value} onChangeText={setValue} />
      </Field>
      <Field label="Notes">
        <TextField value={notes} onChangeText={setNotes} placeholder="Optional" onSubmitEditing={save} />
      </Field>
    </FormScreen>
  );
}
