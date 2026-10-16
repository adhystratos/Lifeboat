import { useState } from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { ChartColors } from '@/constants/chart-palette';
import { Spacing } from '@/constants/theme';
import { Currency, formatMoney } from '@/core';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

export type Part = {
  key: string;
  label: string;
  amountMinor: number;
  /** Fixed categorical slot (0-based), so a group keeps its colour when others are empty. */
  slot: number;
};

/**
 * Part-to-whole bar for what you own, with debts drawn beneath on the same
 * scale. The legend below doubles as the table view: every part is named with
 * its value and share, so identity never rests on colour alone. Pressing a
 * segment or a legend row highlights it.
 */
export function CompositionBar({
  parts,
  debtsMinor,
  currency,
}: {
  parts: Part[];
  debtsMinor: number;
  currency: Currency;
}) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = ChartColors[scheme];
  const [active, setActive] = useState<string | null>(null);

  const shown = parts.filter((p) => p.amountMinor > 0);
  const owned = shown.reduce((sum, p) => sum + p.amountMinor, 0);
  const scale = Math.max(owned, debtsMinor, 1);
  const share = (minor: number) => {
    const pct = (minor / Math.max(owned, 1)) * 100;
    return pct > 0 && pct < 1 ? '<1%' : `${Math.round(pct)}%`;
  };
  const focus = shown.find((p) => p.key === active);

  return (
    <View style={styles.wrap}>
      <ThemedText type="small" themeColor="textSecondary" numeric accessibilityLiveRegion="polite">
        {focus
          ? `${focus.label}: ${formatMoney(focus.amountMinor, currency)}, ${share(focus.amountMinor)} of what you own`
          : `What you own: ${formatMoney(owned, currency)}`}
      </ThemedText>

      <View style={[styles.track, { width: `${(owned / scale) * 100}%` }]}>
        {shown.map((p) => (
          <Pressable
            key={p.key}
            accessibilityRole="button"
            accessibilityLabel={`${p.label}, ${formatMoney(p.amountMinor, currency)}, ${share(p.amountMinor)}`}
            onPress={() => setActive((a) => (a === p.key ? null : p.key))}
            onHoverIn={() => setActive(p.key)}
            onHoverOut={() => setActive(null)}
            style={[
              styles.segment,
              {
                flexGrow: p.amountMinor,
                backgroundColor: palette.categorical[p.slot],
                opacity: active && active !== p.key ? 0.35 : 1,
              },
            ]}
          />
        ))}
      </View>

      {debtsMinor > 0 ? (
        <View style={styles.debtRow}>
          <View
            style={[styles.debt, { width: `${(debtsMinor / scale) * 100}%`, backgroundColor: palette.diverging.negative }]}
            accessibilityLabel={`Debts, ${formatMoney(debtsMinor, currency)}`}
          />
          <ThemedText type="caption" themeColor="textSecondary" numeric style={styles.debtLabel}>
            Debts {formatMoney(debtsMinor, currency)}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.legend} accessibilityRole="list">
        {shown.map((p) => (
          <Pressable
            key={p.key}
            onPress={() => setActive((a) => (a === p.key ? null : p.key))}
            style={[styles.legendRow, active === p.key && { backgroundColor: theme.background }]}>
            <View style={[styles.swatch, { backgroundColor: palette.categorical[p.slot] }]} />
            <ThemedText type="small" style={styles.legendLabel}>
              {p.label}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numeric>
              {share(p.amountMinor)}
            </ThemedText>
            <ThemedText type="smallBold" numeric style={styles.legendValue}>
              {formatMoney(p.amountMinor, currency)}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.three },
  track: { flexDirection: 'row', height: 20, gap: 2, minWidth: 4 },
  segment: { minWidth: 4, borderRadius: 4 },
  debtRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: -Spacing.two },
  debt: { height: 8, borderRadius: 4, minWidth: 4 },
  debtLabel: { flexShrink: 0 },
  legend: { gap: 2 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 6,
    paddingHorizontal: Spacing.two,
    marginHorizontal: -Spacing.two,
    borderRadius: 8,
  },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { flex: 1 },
  legendValue: { minWidth: 110, textAlign: 'right' },
});
