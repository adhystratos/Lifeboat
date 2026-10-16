import { ActivityIndicator, Pressable, PressableProps, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, IconName } from './icon';
import { ThemedText } from './themed-text';

type Variant = 'primary' | 'plain' | 'cover' | 'danger';

type Props = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: Variant;
  icon?: IconName;
  compact?: boolean;
};

/**
 * primary: filled accent. plain: quiet fill on the page. cover: outlined, for
 * use on the green cover band. danger: quiet fill with red ink.
 */
export function Button({ label, loading, variant = 'primary', icon, compact, disabled, style, ...rest }: Props) {
  const theme = useTheme();
  const look = {
    primary: { bg: theme.accent, ink: 'onAccent', border: 'transparent' },
    plain: { bg: theme.backgroundSelected, ink: 'text', border: 'transparent' },
    cover: { bg: theme.coverRaised, ink: 'coverText', border: 'transparent' },
    danger: { bg: theme.backgroundSelected, ink: 'danger', border: 'transparent' },
  }[variant] as { bg: string; ink: 'onAccent' | 'text' | 'coverText' | 'danger'; border: string };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: look.bg, borderColor: look.border },
        state.pressed && styles.pressed,
        (state as { hovered?: boolean }).hovered && !disabled && styles.hovered,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={theme[look.ink]} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={compact ? 16 : 18} color={look.ink} /> : null}
          <ThemedText type="smallBold" themeColor={look.ink}>
            {label}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

/** A round icon-only button with an accessible label. */
export function IconButton({
  icon,
  label,
  onCover,
  ...rest
}: PressableProps & { icon: IconName; label: string; onCover?: boolean }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.icon,
        { backgroundColor: onCover ? theme.coverRaised : theme.backgroundSelected },
        pressed && styles.pressed,
      ]}
      {...rest}>
      <Icon name={icon} size={18} color={onCover ? 'coverText' : 'text'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.control,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { minHeight: 36, paddingHorizontal: Spacing.three },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  hovered: { opacity: 0.9 },
  disabled: { opacity: 0.45 },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
