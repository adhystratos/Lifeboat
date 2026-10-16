import type { Href } from 'expo-router';

import type { IconName } from './icon';

/** The app's main sections, shared by the native and web tab bars. */
export const TABS = [
  { name: 'index', href: '/', label: 'Today', sf: 'sun.max', md: 'today', icon: 'sun' },
  { name: 'calendar', href: '/calendar', label: 'Calendar', sf: 'calendar', md: 'calendar_month', icon: 'calendar' },
  { name: 'money', href: '/money', label: 'Money', sf: 'creditcard', md: 'account_balance_wallet', icon: 'credit-card' },
  { name: 'wealth', href: '/wealth', label: 'Net worth', sf: 'chart.pie', md: 'savings', icon: 'pie-chart' },
  { name: 'settings', href: '/settings', label: 'Settings', sf: 'gearshape', md: 'settings', icon: 'settings' },
] as const satisfies readonly { name: string; href: Href; label: string; sf: string; md: string; icon: IconName }[];
