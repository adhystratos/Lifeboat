import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

export function TextField(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[
        styles.input,
        { color: theme.text, backgroundColor: theme.background, borderColor: theme.backgroundSelected },
        props.style,
      ]}
    />
  );
}

type Option<T extends string> = { value: T; label: string };

/** A row of selectable chips; one value at a time. */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.chips} accessibilityRole="radiogroup">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(o.value)}>
            <ThemedView type={selected ? 'backgroundSelected' : 'background'} style={styles.chip}>
              <ThemedText type={selected ? 'smallBold' : 'small'}>{o.label}</ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.one },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.three },
});
