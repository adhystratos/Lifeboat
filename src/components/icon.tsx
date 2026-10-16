import Feather from '@expo/vector-icons/Feather';
import { ComponentProps } from 'react';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type IconName = ComponentProps<typeof Feather>['name'];

/** One icon family (Feather, 2px stroke) across the app. */
export function Icon({
  name,
  size = 20,
  color = 'text',
}: {
  name: IconName;
  size?: number;
  color?: ThemeColor;
}) {
  const theme = useTheme();
  return <Feather name={name} size={size} color={theme[color]} accessibilityElementsHidden importantForAccessibility="no" />;
}
