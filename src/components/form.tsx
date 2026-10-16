import { router } from 'expo-router';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontFiles, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { addDays, localToday } from '@/core';
import { useTheme } from '@/hooks/use-theme';

import { Button, IconButton } from './button';
import { ThemedText } from './themed-text';

/** Leaves an entry form, also when it was opened directly by URL. */
export function closeForm() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/**
 * Entry form page: a close button and title, then fields on one sheet, then
 * the save action. Used by every "New …" screen.
 */
export function FormScreen({
  title,
  children,
  error,
  saveLabel = 'Save',
  onSave,
  canSave,
  saving,
}: PropsWithChildren<{
  title: string;
  error?: string | null;
  saveLabel?: string;
  onSave: () => void;
  canSave: boolean;
  saving?: boolean;
}>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.six }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <View style={styles.head}>
            <ThemedText type="title" accessibilityRole="header">
              {title}
            </ThemedText>
            <IconButton icon="x" label="Close" onPress={closeForm} />
          </View>
          <View style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}>{children}</View>
          {error ? (
            <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
              {error}
            </ThemedText>
          ) : null}
          <Button label={saveLabel} onPress={onSave} disabled={!canSave} loading={saving} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
      {hint ? (
        <ThemedText type="caption" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function TextField({ style, onFocus, onBlur, ...props }: TextInputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      selectionColor={theme.accent}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
      style={[
        styles.input,
        {
          color: theme.text,
          backgroundColor: theme.background,
          borderColor: focused ? theme.accent : 'transparent',
        },
        style,
      ]}
    />
  );
}

/** A large amount entry with its currency beside it. */
export function AmountField({
  currency,
  ...props
}: TextInputProps & { currency: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.amountWrap, { backgroundColor: theme.background }]}>
      <ThemedText type="heading" themeColor="textSecondary">
        {currency}
      </ThemedText>
      <TextInput
        placeholder="0"
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.accent}
        keyboardType="decimal-pad"
        inputMode="decimal"
        {...props}
        style={[styles.amount, { color: theme.text }]}
      />
    </View>
  );
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function isDay(value: string): boolean {
  return DAY.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** A date as YYYY-MM-DD with quick picks for the common choices. */
export function DayField({ value, onChange, picks = 'forward' }: { value: string; onChange: (day: string) => void; picks?: 'forward' | 'back' }) {
  const today = localToday();
  const options =
    picks === 'forward'
      ? [
          { value: today, label: 'Today' },
          { value: addDays(today, 1), label: 'Tomorrow' },
          { value: addDays(today, 7), label: 'In a week' },
        ]
      : [
          { value: today, label: 'Today' },
          { value: addDays(today, -1), label: 'Yesterday' },
        ];
  return (
    <View style={styles.field}>
      <ChipGroup options={options} value={options.some((o) => o.value === value) ? value : null} onChange={onChange} />
      <TextField value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" autoCapitalize="none" autoCorrect={false} />
    </View>
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
  const theme = useTheme();
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
            onPress={() => onChange(o.value)}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: selected ? theme.accent : theme.background },
              pressed && styles.pressed,
              disabled && styles.disabled,
            ]}>
            <ThemedText type="smallBold" themeColor={selected ? 'onAccent' : 'text'}>
              {o.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.three, alignItems: 'center' },
  column: { width: '100%', maxWidth: MaxContentWidth - 160, gap: Spacing.four },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  sheet: { borderRadius: Radius.sheet, padding: Spacing.three, gap: Spacing.four },
  field: { gap: Spacing.two },
  input: {
    minHeight: 48,
    borderWidth: 2,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontFamily: FontFiles.medium,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    minHeight: 72,
  },
  amount: {
    flex: 1,
    fontFamily: FontFiles.extrabold,
    fontSize: 34,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
    paddingVertical: Spacing.two,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.pill, minHeight: 36, justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
});
