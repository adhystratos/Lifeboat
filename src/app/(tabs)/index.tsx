import { Card, EmptyState, Screen } from '@/components/screen';

const today = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export default function TodayScreen() {
  return (
    <Screen title={today.format(new Date())}>
      <Card title="Tasks">
        <EmptyState>No tasks due today.</EmptyState>
      </Card>
      <Card title="Events">
        <EmptyState>Nothing on the calendar.</EmptyState>
      </Card>
      <Card title="Bills due">
        <EmptyState>No bills due today.</EmptyState>
      </Card>
    </Screen>
  );
}
