import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/button';
import { ChipGroup, Field, TextField } from '@/components/form';
import { Card, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { CURRENCIES, Currency, parseAmount } from '@/core';
import { useTheme } from '@/hooks/use-theme';
import { NewAccount, useCreateAccount, useWorkspace } from '@/lib/queries';

const TYPES = [
  { value: 'bank', label: 'Bank' },
  { value: 'cash', label: 'Cash' },
  { value: 'ewallet', label: 'E-wallet' },
  { value: 'credit', label: 'Credit card' },
  { value: 'savings', label: 'Savings' },
] as const;

export default function NewAccountScreen() {
  const theme = useTheme();
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
    if (!workspace || openingMinor === null) return;
    create.mutate(
      {
        workspace_id: workspace.id,
        name: name.trim(),
        type,
        currency: chosenCurrency,
        opening_balance_minor: openingMinor,
      },
      { onSuccess: () => router.back() },
    );
  }

  return (
    <Screen title="New account">
      <Card>
        <Field label="Name">
          <TextField value={name} onChangeText={setName} placeholder="e.g. BCA, Revolut" autoFocus />
        </Field>
        <Field label="Type">
          <ChipGroup options={TYPES} value={type} onChange={setType} />
        </Field>
        <Field label="Currency">
          <ChipGroup
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            value={chosenCurrency}
            onChange={setCurrency}
          />
        </Field>
        <Field label="Current balance">
          <TextField
            value={opening}
            onChangeText={setOpening}
            placeholder="0"
            keyboardType="decimal-pad"
            onSubmitEditing={save}
          />
        </Field>
        {create.error ? (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {create.error.message}
          </ThemedText>
        ) : null}
        <Button label="Save account" onPress={save} disabled={!valid} loading={create.isPending} />
        <Button label="Cancel" variant="plain" onPress={() => router.back()} />
      </Card>
    </Screen>
  );
}
