import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { CategoryBars } from '@/components/category-bars';
import { Card, EmptyState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { convertMinor, Currency, formatMoney, localToday, monthBounds, summarize } from '@/core';
import { useTheme } from '@/hooks/use-theme';
import {
  Transaction,
  useAccountBalances,
  useCategories,
  useDeleteTransaction,
  useFxRates,
  useTransactions,
  useWorkspace,
} from '@/lib/queries';

const RECENT_LIMIT = 20;

const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
const dayLabel = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' });

export default function MoneyScreen() {
  const { start, end } = monthBounds(localToday());
  const { data: workspace } = useWorkspace();
  const { data: accounts, isLoading, error } = useAccountBalances();
  const { data: transactions = [] } = useTransactions(start, end);
  const { data: categories = [] } = useCategories();
  const { data: rates = [] } = useFxRates();

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
  const missing = [...new Set([...summary.missingRates, ...unconverted])];

  return (
    <Screen title="Money">
      <View style={styles.actions}>
        <Button label="Add transaction" onPress={() => router.push('/new-transaction')} style={styles.grow} />
        <Button label="Add account" variant="plain" onPress={() => router.push('/new-account')} />
      </View>

      <Card title={monthLabel.format(new Date())}>
        <View style={styles.stats}>
          <Stat label="Income" value={formatMoney(summary.incomeMinor, base)} />
          <Stat label="Spent" value={formatMoney(summary.expenseMinor, base)} />
          <Stat label="Net" value={formatMoney(summary.netMinor, base)} />
        </View>
        {missing.length ? (
          <ThemedText type="small" themeColor="textSecondary">
            {missing.join(', ')} amounts aren&apos;t included yet: no exchange rate to {base} is available.
          </ThemedText>
        ) : null}
      </Card>

      <Card title="Spending by category">
        {summary.expenseByCategory.length ? (
          <CategoryBars totals={summary.expenseByCategory} currency={base} nameOf={categoryName} />
        ) : (
          <EmptyState>No spending recorded this month.</EmptyState>
        )}
      </Card>

      <Card title="Accounts">
        {isLoading ? <ActivityIndicator /> : null}
        {error ? <EmptyState>Couldn&apos;t load accounts: {error.message}</EmptyState> : null}
        {accounts?.length === 0 ? <EmptyState>No accounts yet.</EmptyState> : null}
        {accounts?.map((a) => (
          <View key={a.account_id} style={styles.row}>
            <View style={styles.shrink}>
              <ThemedText>{a.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {a.type} · {a.currency}
              </ThemedText>
            </View>
            <ThemedText type="smallBold">{formatMoney(a.balance_minor, a.currency)}</ThemedText>
          </View>
        ))}
        {accounts?.length ? (
          <View style={[styles.row, styles.totalRow]}>
            <ThemedText type="smallBold">Total</ThemedText>
            <ThemedText type="smallBold">{formatMoney(total, base)}</ThemedText>
          </View>
        ) : null}
      </Card>

      <Card title="Recent">
        {transactions.length === 0 ? <EmptyState>No transactions this month yet.</EmptyState> : null}
        {transactions.slice(0, RECENT_LIMIT).map((t) => (
          <TransactionRow key={t.id} transaction={t} categoryName={categoryName} />
        ))}
      </Card>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.statValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function TransactionRow({
  transaction: t,
  categoryName,
}: {
  transaction: Transaction;
  categoryName: (id: string | null) => string;
}) {
  const theme = useTheme();
  const remove = useDeleteTransaction();
  const [open, setOpen] = useState(false);

  const title =
    t.type === 'transfer'
      ? `${t.account.name} → ${t.transfer_account?.name ?? '?'}`
      : (t.note ?? categoryName(t.category_id));
  const subtitle = [
    dayLabel.format(new Date(`${t.occurred_on}T00:00:00Z`)),
    t.type === 'transfer' ? 'Transfer' : t.account.name,
    t.type !== 'transfer' && t.note ? categoryName(t.category_id) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const sign = t.type === 'income' ? '+' : t.type === 'expense' ? '−' : '';

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Shows the delete option"
        onPress={() => setOpen((o) => !o)}
        style={styles.row}>
        <View style={styles.shrink}>
          <ThemedText numberOfLines={1}>{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        </View>
        <ThemedText type="smallBold">
          {sign}
          {formatMoney(t.amount_minor, t.account.currency)}
        </ThemedText>
      </Pressable>
      {open ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => remove.mutate(t.id)}
          disabled={remove.isPending}
          style={styles.delete}>
          <ThemedText type="small" style={{ color: theme.danger }}>
            {remove.isPending ? 'Deleting…' : 'Delete transaction'}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: Spacing.two },
  grow: { flexGrow: 1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  stat: { flexGrow: 1, flexBasis: 150, gap: Spacing.half },
  statValue: { fontSize: 18, lineHeight: 26 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  shrink: { flexShrink: 1 },
  totalRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#8888', paddingTop: Spacing.two },
  delete: { alignSelf: 'flex-end', paddingVertical: Spacing.one },
});
