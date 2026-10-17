import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Children, createContext, Fragment, isValidElement, PropsWithChildren, ReactNode, useContext, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BottomTabInset,
  FontFiles,
  MaxContentWidth,
  RailBreakpoint,
  Radius,
  Spacing,
  TileColors,
  Tiles,
  Tone,
} from '@/constants/theme';
import { useScheme, useTheme } from '@/hooks/use-theme';

import { Icon } from './icon';
import { ThemedText } from './themed-text';

const TileContext = createContext<TileColors>(Tiles.light.plain);

/** Colours of the title tile the caller sits on. */
export function useTile() {
  return useContext(TileContext);
}

/** Gives a tile's colours to content drawn on a tile-coloured ground outside `Screen`. */
export function TileScope({ tone, children }: PropsWithChildren<{ tone: Tone }>) {
  return <TileContext.Provider value={Tiles[useScheme()][tone]}>{children}</TileContext.Provider>;
}

/**
 * Standard page: a title tile at the top in the screen's ink (turmeric for
 * the agenda, teal for money), carrying the menu's name, one short subtitle
 * and the screen's key figure, then the page ground with sheets.
 */
export function Screen({
  title,
  subtitle,
  tone = 'plain',
  tile,
  actions,
  newEntry = true,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  tone?: Tone;
  /** Key figure, counts or controls shown in the tile below the subtitle. */
  tile?: ReactNode;
  /** Small controls at the tile's top right. */
  actions?: ReactNode;
  /** Show the floating "New" button (phones and narrow windows). */
  newEntry?: boolean;
}>) {
  const theme = useTheme();
  const colors = Tiles[useScheme()][tone];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = Platform.OS === 'web' && width >= RailBreakpoint;
  const showNew = newEntry && !wide;
  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <StatusBar style="auto" />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.three,
          paddingBottom: BottomTabInset + insets.bottom + Spacing.six + (showNew ? Spacing.six : 0),
        }}
        keyboardShouldPersistTaps="handled">
        <View style={styles.page}>
          <View style={styles.column}>
            <TileContext.Provider value={colors}>
              <View style={[styles.tile, { backgroundColor: colors.background }]}>
                <View style={styles.tileHead}>
                  <View style={styles.tileTitles}>
                    <ThemedText type="display" accessibilityRole="header" style={{ color: colors.text }}>
                      {title}
                    </ThemedText>
                    {subtitle ? (
                      <ThemedText type="heading" style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {subtitle}
                      </ThemedText>
                    ) : null}
                  </View>
                  {actions ? <View style={styles.actions}>{actions}</View> : null}
                </View>
                {tile ? <View style={styles.tileBody}>{tile}</View> : null}
              </View>
            </TileContext.Provider>
          </View>
          <View style={[styles.column, styles.stack]}>{children}</View>
        </View>
      </ScrollView>
      {showNew ? <NewButton bottom={BottomTabInset + insets.bottom + Spacing.three} /> : null}
    </View>
  );
}

/** Floating "New" button: every kind of entry is one tap away on every screen. */
function NewButton({ bottom }: { bottom: number }) {
  // Ink in light mode; a quiet raised graphite at night.
  const colors = Tiles[useScheme()].plain;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="New entry"
      onPress={() => router.push('/new')}
      style={({ pressed }) => [
        styles.fab,
        { bottom, backgroundColor: colors.raised, shadowColor: '#000' },
        pressed && styles.fabPressed,
      ]}>
      <Icon name="plus" size={20} tint={colors.onRaised} />
      <ThemedText type="smallBold" style={{ color: colors.onRaised }}>
        New
      </ThemedText>
    </Pressable>
  );
}

/**
 * The tile's key figure: a large amount with a short label, and an optional
 * info button that explains how the number is made.
 */
export function TileFigure({ value, label, info }: { value: string; label: string; info?: ReactNode }) {
  const colors = useTile();
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.figure}>
      <View style={styles.figureRow}>
        <ThemedText
          type="figure"
          numeric
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.figureValue, { color: colors.text }]}>
          {value}
        </ThemedText>
        {info ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`About ${label.toLowerCase()}`}
            accessibilityState={{ expanded: open }}
            onPress={() => setOpen((o) => !o)}
            hitSlop={12}
            style={({ pressed }) => [styles.infoButton, pressed && styles.pressed]}>
            <Icon name={open ? 'x-circle' : 'info'} size={18} tint={colors.text} />
          </Pressable>
        ) : null}
      </View>
      <ThemedText type="smallBold" style={{ color: colors.textSecondary }}>
        {label}
      </ThemedText>
      {info && open ? (
        <View style={[styles.tip, { backgroundColor: colors.raised }]} accessibilityLiveRegion="polite">
          {typeof info === 'string' ? (
            <ThemedText type="small" style={{ color: colors.onRaised }}>
              {info}
            </ThemedText>
          ) : (
            info
          )}
        </View>
      ) : null}
    </View>
  );
}

/** A short count or state on the tile, such as "3 to do" or "1 overdue". */
export function TileChip({ label, alert }: { label: string; alert?: boolean }) {
  const colors = useTile();
  const theme = useTheme();
  const bg = alert ? theme.statusOverdue : colors.raised;
  const ink = alert ? theme.onStatusOverdue : colors.onRaised;
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <ThemedText type="caption" style={[styles.chipText, { color: ink }]}>
        {label}
      </ThemedText>
    </View>
  );
}

export function TileChips({ children }: PropsWithChildren) {
  return <View style={styles.chips}>{children}</View>;
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
              hitSlop={12}
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
        <Pressable accessibilityRole="button" onPress={action.onPress} hitSlop={12}>
          <ThemedText type="link">{action.label}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { paddingHorizontal: Spacing.three, alignItems: 'center', gap: Spacing.five },
  column: { width: '100%', maxWidth: MaxContentWidth },
  stack: { gap: Spacing.five },
  tile: {
    borderRadius: Radius.tile,
    paddingHorizontal: 20,
    paddingTop: Spacing.four,
    paddingBottom: 28,
  },
  tileHead: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  tileTitles: { flex: 1, gap: Spacing.two },
  subtitle: { fontFamily: FontFiles.semibold },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.one },
  tileBody: { marginTop: Spacing.four, gap: Spacing.three },
  figure: { gap: Spacing.one },
  figureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  figureValue: { flexShrink: 1 },
  infoButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  tip: { marginTop: Spacing.three, borderRadius: Radius.control, paddingHorizontal: 14, paddingVertical: 12, gap: Spacing.one },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  chipText: { fontFamily: FontFiles.extrabold },
  fab: {
    position: 'absolute',
    right: Spacing.three,
    minHeight: 52,
    paddingHorizontal: 22,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabPressed: { transform: [{ scale: 0.96 }] },
  section: { gap: 10 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
    gap: Spacing.three,
  },
  note: { paddingHorizontal: Spacing.one },
  sheet: { borderRadius: Radius.sheet, overflow: 'hidden' },
  padded: { padding: 20, gap: Spacing.three },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.three },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    minHeight: 60,
  },
  leading: { width: 28, alignItems: 'center' },
  rowText: { flex: 1, gap: 2 },
  trailing: { alignItems: 'flex-end', gap: 4, flexShrink: 0, maxWidth: '50%' },
  empty: { padding: 20, gap: Spacing.two, alignItems: 'flex-start' },
  pressed: { opacity: 0.6 },
});
