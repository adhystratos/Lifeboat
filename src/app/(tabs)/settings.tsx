import { Button } from '@/components/button';
import { ChipGroup } from '@/components/form';
import { Card, EmptyState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
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
        <ChipGroup
          options={CURRENCIES.map((c) => ({ value: c, label: c }))}
          value={workspace?.base_currency ?? null}
          disabled={!workspace || setBaseCurrency.isPending}
          onChange={(currency) => workspace && setBaseCurrency.mutate({ workspaceId: workspace.id, currency })}
        />
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
