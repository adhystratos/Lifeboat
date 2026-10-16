import { StyleSheet } from 'react-native';

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
    <Screen
      title="Settings"
      cover={
        <ThemedText type="title" themeColor="coverText" style={styles.cover} numberOfLines={1}>
          {demo ? 'Sample workspace' : (session?.user.email ?? 'Your workspace')}
        </ThemedText>
      }>
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
      <Section title="Account" padded>
        <ThemedText type="small" themeColor="textSecondary">
          {demo ? 'You are exploring with sample data. Nothing is saved.' : `Signed in as ${session?.user.email ?? ''}`}
        </ThemedText>
        {demo ? (
          <Button label="Leave sample data" variant="plain" onPress={leaveDemo} />
        ) : (
          <Button label="Sign out" variant="plain" onPress={() => requireSupabase().auth.signOut()} />
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: { marginTop: Spacing.three },
});
