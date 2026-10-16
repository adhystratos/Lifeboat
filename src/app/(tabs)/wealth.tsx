import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, IconButton } from '@/components/button';
import { CompositionBar, Part } from '@/components/composition-bar';
import { AmountField } from '@/components/form';
import { Icon } from '@/components/icon';
import { SampleNotice } from '@/components/sample-notice';
import { CoverFigure, EmptyState, Row, Screen, Section } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { DATE_LOCALE, Spacing } from '@/constants/theme';
import { convertMinor, Currency, formatMoney, FxRate, localToday, netWorthPartial, parseAmount, toMajor } from '@/core';
import { ASSET_GROUPS, ASSET_TYPES, LIABILITY_TYPES } from '@/lib/labels';
import {
  Asset,
  Liability,
  useAccountBalances,
  useAddLiabilityBalance,
  useAddValuation,
  useAssets,
  useDeleteAsset,
  useDeleteLiability,
  useFxRates,
  useLiabilities,
  useWorkspace,
} from '@/lib/queries';

const shortDate = new Intl.DateTimeFormat(DATE_LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const dateLabel = (day: string) => shortDate.format(new Date(`${day}T00:00:00Z`));

/** Values older than this are flagged so they get refreshed. */
const STALE_DAYS = 90;

function daysSince(day: string, today: string) {
  return Math.round((Date.parse(today) - Date.parse(day)) / 86_400_000);
}

function tryConvert(minor: number, from: Currency, to: Currency, rates: FxRate[]): number | null {
  try {
    return convertMinor(minor, from, to, rates);
  } catch {
    return null;
  }
}

export default function AssetsScreen() {
  const today = localToday();
  const { data: workspace } = useWorkspace();
  const { data: accounts = [] } = useAccountBalances();
  const assets = useAssets();
  const liabilities = useLiabilities();
  const { data: rates = [] } = useFxRates();
  const base: Currency = workspace?.base_currency ?? 'IDR';

  const assetList = assets.data ?? [];
  const debtList = liabilities.data ?? [];
  const worth = netWorthPartial(
    {
      accounts: accounts.map((a) => ({ amountMinor: a.balance_minor, currency: a.currency })),
      assets: assetList.filter((a) => a.value_minor !== null).map((a) => ({ amountMinor: a.value_minor!, currency: a.currency })),
      liabilities: debtList
        .filter((l) => l.balance_minor !== null)
        .map((l) => ({ amountMinor: l.balance_minor!, currency: l.currency })),
    },
    base,
    rates,
  );

  // Composition by group, in base currency. Holdings without a rate are left out (and named on the cover).
  const accountsInBase = accounts.reduce((sum, a) => sum + (tryConvert(a.balance_minor, a.currency, base, rates) ?? 0), 0);
  const parts: Part[] = [
    { key: 'accounts', label: 'Cash and accounts', amountMinor: Math.max(accountsInBase, 0), slot: 0 },
    ...ASSET_GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      slot: g.slot,
      amountMinor: assetList
        .filter((a) => g.types.includes(a.type) && a.value_minor !== null)
        .reduce((sum, a) => sum + (tryConvert(a.value_minor!, a.currency, base, rates) ?? 0), 0),
    })),
  ];

  const loading = assets.isLoading || liabilities.isLoading;

  return (
    <Screen
      title="Net worth"
      actions={<IconButton icon="plus" label="Add an asset" onCover onPress={() => router.push('/new-asset')} />}
      cover={
        <CoverFigure value={loading ? '…' : formatMoney(worth.total, base)} caption="Net worth">
          <ThemedText type="default" themeColor="coverTextSecondary" numeric>
            Accounts {formatMoney(worth.accounts, base)} · Assets {formatMoney(worth.assets, base)} · Debts{' '}
            {formatMoney(worth.liabilities, base)}
          </ThemedText>
          {worth.missing.length ? (
            <ThemedText type="small" themeColor="coverTextSecondary" style={styles.missing}>
              <Icon name="info" size={13} color="coverTextSecondary" />{' '}
              Not yet included: amounts in {worth.missing.join(', ')}. No exchange rate to {base} is available yet.
            </ThemedText>
          ) : null}
        </CoverFigure>
      }>
      <SampleNotice />

      {parts.some((p) => p.amountMinor > 0) ? (
        <Section title="What it's made of" padded>
          <CompositionBar parts={parts} debtsMinor={worth.liabilities} currency={base} />
        </Section>
      ) : null}

      <Section title="Assets" action={{ label: 'Add asset', onPress: () => router.push('/new-asset') }}>
        {loading ? <Row title="Loading…" muted leading={<ActivityIndicator />} /> : null}
        {assets.error ? <EmptyState>Couldn&apos;t load assets: {assets.error.message}</EmptyState> : null}
        {!loading && !assetList.length ? (
          <EmptyState action={{ label: 'Add your first asset', onPress: () => router.push('/new-asset') }}>
            Property, a vehicle, gold, investments or money someone owes you. Give each a value and update it now and then;
            your net worth follows.
          </EmptyState>
        ) : null}
        {assetList.map((a) => (
          <HoldingRow key={a.id} kind="asset" item={a} base={base} rates={rates} today={today} workspaceId={workspace?.id} />
        ))}
      </Section>

      <Section title="Debts" action={{ label: 'Add debt', onPress: () => router.push('/new-liability') }}>
        {!loading && !debtList.length ? (
          <EmptyState action={{ label: 'Add a loan or card', onPress: () => router.push('/new-liability') }}>
            Mortgages, loans and card balances are subtracted from your net worth.
          </EmptyState>
        ) : null}
        {debtList.map((l) => (
          <HoldingRow key={l.id} kind="debt" item={l} base={base} rates={rates} today={today} workspaceId={workspace?.id} />
        ))}
      </Section>

      <Section title="Accounts" action={{ label: 'Open Money', onPress: () => router.push('/money') }}>
        <Row
          title="Cash and accounts"
          subtitle={`${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}, balances from your transactions`}
          trailing={
            <ThemedText type="defaultBold" numeric>
              {formatMoney(worth.accounts, base)}
            </ThemedText>
          }
        />
      </Section>
    </Screen>
  );
}

type HoldingProps = {
  base: Currency;
  rates: FxRate[];
  today: string;
  workspaceId?: string;
} & ({ kind: 'asset'; item: Asset } | { kind: 'debt'; item: Liability });

/** An asset or debt with its latest value; tap to record a new value. */
function HoldingRow({ kind, item, base, rates, today, workspaceId }: HoldingProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const addValuation = useAddValuation();
  const addBalance = useAddLiabilityBalance();
  const deleteAsset = useDeleteAsset();
  const deleteDebt = useDeleteLiability();

  const amount = kind === 'asset' ? (item as Asset).value_minor : (item as Liability).balance_minor;
  const asOf = kind === 'asset' ? (item as Asset).valued_on : (item as Liability).as_of;
  const converted = amount !== null && item.currency !== base ? tryConvert(amount, item.currency, base, rates) : null;
  const stale = asOf !== null && daysSince(asOf, today) > STALE_DAYS;
  const typeLabel =
    kind === 'asset'
      ? (ASSET_TYPES.find((t) => t.value === (item as Asset).type)?.label ?? 'Asset')
      : (LIABILITY_TYPES.find((t) => t.value === (item as Liability).type)?.label ?? 'Debt');
  const rate = kind === 'debt' && (item as Liability).interest_rate !== null ? `${(item as Liability).interest_rate}%` : null;
  const subtitle = [typeLabel, rate, asOf ? `${kind === 'asset' ? 'valued' : 'as of'} ${dateLabel(asOf)}` : 'no value yet']
    .filter(Boolean)
    .join(' · ');

  const parsed = parseAmount(value, item.currency);
  const saving = addValuation.isPending || addBalance.isPending;

  function save() {
    if (parsed === null || parsed < 0 || !workspaceId) return;
    const done = { onSuccess: () => { setValue(''); setOpen(false); } };
    if (kind === 'asset') addValuation.mutate({ workspaceId, assetId: item.id, valueMinor: parsed, valuedOn: today }, done);
    else addBalance.mutate({ workspaceId, liabilityId: item.id, balanceMinor: parsed, asOf: today }, done);
  }

  return (
    <View>
      <Row
        title={item.name}
        subtitle={
          <ThemedText type="small" themeColor={stale ? 'stampViolet' : 'textSecondary'} numberOfLines={2}>
            {subtitle}
            {stale ? ' · time to update' : ''}
          </ThemedText>
        }
        trailing={
          <>
            <ThemedText type="defaultBold" numeric>
              {amount === null ? 'No value' : `${kind === 'debt' ? '−' : ''}${formatMoney(amount, item.currency)}`}
            </ThemedText>
            {converted !== null ? (
              <ThemedText type="caption" themeColor="textSecondary" numeric>
                ≈ {formatMoney(converted, base)}
              </ThemedText>
            ) : null}
          </>
        }
        onPress={() => setOpen((o) => !o)}
        accessibilityHint={kind === 'asset' ? 'Record a new value' : 'Record a new balance'}
      />
      {open ? (
        <View style={styles.update}>
          <AmountField
            currency={item.currency}
            value={value}
            onChangeText={setValue}
            placeholder={amount === null ? '0' : String(toMajor(amount, item.currency))}
            onSubmitEditing={save}
            autoFocus
            accessibilityLabel={kind === 'asset' ? `New value for ${item.name}` : `New balance for ${item.name}`}
          />
          <View style={styles.updateActions}>
            <Button
              label="Delete"
              variant="danger"
              compact
              icon="trash-2"
              onPress={() => (kind === 'asset' ? deleteAsset.mutate(item.id) : deleteDebt.mutate(item.id))}
            />
            <Button
              label={kind === 'asset' ? 'Save value for today' : 'Save balance for today'}
              compact
              onPress={save}
              loading={saving}
              disabled={parsed === null || parsed < 0}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  missing: { marginTop: Spacing.two },
  update: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.three },
  updateActions: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
});
