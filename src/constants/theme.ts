/**
 * Lifeboat's visual system ("Passport"). A flat bottle-green cover field owns
 * the top of every screen, entries sit on white sheets over a cool mint page,
 * and state is shown as stamp ink. See DESIGN.md for the full rules.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Page ground behind the sheets. */
    background: '#EAF0EC',
    /** Sheets (grouped lists, form fields). */
    backgroundElement: '#FFFFFF',
    /** Pressed rows, selected chips, quiet buttons. */
    backgroundSelected: '#DCE6E0',
    text: '#13201C',
    textSecondary: '#52615B',
    /** Hairline rules between rows. */
    rule: '#D3DDD7',
    /** Primary actions, links, current selection. */
    accent: '#1E5244',
    onAccent: '#FFFFFF',
    danger: '#B8322B',
    /** The cover band and the side rail. */
    cover: '#17352E',
    coverRaised: '#21443B',
    coverText: '#F1F5F2',
    coverTextSecondary: '#A9C2B8',
    /** Overdue counts on the cover band (bold only; about 4.4:1 on the cover). */
    coverAlert: '#F07167',
    /** Gold foil: the wordmark and today's marker only. */
    gold: '#D2AA55',
    stampGreen: '#1E7A4C',
    stampRed: '#B8322B',
    stampViolet: '#5B3FA8',
    stampBlue: '#2453A6',
  },
  dark: {
    background: '#0C1613',
    backgroundElement: '#14231F',
    backgroundSelected: '#1E332D',
    text: '#E6EEEA',
    textSecondary: '#9EB2AA',
    rule: '#25392F',
    accent: '#93D3B6',
    onAccent: '#0C1613',
    danger: '#F07167',
    cover: '#153029',
    coverRaised: '#1E3E35',
    coverText: '#F1F5F2',
    coverTextSecondary: '#A9C2B8',
    coverAlert: '#F07167',
    gold: '#D9B462',
    stampGreen: '#55C48D',
    stampRed: '#F07167',
    stampViolet: '#AB97F2',
    stampBlue: '#7FA9F2',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Hanken Grotesk, one family for everything; loaded in the root layout. */
export const FontFiles = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
  extrabold: 'HankenGrotesk_800ExtraBold',
} as const;

export type FontWeightName = keyof typeof FontFiles;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sheet: 16,
  control: 12,
  pill: 999,
} as const;

/** Native tab bars float over content; leave room at the bottom of scroll views. */
export const BottomTabInset = Platform.select({ ios: 50, android: 80, default: 0 }) ?? 0;
export const MaxContentWidth = 760;
/** At or above this web width the side rail replaces the bottom tab bar. */
export const RailBreakpoint = 900;
export const RailWidth = 240;

/**
 * Dates and times use one fixed English locale (day before month, 24-hour
 * clock) so they match the English copy and the stamps on every device.
 */
export const DATE_LOCALE = 'en-GB';
