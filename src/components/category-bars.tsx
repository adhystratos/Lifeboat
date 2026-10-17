import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { CategoryTotal, Currency, formatMoney } from '@/core';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

const MAX_ROWS = 6;

/**
 * Spending by category as a ranked horizontal bar list. One series, so one
 * hue and no legend; each bar is direct-labelled with its name and value in
 * text ink, and the list doubles as the table view. Tapping a row shows its
 * share of the month.
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
  const theme = useTheme();
  const [active, setActive] = useState<string | null>(null);

  const rows = totals.slice(0, MAX_ROWS).map((t) => ({
    key: t.categoryId ?? 'none',
    label: nameOf(t.categoryId),
    amount: t.amountMinor,
  }));
  const rest = totals.slice(MAX_ROWS).reduce((sum, t) => sum + t.amountMinor, 0);
  if (rest > 0) rows.push({ key: 'other', label: 'Other', amount: rest });
  const max = Math.max(...rows.map((r) => r.amount), 1);
  const sum = Math.max(rows.reduce((s, r) => s + r.amount, 0), 1);
  const share = (minor: number) => {
    const pct = (minor / sum) * 100;
    return pct > 0 && pct < 1 ? '<1%' : `${Math.round(pct)}%`;
  };

  return (
    <View style={styles.list} accessibilityRole="list">
      {rows.map((r) => {
        const open = active === r.key;
        return (
          <Pressable
            key={r.key}
            onPress={() => setActive(open ? null : r.key)}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            accessibilityLabel={`${r.label}: ${formatMoney(r.amount, currency)}, ${share(r.amount)} of spending`}
            style={({ pressed, hovered }) => [styles.row, (pressed || hovered) && styles.hover]}>
            <View style={styles.labels}>
              <ThemedText type="small">{r.label}</ThemedText>
              <ThemedText type={open ? 'smallBold' : 'small'} themeColor={open ? 'text' : 'textSecondary'} numeric>
                {open ? `${share(r.amount)} · ` : ''}
                {formatMoney(r.amount, currency)}
              </ThemedText>
            </View>
            <View
              style={[
                styles.bar,
                { width: `${(r.amount / max) * 100}%`, backgroundColor: theme.chartSingle },
                active && !open && styles.dim,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  row: { gap: 6, paddingVertical: 6 },
  hover: { opacity: 0.85 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  bar: { height: 8, borderRadius: 4, minWidth: 4 },
  dim: { opacity: 0.35 },
});
