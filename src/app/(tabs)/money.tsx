import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { relativeDay } from '@/components/agenda-rows';
import { ConfirmDelete } from '@/components/button';
import { CategoryBars } from '@/components/category-bars';
import { Icon, IconName } from '@/components/icon';
import { SampleNotice } from '@/components/sample-notice';
import { EmptyState, Row, Screen, Section, TileFigure } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { DATE_LOCALE, Spacing } from '@/constants/theme';
import { convertMinor, Currency, describeRule, formatMoney, localToday, monthBounds, summarize } from '@/core';
import { accountTypeLabel } from '@/lib/labels';
import {
  AccountType,
  Bill,
  Transaction,
  useAccountBalances,
  useBills,
  useCategories,
  useDeleteBill,
  useDeleteTransaction,
  useFxRates,
  useTransactions,
  useWorkspace,
} from '@/lib/queries';

const RECENT_LIMIT = 20;

const monthOnly = new Intl.DateTimeFormat(DATE_LOCALE, { month: 'long' });

const ACCOUNT_ICON: Record<AccountType, IconName> = {
  cash: 'dollar-sign',
  bank: 'briefcase',
  ewallet: 'smartphone',
  credit: 'credit-card',
  savings: 'archive',
};

export default function MoneyScreen() {
  const today = localToday();
  const { start, end } = monthBounds(today);
  const { data: workspace } = useWorkspace();
  const { data: accounts, isLoading, error } = useAccountBalances();
  const { data: transactions = [], isLoading: txLoading } = useTransactions(start, end);
  const { data: categories = [] } = useCategories();
  const { data: rates = [] } = useFxRates();
  const { data: bills = [] } = useBills();

  const base: Currency = workspace?.base_currency ?? 'IDR';
  const categoryName = useMemo(() => {
    const names = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string | null) => (id ? (names.get(id) ?? 'Unknown') : 'Uncategorized');
  }, [categories]);

  const summary = summarize(
    transactions.map((t) => ({
      type: t.type,
      amountMinor: t.amount_minor,
      currency: t.account.currency,
      categoryId: t.category_id,
    })),
    base,
    rates,
  );

  // Accounts in a currency with no rate to the base are left out of the total.
  let total = 0;
  const unconverted = new Set<Currency>();
  for (const a of accounts ?? []) {
    try {
      total += convertMinor(a.balance_minor, a.currency, base, rates);
    } catch {
      unconverted.add(a.currency);
    }
  }
  const month = monthOnly.format(new Date());

  return (
    <Screen
      title="Money"
      subtitle={month}
      tone="money"
      tile={
        <TileFigure
          value={formatMoney(summary.expenseMinor, base)}
          label="Spent"
          info={[
            `Income ${formatMoney(summary.incomeMinor, base)}, net ${summary.netMinor >= 0 ? '+' : '−'}${formatMoney(Math.abs(summary.netMinor), base)} this month.`,
            summary.missingRates.length
              ? `Not yet included: amounts in ${summary.missingRates.join(', ')}. No exchange rate to ${base} is available yet.`
              : null,
          ]
            .filter(Boolean)
            .join(' ')}
        />
      }>
      <SampleNotice />

      <Section title={`Spending in ${month}`} padded={summary.expenseByCategory.length > 0}>
        {summary.expenseByCategory.length ? (
          <CategoryBars totals={summary.expenseByCategory} currency={base} nameOf={categoryName} />
        ) : (
          <EmptyState action={{ label: 'Record an expense', onPress: () => router.push('/new-transaction') }}>
            No spending recorded this month. Each expense you add is grouped by category here.
          </EmptyState>
        )}
      </Section>

      <Section title="Accounts" action={{ label: 'Add account', onPress: () => router.push('/new-account') }}>
        {isLoading ? <Row title="Loading…" muted leading={<ActivityIndicator />} /> : null}
        {error ? <EmptyState>Couldn&apos;t load accounts: {error.message}</EmptyState> : null}
        {accounts?.length === 0 ? (
          <EmptyState action={{ label: 'Add an account', onPress: () => router.push('/new-account') }}>
            Add your bank accounts, cash and e-wallets, each in its own currency.
          </EmptyState>
        ) : null}
        {accounts?.map((a) => (
          <Row
            key={a.account_id}
            leading={<Icon name={ACCOUNT_ICON[a.type] ?? 'briefcase'} color="textSecondary" />}
            title={a.name}
            subtitle={`${accountTypeLabel(a.type)} · ${a.currency}`}
            trailing={
              <ThemedText type="defaultBold" numeric themeColor={a.balance_minor < 0 ? 'danger' : 'text'}>
                {formatMoney(a.balance_minor, a.currency)}
              </ThemedText>
            }
          />
        ))}
        {accounts?.length ? (
          <Row
            title={<ThemedText type="defaultBold">Total in {base}</ThemedText>}
            subtitle={unconverted.size ? `Without ${[...unconverted].join(', ')}` : undefined}
            trailing={
              <ThemedText type="defaultBold" numeric>
                {formatMoney(total, base)}
              </ThemedText>
            }
          />
        ) : null}
      </Section>

      <Section title="Bills and regular income" action={{ label: 'New bill', onPress: () => router.push('/new-bill') }}>
        {bills.length === 0 ? (
          <EmptyState action={{ label: 'Add a bill', onPress: () => router.push('/new-bill') }}>
            Rent, subscriptions, insurance or a monthly retainer. Lifeboat reminds you on Today and records the payment when you
            mark it paid.
          </EmptyState>
        ) : null}
        {bills.map((b) => (
          <BillSummaryRow key={b.id} bill={b} today={today} />
        ))}
      </Section>

      <Section title="Recent">
        {txLoading ? <Row title="Loading…" muted leading={<ActivityIndicator />} /> : null}
        {!txLoading && transactions.length === 0 ? <EmptyState>No transactions this month yet.</EmptyState> : null}
        {transactions.slice(0, RECENT_LIMIT).map((t) => (
          <TransactionRow key={t.id} transaction={t} categoryName={categoryName} today={today} />
        ))}
      </Section>
    </Screen>
  );
}

function BillSummaryRow({ bill, today }: { bill: Bill; today: string }) {
  const remove = useDeleteBill();
  const [open, setOpen] = useState(false);
  const income = bill.type === 'income';
  return (
    <View>
      <Row
        leading={<Icon name={income ? 'arrow-down-left' : 'repeat'} color="textSecondary" />}
        title={bill.name}
        subtitle={`${describeRule(bill.recurrence_rule)} · ${
          bill.next_due_on ? `next ${relativeDay(bill.next_due_on, today).toLowerCase()}` : 'ended'
        }`}
        trailing={
          <ThemedText type="defaultBold" numeric themeColor={income ? 'positive' : 'text'}>
            {income ? '+' : '−'}
            {formatMoney(bill.amount_minor, bill.account.currency)}
          </ThemedText>
        }
        onPress={() => setOpen((o) => !o)}
        accessibilityHint="Shows the delete option"
      />
      {open ? (
        <View style={styles.rowActions}>
          <ConfirmDelete label="Delete bill" onConfirm={() => remove.mutate(bill.id)} loading={remove.isPending} />
        </View>
      ) : null}
    </View>
  );
}

function TransactionRow({
  transaction: t,
  categoryName,
  today,
}: {
  transaction: Transaction;
  categoryName: (id: string | null) => string;
  today: string;
}) {
  const remove = useDeleteTransaction();
  const [open, setOpen] = useState(false);

  const transfer = t.type === 'transfer';
  const title = transfer ? `${t.account.name} to ${t.transfer_account?.name ?? '?'}` : (t.note ?? categoryName(t.category_id));
  const subtitle = [
    relativeDay(t.occurred_on, today),
    transfer ? 'Transfer' : t.account.name,
    !transfer && t.note ? categoryName(t.category_id) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const sign = t.type === 'income' ? '+' : t.type === 'expense' ? '−' : '';
  const icon: IconName = t.type === 'income' ? 'arrow-down-left' : t.type === 'expense' ? 'arrow-up-right' : 'shuffle';

  return (
    <View>
      <Row
        leading={<Icon name={icon} color={t.type === 'income' ? 'positive' : 'textSecondary'} />}
        title={title}
        subtitle={subtitle}
        trailing={
          <ThemedText type="defaultBold" numeric themeColor={t.type === 'income' ? 'positive' : 'text'}>
            {sign}
            {formatMoney(t.amount_minor, t.account.currency)}
          </ThemedText>
        }
        onPress={() => setOpen((o) => !o)}
        accessibilityHint="Shows the delete option"
      />
      {open ? (
        <View style={styles.rowActions}>
          <ConfirmDelete label="Delete transaction" onConfirm={() => remove.mutate(t.id)} loading={remove.isPending} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rowActions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.three, paddingBottom: Spacing.three },
});
