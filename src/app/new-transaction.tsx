import { useState } from 'react';

import { AmountField, ChipGroup, closeForm, DayField, Field, FormScreen, TextField } from '@/components/form';
import { EmptyState } from '@/components/screen';
import { isDay, localToday, parseAmount } from '@/core';
import { NewTransaction, useAccountBalances, useCategories, useCreateTransaction, useWorkspace } from '@/lib/queries';

const TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
] as const;

/** Quick entry: type, amount, account, category. Everything else is optional. */
export default function NewTransactionScreen() {
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
      isDay(day) &&
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
      { onSuccess: closeForm },
    );
  }

  const accountOptions = accounts.map((a) => ({ value: a.account_id, label: `${a.name} · ${a.currency}` }));
  const categoryOptions = categories.filter((c) => c.kind === type).map((c) => ({ value: c.id, label: c.name }));

  return (
    <FormScreen title="New transaction" onSave={save} canSave={valid} saving={create.isPending} error={create.error?.message}>
      <ChipGroup
        options={TYPES}
        value={type}
        onChange={(t) => {
          setType(t);
          setCategoryId(null);
        }}
      />
      <Field label={isTransfer ? 'Amount sent' : 'Amount'}>
        <AmountField currency={account?.currency ?? 'IDR'} value={amount} onChangeText={setAmount} autoFocus />
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
        <Field label="Amount received" hint="What arrived in the other currency, so both balances stay exact.">
          <AmountField currency={toAccount.currency} value={toAmount} onChangeText={setToAmount} />
        </Field>
      ) : null}
      <Field label="Date">
        <DayField value={day} onChange={setDay} picks="back" />
      </Field>
      <Field label="Note">
        <TextField value={note} onChangeText={setNote} placeholder="Optional" onSubmitEditing={save} />
      </Field>
    </FormScreen>
  );
}
