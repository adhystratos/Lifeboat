import { ActivityIndicator, Pressable, PressableProps, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

type Props = PressableProps & { label: string; loading?: boolean; variant?: 'primary' | 'plain' };

export function Button({ label, loading, variant = 'primary', disabled, style, ...rest }: Props) {
  const theme = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        { backgroundColor: primary ? theme.accent : theme.backgroundSelected },
        (state.pressed || disabled) && styles.dim,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={primary ? '#fff' : theme.text} />
      ) : (
        <ThemedText type="smallBold" style={primary ? styles.primaryText : undefined}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: { opacity: 0.6 },
  primaryText: { color: '#fff' },
});
