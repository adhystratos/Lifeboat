import { router } from 'expo-router';
import { TabList, TabListProps, TabSlot, TabTrigger, TabTriggerSlotProps, Tabs } from 'expo-router/ui';
import { Pressable, PressableProps, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RailBreakpoint, RailWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Button } from './button';
import { Icon, IconName } from './icon';
import { TABS } from './tabs';
import { ThemedText } from './themed-text';
import { Wordmark } from './wordmark';

/**
 * Web navigation. Wide screens get a green side rail (the passport cover);
 * narrow screens get a bottom tab bar on the sheet colour.
 */
export default function AppTabs() {
  const wide = useWindowDimensions().width >= RailBreakpoint;
  const list = (
    <TabList asChild>
      {wide ? (
        <Rail>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <RailItem icon={tab.icon}>{tab.label}</RailItem>
            </TabTrigger>
          ))}
        </Rail>
      ) : (
        <BottomBar>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <BarItem icon={tab.icon}>{tab.label}</BarItem>
            </TabTrigger>
          ))}
        </BottomBar>
      )}
    </TabList>
  );
  return (
    <Tabs style={{ flex: 1, flexDirection: wide ? 'row' : 'column' }}>
      {wide ? list : null}
      <TabSlot style={styles.slot} />
      {wide ? null : list}
    </Tabs>
  );
}

function Rail({ children, ...props }: TabListProps) {
  const theme = useTheme();
  return (
    <View {...props} style={[styles.rail, { backgroundColor: theme.cover }]} accessibilityRole="navigation">
      <View style={styles.brand}>
        <Wordmark />
      </View>
      <View style={styles.railItems}>{children}</View>
      <View style={styles.railFoot}>
        <Button label="New entry" icon="plus" variant="cover" onPress={() => router.push('/new')} />
      </View>
    </View>
  );
}

type ItemProps = TabTriggerSlotProps & { icon: IconName };

function RailItem({ children, isFocused, icon, ...props }: ItemProps) {
  const theme = useTheme();
  return (
    // Slot props carry a web-specific ref type that Pressable's typings reject.
    <Pressable
      {...(props as PressableProps)}
      style={({ hovered }) => [
        styles.railItem,
        (isFocused || hovered) && { backgroundColor: theme.coverRaised },
      ]}>
      <Icon name={icon} size={18} color={isFocused ? 'gold' : 'coverTextSecondary'} />
      <ThemedText type="defaultBold" themeColor={isFocused ? 'coverText' : 'coverTextSecondary'}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

function BottomBar({ children, ...props }: TabListProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      {...props}
      accessibilityRole="navigation"
      style={[
        styles.bar,
        { backgroundColor: theme.backgroundElement, borderTopColor: theme.rule, paddingBottom: insets.bottom },
      ]}>
      {children}
    </View>
  );
}

function BarItem({ children, isFocused, icon, ...props }: ItemProps) {
  return (
    <Pressable {...(props as PressableProps)} style={styles.barItem}>
      <Icon name={icon} size={20} color={isFocused ? 'accent' : 'textSecondary'} />
      <ThemedText type="caption" themeColor={isFocused ? 'accent' : 'textSecondary'}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
  rail: {
    width: RailWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  brand: { paddingHorizontal: Spacing.two, paddingBottom: Spacing.two },
  railItems: { gap: Spacing.one, flex: 1 },
  railItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    minHeight: 44,
    borderRadius: Radius.control,
  },
  railFoot: {},
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 56,
    paddingVertical: Spacing.one,
  },
});
