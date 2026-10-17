import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ChipGroup } from '@/components/form';
import { SampleNotice } from '@/components/sample-notice';
import { EmptyState, Screen, Section } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { CURRENCIES } from '@/core';
import { useAuth } from '@/lib/auth';
import { useSetBaseCurrency, useWorkspace } from '@/lib/queries';
import { requireSupabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { session, demo, leaveDemo } = useAuth();
  const { data: workspace, error } = useWorkspace();
  const setBaseCurrency = useSetBaseCurrency();

  return (
    <Screen title="Settings" subtitle={demo ? 'Sample workspace' : (session?.user.email ?? 'Your workspace')}>
      <SampleNotice />
      <Section
        title="Main currency"
        padded
        note="Totals and net worth are shown in this currency. Each account keeps its own currency.">
        {error ? <EmptyState>Couldn&apos;t load settings: {error.message}</EmptyState> : null}
        <ChipGroup
          options={CURRENCIES.map((c) => ({ value: c, label: c }))}
          value={workspace?.base_currency ?? null}
          disabled={!workspace || setBaseCurrency.isPending}
          onChange={(currency) => workspace && setBaseCurrency.mutate({ workspaceId: workspace.id, currency })}
        />
      </Section>

      {/* Leaving the workspace sits apart from everything else, so it is never tapped by mistake. */}
      <View style={styles.leave}>
        <ThemedText type="small" themeColor="textSecondary">
          {demo ? 'You are exploring with sample data. Nothing is saved.' : `Signed in as ${session?.user.email ?? ''}`}
        </ThemedText>
        {demo ? (
          <Button label="Leave sample data" variant="danger" icon="log-out" onPress={leaveDemo} />
        ) : (
          <Button label="Sign out" variant="danger" icon="log-out" onPress={() => requireSupabase().auth.signOut()} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  leave: { marginTop: Spacing.six, gap: Spacing.three, paddingHorizontal: Spacing.one },
});
