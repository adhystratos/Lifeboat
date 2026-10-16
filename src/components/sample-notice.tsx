import { useAuth } from '@/lib/auth';

import { Icon } from './icon';
import { Row, Section } from './screen';
import { ThemedText } from './themed-text';

/** Shown on the main screens while exploring with sample data. */
export function SampleNotice() {
  const { demo, leaveDemo } = useAuth();
  if (!demo) return null;
  return (
    <Section>
      <Row
        leading={<Icon name="info" color="stampViolet" />}
        title="You're looking at sample data"
        subtitle="Invented entries. Changes last until you reload the app."
        trailing={<ThemedText type="link">Leave</ThemedText>}
        onPress={leaveDemo}
        accessibilityHint="Leaves sample mode and returns to sign in"
      />
    </Section>
  );
}
