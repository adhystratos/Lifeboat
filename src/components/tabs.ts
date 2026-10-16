import type { Href } from 'expo-router';

/** The app's main sections, shared by the native and web tab bars. */
export const TABS = [
  { name: 'index', href: '/', label: 'Today', sf: 'checklist', md: 'today' },
  { name: 'calendar', href: '/calendar', label: 'Calendar', sf: 'calendar', md: 'calendar_month' },
  { name: 'money', href: '/money', label: 'Money', sf: 'creditcard', md: 'account_balance_wallet' },
  { name: 'assets', href: '/assets', label: 'Assets', sf: 'chart.pie', md: 'savings' },
  { name: 'settings', href: '/settings', label: 'Settings', sf: 'gearshape', md: 'settings' },
] as const satisfies readonly { name: string; href: Href; label: string; sf: string; md: string }[];
