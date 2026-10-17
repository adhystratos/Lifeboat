import { FxRate, latestPerKey } from '@/core';

import type {
  AccountBalance,
  Asset,
  Bill,
  CalendarEvent,
  Category,
  Liability,
  Repo,
  Task,
  Transaction,
  Workspace,
} from './repo';
import { requireSupabase } from './supabase';

const db = () => requireSupabase();

function check<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data;
}

const softDelete = (table: string) => async (id: string) => {
  check(await db().from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id));
};

const insert = (table: string) => async (row: object) => {
  check(await db().from(table).insert(row));
};

// bigint columns arrive as numbers or strings depending on size.
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

export const supabaseRepo: Repo = {
  async workspace() {
    return check(
      await db().from('workspaces').select('id, name, base_currency').order('created_at').limit(1).single(),
    ) as Workspace;
  },

  async setBaseCurrency(workspaceId, currency) {
    check(await db().from('workspaces').update({ base_currency: currency }).eq('id', workspaceId));
  },

  async accountBalances() {
    const rows = check(
      await db()
        .from('account_balances')
        .select('account_id, name, type, currency, balance_minor')
        .eq('archived', false)
        .order('name'),
    );
    return (rows ?? []).map((a) => ({ ...a, balance_minor: Number(a.balance_minor) })) as AccountBalance[];
  },

  async categories() {
    return check(
      await db().from('categories').select('id, name, kind').is('deleted_at', null).order('name'),
    ) as Category[];
  },

  async transactions(start, end) {
    const rows = check(
      await db()
        .from('transactions')
        .select(
          'id, type, amount_minor, occurred_on, note, category_id, transfer_amount_minor, ' +
            'account:accounts!transactions_account_id_fkey(id, name, currency), ' +
            'transfer_account:accounts!transactions_transfer_account_id_fkey(id, name, currency)',
        )
        .is('deleted_at', null)
        .gte('occurred_on', start)
        .lte('occurred_on', end)
        .order('occurred_on', { ascending: false })
        .order('created_at', { ascending: false }),
    );
    return ((rows ?? []) as unknown as Transaction[]).map((t) => ({
      ...t,
      amount_minor: Number(t.amount_minor),
      transfer_amount_minor: num(t.transfer_amount_minor),
    }));
  },

  async fxRates() {
    const rows = check(
      await db().from('fx_rates').select('base, quote, rate, as_of').order('as_of', { ascending: false }).limit(200),
    );
    const latest = new Map<string, FxRate>();
    for (const r of rows ?? []) {
      const key = `${r.base}/${r.quote}`;
      if (!latest.has(key)) latest.set(key, { base: r.base, quote: r.quote, rate: Number(r.rate) });
    }
    return [...latest.values()];
  },

  createAccount: insert('accounts'),
  createTransaction: insert('transactions'),
  deleteTransaction: softDelete('transactions'),

  async tasks() {
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    return check(
      await db()
        .from('tasks')
        .select('id, title, notes, due_at, priority, completed_at')
        .is('deleted_at', null)
        .or(`completed_at.is.null,completed_at.gte."${since}"`)
        .order('due_at', { ascending: true, nullsFirst: false })
        .order('created_at'),
    ) as Task[];
  },

  createTask: insert('tasks'),

  async setTaskCompleted(id, completedAt) {
    check(await db().from('tasks').update({ completed_at: completedAt }).eq('id', id));
  },

  deleteTask: softDelete('tasks'),

  async events(fromIso, toIso) {
    return check(
      await db()
        .from('events')
        .select('id, title, notes, starts_at, ends_at, all_day, location')
        .is('deleted_at', null)
        .lt('starts_at', toIso)
        .gte('ends_at', fromIso)
        .order('starts_at'),
    ) as CalendarEvent[];
  },

  createEvent: insert('events'),
  deleteEvent: softDelete('events'),

  async bills() {
    const rows = check(
      await db()
        .from('recurring_items')
        .select(
          'id, name, type, amount_minor, category_id, starts_on, recurrence_rule, next_due_on, ' +
            'account:accounts(id, name, currency)',
        )
        .is('deleted_at', null)
        .order('next_due_on', { ascending: true, nullsFirst: false }),
    );
    return ((rows ?? []) as unknown as Bill[]).map((b) => ({ ...b, amount_minor: Number(b.amount_minor) }));
  },

  createBill: insert('recurring_items'),

  async payBill({ bill, due_on, paid_on, next_due }) {
    const txId = check(
      await db().rpc('pay_recurring_item', {
        item_id: bill.id,
        due_on,
        paid_on,
        next_due,
      }),
    );
    return String(txId);
  },

  async undoBillPayment({ transaction_id, due_on, next_due }) {
    check(await db().rpc('unpay_recurring_item', { tx_id: transaction_id, due_on, next_due }));
  },

  deleteBill: softDelete('recurring_items'),

  async assets() {
    const [assets, valuations] = await Promise.all([
      db().from('assets').select('id, name, type, currency, notes').is('deleted_at', null).order('name'),
      db()
        .from('asset_valuations')
        .select('asset_id, value_minor, valued_on')
        .is('deleted_at', null)
        .order('valued_on')
        .order('created_at'),
    ]);
    const latest = latestPerKey(check(valuations) ?? [], (v) => v.asset_id, (v) => v.valued_on);
    return (check(assets) ?? []).map((a) => {
      const v = latest.get(a.id);
      return { ...a, value_minor: num(v?.value_minor), valued_on: v?.valued_on ?? null } as Asset;
    });
  },

  async createAsset({ value_minor, valued_on, ...asset }) {
    const created = check(await db().from('assets').insert(asset).select('id').single()) as { id: string };
    check(
      await db()
        .from('asset_valuations')
        .insert({ workspace_id: asset.workspace_id, asset_id: created.id, value_minor, valued_on }),
    );
  },

  async addValuation(workspaceId, assetId, valueMinor, valuedOn) {
    check(
      await db()
        .from('asset_valuations')
        .insert({ workspace_id: workspaceId, asset_id: assetId, value_minor: valueMinor, valued_on: valuedOn }),
    );
  },

  deleteAsset: softDelete('assets'),

  async liabilities() {
    const [liabilities, balances] = await Promise.all([
      db()
        .from('liabilities')
        .select('id, name, type, currency, interest_rate')
        .is('deleted_at', null)
        .order('name'),
      db()
        .from('liability_balances')
        .select('liability_id, balance_minor, as_of')
        .is('deleted_at', null)
        .order('as_of')
        .order('created_at'),
    ]);
    const latest = latestPerKey(check(balances) ?? [], (b) => b.liability_id, (b) => b.as_of);
    return (check(liabilities) ?? []).map((l) => {
      const b = latest.get(l.id);
      return {
        ...l,
        interest_rate: l.interest_rate === null ? null : Number(l.interest_rate),
        balance_minor: num(b?.balance_minor),
        as_of: b?.as_of ?? null,
      } as Liability;
    });
  },

  async createLiability({ balance_minor, as_of, ...liability }) {
    const created = check(
      await db()
        .from('liabilities')
        .insert({ ...liability, principal_minor: balance_minor })
        .select('id')
        .single(),
    ) as { id: string };
    check(
      await db()
        .from('liability_balances')
        .insert({ workspace_id: liability.workspace_id, liability_id: created.id, balance_minor, as_of }),
    );
  },

  async addLiabilityBalance(workspaceId, liabilityId, balanceMinor, asOf) {
    check(
      await db()
        .from('liability_balances')
        .insert({ workspace_id: workspaceId, liability_id: liabilityId, balance_minor: balanceMinor, as_of: asOf }),
    );
  },

  deleteLiability: softDelete('liabilities'),
};
