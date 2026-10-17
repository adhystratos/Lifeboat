import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

type Toast = { message: string; action?: { label: string; onPress: () => void } };

const ToastContext = createContext<(toast: Toast) => void>(() => {});

/** How long a confirmation stays up; long enough to reach Undo. */
const VISIBLE_MS = 6000;

/** Shows a short confirmation, with an optional action such as Undo. */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: PropsWithChildren) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [toast, setToast] = useState<(Toast & { key: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: Toast) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ ...next, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), VISIBLE_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Clear the tab bar (native tabs float, the web bar is about 56 high) and the floating New button above it.
  const bottom = insets.bottom + (Platform.OS === 'web' ? 72 : BottomTabInset + Spacing.three) + 64;

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={[styles.layer, { bottom }]}>
          <Animated.View
            key={toast.key}
            // Web layout animations start hidden and wait for a frame; the toast must be tappable at once.
            entering={reduceMotion || Platform.OS === 'web' ? undefined : FadeInDown.duration(200)}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={[styles.toast, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" themeColor="onAccent" style={styles.message}>
              {toast.message}
            </ThemedText>
            {toast.action ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => {
                  toast.action?.onPress();
                  setToast(null);
                }}
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                <ThemedText type="link" themeColor="onAccent">
                  {toast.action.label}
                </ThemedText>
              </Pressable>
            ) : null}
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  // Above every screen, including the navigator's own stacked layers.
  layer: { position: 'absolute', left: Spacing.three, right: Spacing.three, alignItems: 'center', zIndex: 1000, elevation: 8 },
  toast: {
    width: '100%',
    maxWidth: MaxContentWidth,
    minHeight: 52,
    borderRadius: Radius.pill,
    paddingLeft: 20,
    paddingRight: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  message: { flex: 1 },
  action: { minHeight: 44, minWidth: 64, paddingHorizontal: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
});
