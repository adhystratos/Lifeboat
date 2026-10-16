import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';

import { TABS } from './tabs';

export default function AppTabs() {
  const theme = useTheme();
  return (
    <NativeTabs
      backgroundColor={theme.backgroundElement}
      indicatorColor={theme.backgroundSelected}
      tintColor={theme.accent}
      labelStyle={{ selected: { color: theme.accent } }}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
