import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { AmountField, ChipGroup, closeForm, DayField, Field, FormScreen, TextField } from '@/components/form';
import { DATE_LOCALE } from '@/constants/theme';
import { describeRule, firstDueDay, isDay, localToday, parseAmount, Repeat, ruleFor } from '@/core';
import { useAccountBalances, useCategories, useCreateBill, useWorkspace } from '@/lib/queries';

const REPEATS: { value: Repeat; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const longDay = new Intl.DateTimeFormat(DATE_LOCALE, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

/** A bill (or a regular income) that repeats; it appears on Today when due. */
export default function NewBillScreen() {
  const { data: workspace } = useWorkspace();
  const { data: accounts = [] } = useAccountBalances();
  const { data: categories = [] } = useCategories();
  const create = useCreateBill();
  const today = localToday();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [repeat, setRepeat] = useState<Repeat>('MONTHLY');
  const [startsOn, setStartsOn] = useState(today);

  const account = accounts.find((a) => a.account_id === (accountId ?? accounts[0]?.account_id));
  const amountMinor = account ? parseAmount(amount, account.currency) : null;
  const rule = ruleFor(repeat);
  const firstDue = isDay(startsOn) ? firstDueDay(startsOn, rule, today) : null;
  const valid = Boolean(workspace && account && name.trim() && amountMinor && amountMinor > 0 && firstDue);

  function save() {
    if (!valid || !workspace || !account || !amountMinor) return;
    create.mutate(
      {
        workspace_id: workspace.id,
        name: name.trim(),
        type,
        account_id: account.account_id,
        category_id: categoryId,
        amount_minor: amountMinor,
        starts_on: startsOn,
        recurrence_rule: rule,
        next_due_on: firstDue,
      },
      { onSuccess: closeForm },
    );
  }

  return (
    <FormScreen
      title={type === 'income' ? 'New regular income' : 'New bill'}
      onSave={save}
      canSave={valid}
      saving={create.isPending}
      error={create.error?.message}
      saveLabel={type === 'income' ? 'Add income' : 'Add bill'}>
      <ChipGroup
        options={[
          { value: 'expense', label: 'Bill' },
          { value: 'income', label: 'Regular income' },
        ]}
        value={type}
        onChange={(t) => {
          setType(t);
          setCategoryId(null);
        }}
      />
      <Field label="Name">
        <TextField value={name} onChangeText={setName} placeholder={type === 'income' ? 'e.g. Monthly retainer' : 'e.g. Rent, internet'} autoFocus />
      </Field>
      <Field label="Amount">
        <AmountField currency={account?.currency ?? 'IDR'} value={amount} onChangeText={setAmount} />
      </Field>
      <Field label={type === 'income' ? 'Paid into' : 'Paid from'}>
        <ChipGroup
          options={accounts.map((a) => ({ value: a.account_id, label: `${a.name} · ${a.currency}` }))}
          value={account?.account_id ?? null}
          onChange={setAccountId}
        />
      </Field>
      <Field label="Category">
        <ChipGroup
          options={categories.filter((c) => c.kind === type).map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId}
          onChange={setCategoryId}
        />
      </Field>
      <Field label="Repeats">
        <ChipGroup options={REPEATS} value={repeat} onChange={setRepeat} />
      </Field>
      <Field label="First due on">
        <DayField value={startsOn} onChange={setStartsOn} />
      </Field>
      {firstDue ? (
        <ThemedText type="small" themeColor="textSecondary">
          {describeRule(rule)}. Next due {longDay.format(new Date(`${firstDue}T00:00:00Z`))}. Earlier dates are not counted as
          overdue.
        </ThemedText>
      ) : null}
    </FormScreen>
  );
}
