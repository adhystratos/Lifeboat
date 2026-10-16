import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card, EmptyState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { CURRENCIES } from '@/core';
import { useAuth } from '@/lib/auth';
import { useSetBaseCurrency, useWorkspace } from '@/lib/queries';
import { requireSupabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { session } = useAuth();
  const { data: workspace, error } = useWorkspace();
  const setBaseCurrency = useSetBaseCurrency();

  return (
    <Screen title="Settings">
      <Card title="Main currency">
        <ThemedText type="small" themeColor="textSecondary">
          Totals and net worth are shown in this currency. Each account keeps its own.
        </ThemedText>
        {error ? <EmptyState>Couldn&apos;t load settings: {error.message}</EmptyState> : null}
        <View style={styles.chips}>
          {CURRENCIES.map((c) => {
            const selected = workspace?.base_currency === c;
            return (
              <Pressable
                key={c}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                disabled={!workspace || setBaseCurrency.isPending}
                onPress={() => workspace && setBaseCurrency.mutate({ workspaceId: workspace.id, currency: c })}>
                <ThemedView type={selected ? 'backgroundSelected' : 'background'} style={styles.chip}>
                  <ThemedText type={selected ? 'smallBold' : 'small'}>{c}</ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </View>
      </Card>
      <Card title="Account">
        <ThemedText type="small" themeColor="textSecondary">
          Signed in as {session?.user.email}
        </ThemedText>
        <Button label="Sign out" variant="plain" onPress={() => requireSupabase().auth.signOut()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.three },
});
