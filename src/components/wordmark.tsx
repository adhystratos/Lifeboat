import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

/**
 * Gold-foil wordmark: the name set in the extrabold cut with a small
 * double-ruled seal, echoing the emblem on a passport cover.
 */
export function Wordmark({ size = 'default' }: { size?: 'default' | 'large' }) {
  const theme = useTheme();
  const large = size === 'large';
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel="Lifeboat">
      <View style={[styles.seal, large && styles.sealLarge, { borderColor: theme.gold }]}>
        <View style={[styles.sealInner, { borderColor: theme.gold }]} />
      </View>
      <ThemedText type={large ? 'title' : 'subtitle'} style={{ color: theme.gold }}>
        Lifeboat
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seal: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, padding: 3 },
  sealLarge: { width: 28, height: 28, borderRadius: 14 },
  sealInner: { flex: 1, borderRadius: 999, borderWidth: 1 },
});
