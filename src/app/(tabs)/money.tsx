import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Card, EmptyState, Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { formatMoney } from '@/core';
import { useAccountBalances } from '@/lib/queries';

export default function MoneyScreen() {
  const { data: accounts, isLoading, error } = useAccountBalances();

  return (
    <Screen title="Money">
      <Card title="Accounts">
        {isLoading ? <ActivityIndicator /> : null}
        {error ? <EmptyState>Couldn&apos;t load accounts: {error.message}</EmptyState> : null}
        {accounts?.length === 0 ? <EmptyState>No accounts yet.</EmptyState> : null}
        {accounts?.map((a) => (
          <View key={a.account_id} style={styles.row}>
            <View>
              <ThemedText>{a.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {a.type} · {a.currency}
              </ThemedText>
            </View>
            <ThemedText type="smallBold">{formatMoney(a.balance_minor, a.currency)}</ThemedText>
          </View>
        ))}
      </Card>
      <Card title="This month">
        <EmptyState>Transactions and budgets arrive in the next milestone.</EmptyState>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
