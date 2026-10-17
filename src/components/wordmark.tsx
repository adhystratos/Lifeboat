import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { BillMark } from './bill-mark';
import { ThemedText } from './themed-text';

/**
 * Lowercase wordmark set in the extrabold cut, led by the overprint mark:
 * a turmeric dot and a teal dot printed over each other.
 */
export function Wordmark({ size = 'default', outline }: { size?: 'default' | 'large'; outline?: string }) {
  const theme = useTheme();
  const large = size === 'large';
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel="Lifeboat">
      <BillMark size={large ? 18 : 14} outline={outline} />
      <ThemedText type={large ? 'title' : 'subtitle'} style={{ color: outline ?? theme.text }}>
        lifeboat
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
