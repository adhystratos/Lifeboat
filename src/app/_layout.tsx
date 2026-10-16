import { HankenGrotesk_400Regular } from '@expo-google-fonts/hanken-grotesk/400Regular';
import { HankenGrotesk_500Medium } from '@expo-google-fonts/hanken-grotesk/500Medium';
import { HankenGrotesk_600SemiBold } from '@expo-google-fonts/hanken-grotesk/600SemiBold';
import { HankenGrotesk_700Bold } from '@expo-google-fonts/hanken-grotesk/700Bold';
import { HankenGrotesk_800ExtraBold } from '@expo-google-fonts/hanken-grotesk/800ExtraBold';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });

const ENTRY_SCREENS = [
  'new',
  'new-task',
  'new-event',
  'new-bill',
  'new-transaction',
  'new-account',
  'new-asset',
  'new-liability',
] as const;

function RootNavigator() {
  const { session, loading, demo } = useAuth();
  const [fontsLoaded, fontError] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
  });
  // A font that fails to load falls back to the system face rather than blocking the app.
  const ready = !loading && (fontsLoaded || Boolean(fontError));

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={Boolean(session) || demo}>
        <Stack.Screen name="(tabs)" />
        {ENTRY_SCREENS.map((name) => (
          <Stack.Screen key={name} name={name} options={{ presentation: 'modal' }} />
        ))}
      </Stack.Protected>
      <Stack.Protected guard={!session && !demo}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: Colors[scheme].background, primary: Colors[scheme].accent },
  };
  return (
    <ThemeProvider value={navTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
