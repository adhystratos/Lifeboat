import { useState } from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, IconName } from './icon';
import { useTile } from './screen';
import { ThemedText } from './themed-text';

type Variant = 'primary' | 'plain' | 'tile' | 'danger';

type Props = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: Variant;
  icon?: IconName;
  compact?: boolean;
};

/**
 * primary: filled in ink. plain: quiet fill on the page. tile: raised, for
 * use on a title tile. danger: quiet fill with red text.
 */
export function Button({ label, loading, variant = 'primary', icon, compact, disabled, style, ...rest }: Props) {
  const theme = useTheme();
  const tile = useTile();
  const look = {
    primary: { bg: theme.accent, ink: theme.onAccent },
    plain: { bg: theme.backgroundSelected, ink: theme.text },
    tile: { bg: tile.raised, ink: tile.onRaised },
    danger: { bg: theme.backgroundSelected, ink: theme.danger },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      disabled={disabled || loading}
      style={(state) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: look.bg },
        state.pressed && styles.pressed,
        (state as { hovered?: boolean }).hovered && !disabled && styles.hovered,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={look.ink} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={compact ? 16 : 18} tint={look.ink} /> : null}
          <ThemedText type="smallBold" style={{ color: look.ink }}>
            {label}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

/**
 * A delete button that asks once before acting: the first tap turns it into
 * "Delete" and "Cancel", and only the second tap deletes.
 */
export function ConfirmDelete({
  label,
  onConfirm,
  loading,
}: {
  label: string;
  onConfirm: () => void;
  loading?: boolean;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return <Button label={label} variant="danger" compact icon="trash-2" onPress={() => setAsking(true)} />;
  }
  return (
    <View style={styles.confirm} accessibilityLiveRegion="polite">
      <Button label="Cancel" variant="plain" compact onPress={() => setAsking(false)} />
      <Button
        label="Yes, delete"
        variant="danger"
        compact
        icon="trash-2"
        loading={loading}
        onPress={onConfirm}
        accessibilityHint="Deletes it for good"
      />
    </View>
  );
}

/** A round icon-only button with an accessible label. */
export function IconButton({
  icon,
  label,
  onTile,
  ...rest
}: PressableProps & { icon: IconName; label: string; onTile?: boolean }) {
  const theme = useTheme();
  const tile = useTile();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.icon,
        { backgroundColor: onTile ? tile.raised : theme.backgroundSelected },
        pressed && styles.pressed,
      ]}
      {...rest}>
      <Icon name={icon} size={18} tint={onTile ? tile.onRaised : theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { minHeight: 40, paddingHorizontal: Spacing.three },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  confirm: { flexDirection: 'row', gap: Spacing.two },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  hovered: { opacity: 0.9 },
  disabled: { opacity: 0.45 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
