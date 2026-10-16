import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { CategoryTotal, Currency, formatMoney } from '@/core';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

const MAX_ROWS = 6;

/**
 * Spending by category as a ranked horizontal bar list. One series, so one
 * hue (the theme accent) and no legend; each bar is direct-labelled with
 * its name and value in text ink, and the list doubles as the table view.
 */
export function CategoryBars({
  totals,
  currency,
  nameOf,
}: {
  totals: CategoryTotal[];
  currency: Currency;
  nameOf: (categoryId: string | null) => string;
}) {
  const color = useTheme().accent;

  const rows = totals.slice(0, MAX_ROWS).map((t) => ({
    key: t.categoryId ?? 'none',
    label: nameOf(t.categoryId),
    amount: t.amountMinor,
  }));
  const rest = totals.slice(MAX_ROWS).reduce((sum, t) => sum + t.amountMinor, 0);
  if (rest > 0) rows.push({ key: 'other', label: 'Other', amount: rest });
  const max = Math.max(...rows.map((r) => r.amount), 1);

  return (
    <View style={styles.list} accessibilityRole="list">
      {rows.map((r) => (
        <View
          key={r.key}
          style={styles.row}
          accessible
          accessibilityLabel={`${r.label}: ${formatMoney(r.amount, currency)}`}>
          <View style={styles.labels}>
            <ThemedText type="small">{r.label}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.value}>
              {formatMoney(r.amount, currency)}
            </ThemedText>
          </View>
          <View style={[styles.bar, { width: `${(r.amount / max) * 100}%`, backgroundColor: color }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.three },
  row: { gap: Spacing.one },
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  value: { fontVariant: ['tabular-nums'] },
  bar: { height: 8, borderRadius: 4, minWidth: 4 },
});
