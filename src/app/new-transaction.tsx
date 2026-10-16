import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/button';
import { ChipGroup, Field, TextField } from '@/components/form';
import { Card, EmptyState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { localToday, parseAmount } from '@/core';
import { useTheme } from '@/hooks/use-theme';
import {
  NewTransaction,
  useAccountBalances,
  useCategories,
  useCreateTransaction,
  useWorkspace,
} from '@/lib/queries';

const TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
] as const;

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Quick entry: type, amount, account, category. Everything else is optional. */
export default function NewTransactionScreen() {
  const theme = useTheme();
  const { data: workspace } = useWorkspace();
  const { data: accounts = [] } = useAccountBalances();
  const { data: categories = [] } = useCategories();
  const create = useCreateTransaction();

  const [type, setType] = useState<NewTransaction['type']>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [toAmount, setToAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [day, setDay] = useState(localToday());
  const [note, setNote] = useState('');

  const account = accounts.find((a) => a.account_id === (accountId ?? accounts[0]?.account_id));
  const toAccount = accounts.find((a) => a.account_id === toAccountId);
  const isTransfer = type === 'transfer';
  const crossCurrency = Boolean(isTransfer && account && toAccount && account.currency !== toAccount.currency);

  const amountMinor = account ? parseAmount(amount, account.currency) : null;
  const toAmountMinor = !isTransfer
    ? null
    : crossCurrency && toAccount
      ? parseAmount(toAmount, toAccount.currency)
      : amountMinor;

  const valid = Boolean(
    workspace &&
      account &&
      amountMinor &&
      amountMinor > 0 &&
      DAY.test(day) &&
      (!isTransfer || (toAccount && toAccount.account_id !== account.account_id && toAmountMinor && toAmountMinor > 0)),
  );

  function save() {
    if (!valid || !workspace || !account || !amountMinor) return;
    create.mutate(
      {
        workspace_id: workspace.id,
        account_id: account.account_id,
        type,
        amount_minor: amountMinor,
        category_id: isTransfer ? null : categoryId,
        occurred_on: day,
        note: note.trim() || null,
        transfer_account_id: isTransfer ? toAccount!.account_id : null,
        transfer_amount_minor: isTransfer ? toAmountMinor : null,
      },
      { onSuccess: () => router.back() },
    );
  }

  const accountOptions = accounts.map((a) => ({ value: a.account_id, label: `${a.name} · ${a.currency}` }));
  const categoryOptions = categories
    .filter((c) => c.kind === type)
    .map((c) => ({ value: c.id, label: c.name }));

  return (
    <Screen title="New transaction">
      <Card>
        <ChipGroup
          options={TYPES}
          value={type}
          onChange={(t) => {
            setType(t);
            setCategoryId(null);
          }}
        />
        <Field label={account ? `Amount (${account.currency})` : 'Amount'}>
          <TextField
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="decimal-pad"
            autoFocus
          />
        </Field>
        <Field label={isTransfer ? 'From account' : 'Account'}>
          {accounts.length ? (
            <ChipGroup options={accountOptions} value={account?.account_id ?? null} onChange={setAccountId} />
          ) : (
            <EmptyState>Add an account first.</EmptyState>
          )}
        </Field>
        {isTransfer ? (
          <Field label="To account">
            <ChipGroup
              options={accountOptions.filter((o) => o.value !== account?.account_id)}
              value={toAccountId}
              onChange={setToAccountId}
            />
          </Field>
        ) : (
          <Field label="Category">
            <ChipGroup options={categoryOptions} value={categoryId} onChange={setCategoryId} />
          </Field>
        )}
        {crossCurrency && toAccount ? (
          <Field label={`Amount received (${toAccount.currency})`}>
            <TextField value={toAmount} onChangeText={setToAmount} placeholder="0" keyboardType="decimal-pad" />
          </Field>
        ) : null}
        <Field label="Date">
          <TextField value={day} onChangeText={setDay} placeholder="YYYY-MM-DD" />
        </Field>
        <Field label="Note">
          <TextField value={note} onChangeText={setNote} placeholder="Optional" onSubmitEditing={save} />
        </Field>
        {create.error ? (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {create.error.message}
          </ThemedText>
        ) : null}
        <Button label="Save" onPress={save} disabled={!valid} loading={create.isPending} />
        <Button label="Cancel" variant="plain" onPress={() => router.back()} />
      </Card>
    </Screen>
  );
}
