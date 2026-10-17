import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** A light tap when something is finished (task done, bill paid). Phones only. */
export function confirmTap() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
