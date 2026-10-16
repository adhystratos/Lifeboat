import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Button } from '@/components/button';
import { Card, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';

/**
 * Email one-time-code sign-in. A typed code works the same on web, iOS and
 * Android, so there is no deep-link setup to get right before the first build.
 */
export default function SignInScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <Screen title="Lifeboat">
        <Card title="Almost there">
          <ThemedText type="small">
            Supabase isn&apos;t configured yet. Copy .env.example to .env.local, fill in your
            project URL and anon key, then restart the dev server. See the README for details.
          </ThemedText>
        </Card>
      </Screen>
    );
  }

  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.background, borderColor: theme.backgroundSelected },
  ];

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
    run(() =>
      requireSupabase().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' }),
    );

  return (
    <Screen title="Lifeboat">
      <ThemedText themeColor="textSecondary">Your agenda and your money, in one place.</ThemedText>
      <Card title={codeSent ? 'Enter the code we emailed you' : 'Sign in or create an account'}>
        {codeSent ? (
          <>
            <TextInput
              style={inputStyle}
              value={code}
              onChangeText={setCode}
              placeholder="6-digit code"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              onSubmitEditing={verify}
            />
            <Button label="Sign in" onPress={verify} loading={busy} disabled={code.trim().length < 6} />
            <Button label="Use a different email" variant="plain" onPress={() => setCodeSent(false)} />
          </>
        ) : (
          <>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onSubmitEditing={sendCode}
            />
            <Button label="Email me a code" onPress={sendCode} loading={busy} disabled={!email.includes('@')} />
          </>
        )}
        {error ? (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {error}
          </ThemedText>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
