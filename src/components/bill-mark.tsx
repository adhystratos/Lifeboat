import { StyleSheet, View } from 'react-native';

import { useScheme, useTheme } from '@/hooks/use-theme';

/**
 * Two overlapping dots, agenda ink and money ink, the teal one set down and
 * to the right like a print slightly out of register. On a light ground they
 * overprint green where they meet: a bill is both a date and a payment.
 * Dark mode draws the same shape in quiet greys.
 */
export function BillMark({ size = 12, outline }: { size?: number; /** Rings the agenda dot, for use on a turmeric ground. */ outline?: string }) {
  const theme = useTheme();
  const light = useScheme() === 'light';
  const offset = Math.round(size * 0.44);
  const dot = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View
      style={{ width: size + offset, height: size + offset }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <View
        style={[styles.dot, dot, { backgroundColor: theme.agendaInk }, outline ? { borderWidth: 1.5, borderColor: outline } : null]}
      />
      <View
        style={[
          styles.dot,
          dot,
          { left: offset, top: offset, backgroundColor: theme.moneyInk },
          light ? { mixBlendMode: 'multiply' } : { opacity: 0.85 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { position: 'absolute', top: 0, left: 0 },
});
