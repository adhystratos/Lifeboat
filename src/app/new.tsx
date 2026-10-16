import { Href, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/button';
import { closeForm } from '@/components/form';
import { Icon, IconName } from '@/components/icon';
import { Row, Section } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const GROUPS: { title: string; items: { href: Href; icon: IconName; title: string; subtitle: string }[] }[] = [
  {
    title: 'Agenda',
    items: [
      { href: '/new-task', icon: 'check-circle', title: 'Task', subtitle: 'Something to do, with or without a date' },
      { href: '/new-event', icon: 'calendar', title: 'Event', subtitle: 'A meeting, session or trip at a set time' },
    ],
  },
  {
    title: 'Money',
    items: [
      { href: '/new-transaction', icon: 'arrow-up-right', title: 'Transaction', subtitle: 'Money in, out, or between accounts' },
      { href: '/new-bill', icon: 'repeat', title: 'Bill or regular income', subtitle: 'Repeats weekly, monthly, quarterly or yearly' },
      { href: '/new-account', icon: 'briefcase', title: 'Account', subtitle: 'Bank, cash or e-wallet in any currency' },
    ],
  },
  {
    title: 'Net worth',
    items: [
      { href: '/new-asset', icon: 'home', title: 'Asset', subtitle: 'Property, gold, a vehicle, investments' },
      { href: '/new-liability', icon: 'minus-circle', title: 'Debt', subtitle: 'A mortgage, loan or card balance' },
    ],
  },
];

/** "New entry": every kind of entry in one place. */
export default function NewEntryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.six }]}>
      <View style={styles.column}>
        <View style={styles.head}>
          <ThemedText type="title" accessibilityRole="header">
            New entry
          </ThemedText>
          <IconButton icon="x" label="Close" onPress={closeForm} />
        </View>
        {GROUPS.map((g) => (
          <Section key={g.title} title={g.title}>
            {g.items.map((item) => (
              <Row
                key={item.title}
                leading={<Icon name={item.icon} color="accent" />}
                title={item.title}
                subtitle={item.subtitle}
                trailing={<Icon name="chevron-right" color="textSecondary" />}
                onPress={() => router.replace(item.href)}
              />
            ))}
          </Section>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.three, alignItems: 'center' },
  column: { width: '100%', maxWidth: MaxContentWidth - 160, gap: Spacing.four },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
