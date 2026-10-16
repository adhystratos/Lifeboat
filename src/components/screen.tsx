import { StatusBar } from 'expo-status-bar';
import { Children, Fragment, isValidElement, PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

/**
 * Standard page: a flat cover band in the shell colour carrying the screen's
 * title and its one headline figure, then the page ground with sheets.
 */
export function Screen({
  title,
  cover,
  actions,
  children,
}: PropsWithChildren<{ title: string; cover?: ReactNode; actions?: ReactNode }>) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={{ paddingBottom: BottomTabInset + insets.bottom + Spacing.six }}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.band, { backgroundColor: theme.cover, paddingTop: insets.top + Spacing.four }]}>
          <View style={styles.column}>
            <View style={styles.bandTop}>
              <ThemedText type="heading" themeColor="coverTextSecondary" accessibilityRole="header">
                {title}
              </ThemedText>
              {actions ? <View style={styles.bandActions}>{actions}</View> : null}
            </View>
            {cover}
          </View>
        </View>
        <View style={styles.page}>
          <View style={[styles.column, styles.stack]}>{children}</View>
        </View>
      </ScrollView>
    </View>
  );
}

/** A headline figure on the cover band, with an optional line beneath. */
export function CoverFigure({ value, caption, children }: PropsWithChildren<{ value: string; caption?: string }>) {
  return (
    <View style={styles.figure}>
      <ThemedText type="display" themeColor="coverText" numeric adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </ThemedText>
      {caption ? (
        <ThemedText type="default" themeColor="coverTextSecondary">
          {caption}
        </ThemedText>
      ) : null}
      {children}
    </View>
  );
}

/** A labelled group: heading row above a sheet. */
export function Section({
  title,
  action,
  note,
  padded,
  children,
}: PropsWithChildren<{
  title?: string;
  action?: { label: string; onPress: () => void };
  note?: ReactNode;
  /** Free content with padding (charts, controls) instead of ruled rows. */
  padded?: boolean;
}>) {
  return (
    <View style={styles.section}>
      {title || action ? (
        <View style={styles.sectionHead}>
          {title ? (
            <ThemedText type="heading" accessibilityRole="header">
              {title}
            </ThemedText>
          ) : (
            <View />
          )}
          {action ? (
            <Pressable
              accessibilityRole="button"
              onPress={action.onPress}
              hitSlop={8}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText type="link">{action.label}</ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <Sheet padded={padded}>{children}</Sheet>
      {note ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
          {note}
        </ThemedText>
      ) : null}
    </View>
  );
}

/** @deprecated Use Section. Kept so older screens keep compiling. */
export const Card = Section;

/** White sheet; direct children are separated by hairline rules. */
export function Sheet({ children, padded }: PropsWithChildren<{ padded?: boolean }>) {
  const theme = useTheme();
  const items = flatten(children);
  return (
    <View style={[styles.sheet, { backgroundColor: theme.backgroundElement }, padded && styles.padded]}>
      {items.map((child, i) => (
        <Fragment key={(isValidElement(child) && child.key) || i}>
          {i > 0 && !padded ? <View style={[styles.rule, { backgroundColor: theme.rule }]} /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

function flatten(children: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (child === null || child === undefined || child === false || child === '') return;
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
      out.push(...flatten(child.props.children));
    } else {
      out.push(child);
    }
  });
  return out;
}

/** A list row: leading mark, title and subtitle, trailing value. */
export function Row({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  muted,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  muted?: boolean;
}) {
  const theme = useTheme();
  const body = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.rowText}>
        {typeof title === 'string' ? (
          <ThemedText numberOfLines={2} themeColor={muted ? 'textSecondary' : 'text'}>
            {title}
          </ThemedText>
        ) : (
          title
        )}
        {subtitle ? (
          typeof subtitle === 'string' ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {subtitle}
            </ThemedText>
          ) : (
            subtitle
          )
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.row} accessible={Boolean(accessibilityLabel)} accessibilityLabel={accessibilityLabel}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.row,
        (pressed || hovered) && { backgroundColor: theme.backgroundSelected },
      ]}>
      {body}
    </Pressable>
  );
}

/** An empty sheet that says what belongs here and how to add it. */
export function EmptyState({
  children,
  action,
}: PropsWithChildren<{ action?: { label: string; onPress: () => void } }>) {
  return (
    <View style={styles.empty}>
      <ThemedText type="small" themeColor="textSecondary">
        {children}
      </ThemedText>
      {action ? (
        <Pressable accessibilityRole="button" onPress={action.onPress} hitSlop={8}>
          <ThemedText type="link">{action.label}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  band: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
    alignItems: 'center',
  },
  bandTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    minHeight: 36,
  },
  bandActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  figure: { gap: Spacing.one, marginTop: Spacing.three },
  page: { paddingHorizontal: Spacing.three, paddingTop: Spacing.four, alignItems: 'center' },
  column: { width: '100%', maxWidth: MaxContentWidth },
  stack: { gap: Spacing.five },
  section: { gap: Spacing.two },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
    gap: Spacing.three,
  },
  note: { paddingHorizontal: Spacing.one },
  sheet: { borderRadius: Radius.sheet, overflow: 'hidden' },
  padded: { padding: Spacing.three, gap: Spacing.three },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.three },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    minHeight: 56,
  },
  leading: { width: 28, alignItems: 'center' },
  rowText: { flex: 1, gap: 2 },
  trailing: { alignItems: 'flex-end', gap: 2, flexShrink: 0, maxWidth: '50%' },
  empty: { padding: Spacing.three, gap: Spacing.two, alignItems: 'flex-start' },
  pressed: { opacity: 0.6 },
});
