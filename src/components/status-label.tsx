import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DATE_LOCALE, FontFiles, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StatusKind = 'done' | 'paid' | 'overdue' | 'due' | 'scheduled' | 'transfer';

const DEFAULT_LABEL: Record<StatusKind, string> = {
  done: 'Done',
  paid: 'Paid',
  overdue: 'Overdue',
  due: 'Due',
  scheduled: 'Due',
  transfer: 'Transfer',
};

const shortDay = new Intl.DateTimeFormat(DATE_LOCALE, { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** "17 Oct" from a "YYYY-MM-DD" day. */
export function labelDate(day: string): string {
  return shortDay.format(new Date(`${day}T00:00:00Z`));
}

/**
 * An entry's state as a flat pill: done and paid are inked in, due and
 * scheduled are outlined, overdue is red. With `fresh`, it pops in once.
 */
export function StatusLabel({
  kind,
  label,
  day,
  fresh,
}: {
  kind: StatusKind;
  label?: string;
  day?: string;
  fresh?: boolean;
}) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(fresh && !reduceMotion ? 0 : 1);

  useEffect(() => {
    if (fresh && !reduceMotion) {
      pop.value = withTiming(1, { duration: 240, easing: Easing.out(Easing.exp) });
    }
  }, [fresh, reduceMotion, pop]);

  const animated = useAnimatedStyle(() => ({
    opacity: Math.min(1, pop.value * 1.5),
    transform: [{ scale: 1.25 - 0.25 * pop.value }],
  }));

  const filled = kind === 'done' || kind === 'paid';
  const look = filled
    ? { backgroundColor: theme.statusDone, borderColor: theme.statusDone, color: theme.onStatusDone }
    : kind === 'overdue'
      ? { backgroundColor: theme.statusOverdue, borderColor: theme.statusOverdue, color: theme.onStatusOverdue }
      : kind === 'transfer'
        ? { backgroundColor: 'transparent', borderColor: theme.rule, color: theme.textSecondary }
        : { backgroundColor: 'transparent', borderColor: theme.statusDue, color: theme.text };

  const text = [label ?? DEFAULT_LABEL[kind], day ? labelDate(day) : null].filter(Boolean).join(' ');

  return (
    <Animated.View
      style={[styles.pill, { backgroundColor: look.backgroundColor, borderColor: look.borderColor }, animated]}
      accessible
      accessibilityLabel={text}>
      <Animated.Text style={[styles.text, { color: look.color }]} numberOfLines={1}>
        {text}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: { borderWidth: 1.5, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  text: { fontFamily: FontFiles.extrabold, fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
});
