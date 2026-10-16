import { useState } from 'react';

import { AmountField, ChipGroup, closeForm, Field, FormScreen, TextField } from '@/components/form';
import { CURRENCIES, Currency, localToday, parseAmount } from '@/core';
import { LIABILITY_TYPES } from '@/lib/labels';
import { LiabilityType, useCreateLiability, useWorkspace } from '@/lib/queries';

const RATE = /^\d{1,2}([.,]\d{1,3})?$/;

export default function NewLiabilityScreen() {
  const { data: workspace } = useWorkspace();
  const create = useCreateLiability();
  const [name, setName] = useState('');
  const [type, setType] = useState<LiabilityType>('mortgage');
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');

  const chosen = currency ?? workspace?.base_currency ?? 'IDR';
  const balanceMinor = parseAmount(balance, chosen);
  const rateOk = !rate.trim() || RATE.test(rate.trim());
  const valid = Boolean(workspace && name.trim() && balanceMinor !== null && balanceMinor >= 0 && rateOk);

  function save() {
    if (!valid || !workspace || balanceMinor === null) return;
    create.mutate(
      {
        workspace_id: workspace.id,
        name: name.trim(),
        type,
        currency: chosen,
        interest_rate: rate.trim() ? Number(rate.trim().replace(',', '.')) : null,
        balance_minor: balanceMinor,
        as_of: localToday(),
      },
      { onSuccess: closeForm },
    );
  }

  return (
    <FormScreen title="New debt" onSave={save} canSave={valid} saving={create.isPending} error={create.error?.message} saveLabel="Add debt">
      <Field label="Name">
        <TextField value={name} onChangeText={setName} placeholder="e.g. Mortgage, BCA card" autoFocus />
      </Field>
      <Field label="Kind">
        <ChipGroup options={LIABILITY_TYPES} value={type} onChange={setType} />
      </Field>
      <Field label="Currency">
        <ChipGroup options={CURRENCIES.map((c) => ({ value: c, label: c }))} value={chosen} onChange={setCurrency} />
      </Field>
      <Field label="Amount still owed" hint="Update it from the Net worth screen whenever you get a statement.">
        <AmountField currency={chosen} value={balance} onChangeText={setBalance} />
      </Field>
      <Field label="Interest rate per year (%)" hint={rateOk ? 'Optional, for your reference.' : 'Use a number like 7.25'}>
        <TextField value={rate} onChangeText={setRate} placeholder="Optional" keyboardType="decimal-pad" onSubmitEditing={save} />
      </Field>
    </FormScreen>
  );
}
