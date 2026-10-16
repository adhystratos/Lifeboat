import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFiles, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextType =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'heading'
  | 'default'
  | 'defaultBold'
  | 'small'
  | 'smallBold'
  | 'caption'
  | 'link';

export type ThemedTextProps = TextProps & {
  type?: TextType;
  themeColor?: ThemeColor;
  /** Tabular figures, for amounts and dates that line up in columns. */
  numeric?: boolean;
};

export function ThemedText({ style, type = 'default', themeColor, numeric, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color = theme[themeColor ?? (type === 'link' ? 'accent' : 'text')];
  return (
    <Text
      style={[{ color }, styles[type], numeric && styles.numeric, style]}
      maxFontSizeMultiplier={type === 'display' ? 1.3 : 1.6}
      {...rest}
    />
  );
}

/**
 * Type scale. Custom fonts on Android need one family per weight, so weight
 * is chosen through the family name rather than fontWeight.
 */
const styles = StyleSheet.create({
  display: { fontFamily: FontFiles.extrabold, fontSize: 44, lineHeight: 48, letterSpacing: -1.3 },
  title: { fontFamily: FontFiles.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  subtitle: { fontFamily: FontFiles.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  heading: { fontFamily: FontFiles.bold, fontSize: 17, lineHeight: 24, letterSpacing: -0.1 },
  default: { fontFamily: FontFiles.medium, fontSize: 16, lineHeight: 22 },
  defaultBold: { fontFamily: FontFiles.semibold, fontSize: 16, lineHeight: 22 },
  small: { fontFamily: FontFiles.medium, fontSize: 14, lineHeight: 20 },
  smallBold: { fontFamily: FontFiles.bold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: FontFiles.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  link: { fontFamily: FontFiles.semibold, fontSize: 14, lineHeight: 20 },
  numeric: { fontVariant: ['tabular-nums'] },
});
