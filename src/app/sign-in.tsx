import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { TileScope } from '@/components/screen';
import { Field, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Wordmark } from '@/components/wordmark';
import { Radius, Spacing, Tiles } from '@/constants/theme';
import { useScheme, useTheme } from '@/hooks/use-theme';
import { canUseDemo, useAuth } from '@/lib/auth';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

/**
 * Email one-time-code sign-in. A typed code works the same on web, iOS and
 * Android, so there is no deep-link setup to get right before the first build.
 */
export default function SignInScreen() {
  const theme = useTheme();
  const scheme = useScheme();
  const tile = Tiles[scheme].agenda;
  const insets = useSafeAreaInsets();
  const { enterDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<{ error: Error | null }>, onOk?: () => void) {
    setBusy(true);
    setError(null);
    const { error } = await action();
    setBusy(false);
    if (error) setError(error.message);
    else onOk?.();
  }

  const sendCode = () =>
    run(
      () => requireSupabase().auth.signInWithOtp({ email: email.trim() }),
      () => setCodeSent(true),
    );

  const verify = () =>
    run(() => requireSupabase().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' }));

  return (
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: tile.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + Spacing.five }]}
        keyboardShouldPersistTaps="handled">
        <TileScope tone="agenda">
        <View style={styles.column}>
          <View style={styles.brand}>
            <Wordmark size="large" outline={scheme === 'light' ? tile.text : undefined} />
            <ThemedText type="title" style={[styles.tagline, { color: tile.text }]}>
              Your days and your money, in one ledger.
            </ThemedText>
            <ThemedText style={{ color: tile.textSecondary }}>
              Tasks, events and bills next to every account, asset and debt, in rupiah, euro, dollar and zloty.
            </ThemedText>
          </View>

          <View style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}>
            {!isSupabaseConfigured ? (
              <>
                <ThemedText type="heading">Connect your database to sign in</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Supabase isn&apos;t configured on this device yet. Copy .env.example to .env.local, add your
                  project URL and anon key, then restart the app. The README has the steps.
                </ThemedText>
              </>
            ) : codeSent ? (
              <>
                <ThemedText type="heading">Enter the code we emailed you</ThemedText>
                <Field label="6-digit code">
                  <TextField
                    value={code}
                    onChangeText={setCode}
                    placeholder="123456"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    onSubmitEditing={verify}
                    autoFocus
                  />
                </Field>
                <Button label="Sign in" onPress={verify} loading={busy} disabled={code.trim().length < 6} />
                <Button label="Use a different email" variant="plain" onPress={() => setCodeSent(false)} />
              </>
            ) : (
              <>
                <ThemedText type="heading">Sign in or create an account</ThemedText>
                <Field label="Email">
                  <TextField
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onSubmitEditing={sendCode}
                  />
                </Field>
                <Button label="Email me a code" onPress={sendCode} loading={busy} disabled={!email.includes('@')} />
              </>
            )}
            {error ? (
              <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
                {error}
              </ThemedText>
            ) : null}
          </View>

          {canUseDemo ? (
            <View style={styles.demo}>
              <Button label="Explore with sample data" variant="tile" icon="compass" onPress={enterDemo} />
              <ThemedText type="small" style={[styles.center, { color: tile.textSecondary }]}>
                Invented entries, kept only on this screen. Nothing is saved.
              </ThemedText>
            </View>
          ) : null}
        </View>
        </TileScope>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  column: { width: '100%', maxWidth: 440, gap: Spacing.five },
  brand: { gap: Spacing.three },
  tagline: { marginTop: Spacing.three },
  sheet: { borderRadius: Radius.sheet, padding: Spacing.four, gap: Spacing.three },
  demo: { gap: Spacing.two },
  center: { textAlign: 'center' },
});
