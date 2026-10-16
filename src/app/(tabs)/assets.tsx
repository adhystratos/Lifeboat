import { Card, EmptyState, Screen } from '@/components/screen';

export default function AssetsScreen() {
  return (
    <Screen title="Assets">
      <Card title="Net worth">
        <EmptyState>Add property, vehicles, gold, investments and loans to see your net worth.</EmptyState>
      </Card>
    </Screen>
  );
}
