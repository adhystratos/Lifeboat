/**
 * Lifeboat's visual system ("Overprint"). Light mode prints in two inks on
 * clean white: turmeric for the agenda, sea teal for money, and the green
 * they make where they overlap marks a bill (both a date and a payment).
 * Dark mode is a calm warm graphite with colour kept for meaning only.
 * See DESIGN.md for the full rules.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Page ground behind the sheets. */
    background: '#F6F6F3',
    /** Sheets (grouped lists, form fields). */
    backgroundElement: '#FFFFFF',
    /** Pressed rows, selected chips, quiet buttons. */
    backgroundSelected: '#ECECE7',
    text: '#17171C',
    textSecondary: '#5C5C63',
    /** Hairline rules between rows. */
    rule: '#E4E4DE',
    /** Primary actions, links, current selection: printed in ink. */
    accent: '#17171C',
    onAccent: '#FFFFFF',
    danger: '#C42034',
    /** Money coming in. */
    positive: '#1E7A45',
    /** Agenda ink: the bill marker's first dot. */
    agendaInk: '#FFB511',
    /** Money ink: the bill marker's second dot and single-series charts. */
    moneyInk: '#007780',
    /** Single-series charts (spending by category). */
    chartSingle: '#007780',
    /** Today's ring in the calendar. */
    todayMark: '#E8329A',
    /** Entry states: done and paid are inked in, due is outlined, overdue is red. */
    statusDone: '#17171C',
    onStatusDone: '#FFFFFF',
    statusDue: '#17171C',
    statusOverdue: '#D7263D',
    onStatusOverdue: '#FFFFFF',
  },
  dark: {
    background: '#131312',
    backgroundElement: '#1B1B1A',
    backgroundSelected: '#262523',
    text: '#E7E5DF',
    textSecondary: '#A39F97',
    rule: '#2C2B29',
    accent: '#E7E5DF',
    onAccent: '#131312',
    danger: '#E39A94',
    positive: '#9DC4A5',
    agendaInk: '#8F8A7E',
    moneyInk: '#5F5D58',
    chartSingle: '#7EA8A5',
    todayMark: '#E7E5DF',
    statusDone: '#2C2B29',
    onStatusDone: '#D3D0C9',
    statusDue: '#6A6862',
    statusOverdue: '#3A2422',
    onStatusOverdue: '#E3A39D',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Which family a screen belongs to; it picks the colour of the title tile. */
export type Tone = 'agenda' | 'money' | 'plain';

export type TileColors = {
  /** The tile itself. */
  background: string;
  text: string;
  textSecondary: string;
  /** Buttons and chips sitting on the tile. */
  raised: string;
  onRaised: string;
};

const NIGHT_TILE: TileColors = {
  background: '#252421',
  text: '#E7E5DF',
  textSecondary: '#A39F97',
  raised: '#33322F',
  onRaised: '#E7E5DF',
};

/**
 * Title tiles. Light mode prints them in the screen's ink; dark mode keeps
 * every tile the same quiet graphite so night use stays calm.
 */
export const Tiles: Record<'light' | 'dark', Record<Tone, TileColors>> = {
  light: {
    agenda: { background: '#FFB511', text: '#17171C', textSecondary: '#4A3A0E', raised: '#17171C', onRaised: '#FFB511' },
    money: { background: '#007780', text: '#FFFFFF', textSecondary: '#E3F2F2', raised: '#FFFFFF', onRaised: '#005A61' },
    plain: { background: '#ECECE7', text: '#17171C', textSecondary: '#5C5C63', raised: '#17171C', onRaised: '#FFFFFF' },
  },
  dark: { agenda: NIGHT_TILE, money: NIGHT_TILE, plain: NIGHT_TILE },
};

/** Bricolage Grotesque, one family for everything; loaded in the root layout. */
export const FontFiles = {
  regular: 'BricolageGrotesque_400Regular',
  medium: 'BricolageGrotesque_500Medium',
  semibold: 'BricolageGrotesque_600SemiBold',
  bold: 'BricolageGrotesque_700Bold',
  extrabold: 'BricolageGrotesque_800ExtraBold',
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
  tile: 24,
  sheet: 20,
  control: 14,
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
 * clock) so they match the English copy on every device.
 */
export const DATE_LOCALE = 'en-GB';
