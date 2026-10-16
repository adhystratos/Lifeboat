import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icon';

/** Round checkbox for tasks. Filled with stamp green once done. */
export function Check({
  checked,
  onToggle,
  label,
  disabled,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      onPress={onToggle}
      disabled={disabled}
      hitSlop={10}
      style={({ pressed }) => [
        styles.box,
        checked
          ? { backgroundColor: theme.stampGreen, borderColor: theme.stampGreen }
          : { borderColor: theme.textSecondary },
        pressed && styles.pressed,
      ]}>
      {checked ? <Icon name="check" size={15} color="onAccent" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.9 }] },
});
