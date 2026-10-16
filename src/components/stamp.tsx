import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DATE_LOCALE, FontFiles } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StampKind = 'done' | 'paid' | 'overdue' | 'due' | 'scheduled' | 'transfer';

const INK = {
  done: 'stampGreen',
  paid: 'stampGreen',
  overdue: 'stampRed',
  due: 'stampViolet',
  scheduled: 'stampViolet',
  transfer: 'stampBlue',
} as const;

const DEFAULT_LABEL: Record<StampKind, string> = {
  done: 'Done',
  paid: 'Paid',
  overdue: 'Overdue',
  due: 'Due',
  scheduled: 'Scheduled',
  transfer: 'Transfer',
};

const shortDay = new Intl.DateTimeFormat(DATE_LOCALE, { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** "17 OCT" from a "YYYY-MM-DD" day. */
export function stampDate(day: string): string {
  return shortDay.format(new Date(`${day}T00:00:00Z`)).toUpperCase();
}

/**
 * The signature mark: a rotated, double-ruled ink stamp that records an
 * entry's state (done, paid, overdue, due). With `fresh`, it presses in once.
 */
export function Stamp({
  kind,
  label,
  day,
  fresh,
}: {
  kind: StampKind;
  label?: string;
  day?: string;
  fresh?: boolean;
}) {
  const theme = useTheme();
  const ink = theme[INK[kind]];
  const reduceMotion = useReducedMotion();
  const press = useSharedValue(fresh && !reduceMotion ? 0 : 1);

  useEffect(() => {
    if (fresh && !reduceMotion) {
      press.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.exp) });
    }
  }, [fresh, reduceMotion, press]);

  const animated = useAnimatedStyle(() => ({
    opacity: 0.92 * Math.min(1, press.value * 1.6),
    transform: [{ rotate: '-6deg' }, { scale: 1.5 - 0.5 * press.value }],
  }));

  const text = [label ?? DEFAULT_LABEL[kind], day ? stampDate(day) : null].filter(Boolean).join(' ');

  return (
    <Animated.View
      style={[styles.outer, { borderColor: ink }, animated]}
      accessible
      accessibilityLabel={text}>
      <View style={[styles.inner, { borderColor: ink }]}>
        <Animated.Text style={[styles.text, { color: ink }]} numberOfLines={1}>
          {text.toUpperCase()}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: { borderWidth: 2, borderRadius: 6, padding: 2 },
  inner: { borderWidth: 1, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 1 },
  text: { fontFamily: FontFiles.extrabold, fontSize: 11, lineHeight: 15, letterSpacing: 1.1 },
});
