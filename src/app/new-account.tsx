import { useState } from 'react';

import { AmountField, ChipGroup, closeForm, Field, FormScreen, TextField } from '@/components/form';
import { CURRENCIES, Currency, parseAmount } from '@/core';
import { ACCOUNT_TYPES } from '@/lib/labels';
import { NewAccount, useCreateAccount, useWorkspace } from '@/lib/queries';

export default function NewAccountScreen() {
  const { data: workspace } = useWorkspace();
  const create = useCreateAccount();
  const [name, setName] = useState('');
  const [type, setType] = useState<NewAccount['type']>('bank');
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [opening, setOpening] = useState('');

  const chosenCurrency = currency ?? workspace?.base_currency ?? 'IDR';
  const openingMinor = opening.trim() ? parseAmount(opening, chosenCurrency) : 0;
  const valid = Boolean(workspace && name.trim() && openingMinor !== null);

  function save() {
    if (!valid || !workspace || openingMinor === null) return;
    create.mutate(
      {
        workspace_id: workspace.id,
        name: name.trim(),
        type,
        currency: chosenCurrency,
        opening_balance_minor: openingMinor,
      },
      { onSuccess: closeForm },
    );
  }

  return (
    <FormScreen title="New account" onSave={save} canSave={valid} saving={create.isPending} error={create.error?.message} saveLabel="Add account">
      <Field label="Name">
        <TextField value={name} onChangeText={setName} placeholder="e.g. BCA, Revolut" autoFocus />
      </Field>
      <Field label="Type">
        <ChipGroup options={ACCOUNT_TYPES} value={type} onChange={setType} />
      </Field>
      <Field label="Currency">
        <ChipGroup options={CURRENCIES.map((c) => ({ value: c, label: c }))} value={chosenCurrency} onChange={setCurrency} />
      </Field>
      <Field label="Current balance" hint="What the account holds today. Transactions you add move it from here.">
        <AmountField currency={chosenCurrency} value={opening} onChangeText={setOpening} onSubmitEditing={save} />
      </Field>
    </FormScreen>
  );
}
