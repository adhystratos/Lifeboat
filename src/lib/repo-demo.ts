import {
  addDays,
  Currency,
  dayRange,
  FxRate,
  latestPerKey,
  localDateTime,
  localToday,
  monthBounds,
  nextOccurrence,
} from '@/core';

import type {
  AccountType,
  Asset,
  AssetType,
  Bill,
  CalendarEvent,
  Category,
  Liability,
  LiabilityType,
  Repo,
  Task,
  Transaction,
} from './repo';

/**
 * In-memory sample data for exploring the app without Supabase. Everything is
 * invented, dated relative to today, and resets when the app reloads.
 */

type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  opening_balance_minor: number;
};

type StoredTransaction = {
  id: string;
  account_id: string;
  type: Transaction['type'];
  amount_minor: number;
  category_id: string | null;
  occurred_on: string;
  note: string | null;
  transfer_account_id: string | null;
  transfer_amount_minor: number | null;
  created: number;
};

type StoredBill = Omit<Bill, 'account'> & { account_id: string };
type StoredAsset = Omit<Asset, 'value_minor' | 'valued_on'>;
type StoredLiability = Omit<Liability, 'balance_minor' | 'as_of'>;
type Valuation = { asset_id: string; value_minor: number; valued_on: string };
type Balance = { liability_id: string; balance_minor: number; as_of: string };

let counter = 0;
const id = (prefix: string) => `${prefix}-${++counter}`;
const rp = (rupiah: number) => rupiah * 100;

function seed() {
  const today = localToday();
  const day = (offset: number) => addDays(today, offset);
  const at = (offset: number, time: string) => localDateTime(day(offset), time)!;
  const { start: monthStart } = monthBounds(today);
  // A day in the current month, never later than today.
  const thisMonth = (dom: number) => {
    const d = `${monthStart.slice(0, 8)}${String(dom).padStart(2, '0')}`;
    return d > today ? today : d;
  };

  const store = {
    workspace: { id: 'ws-1', name: 'Personal', base_currency: 'IDR' as Currency },
    categories: [] as Category[],
    accounts: [] as Account[],
    transactions: [] as StoredTransaction[],
    tasks: [] as Task[],
    events: [] as CalendarEvent[],
    bills: [] as StoredBill[],
    assets: [] as StoredAsset[],
    valuations: [] as Valuation[],
    liabilities: [] as StoredLiability[],
    balances: [] as Balance[],
    // Sample rates. No PLN rate on purpose, to show how missing rates appear.
    rates: [
      { base: 'EUR', quote: 'IDR', rate: 18_200 },
      { base: 'EUR', quote: 'USD', rate: 1.09 },
    ] as FxRate[],
  };

  const cat = (name: string, kind: Category['kind']) => {
    const c = { id: id('cat'), name, kind };
    store.categories.push(c);
    return c.id;
  };
  const salary = cat('Salary', 'income');
  const otherIncome = cat('Other income', 'income');
  const food = cat('Food & drinks', 'expense');
  const groceries = cat('Groceries', 'expense');
  const transport = cat('Transport', 'expense');
  const housing = cat('Housing', 'expense');
  const bills = cat('Bills & utilities', 'expense');
  cat('Shopping', 'expense');
  const health = cat('Health', 'expense');
  const fun = cat('Entertainment', 'expense');
  const travel = cat('Travel', 'expense');
  cat('Other', 'expense');

  const account = (name: string, type: AccountType, currency: Currency, opening: number) => {
    const a = { id: id('acc'), name, type, currency, opening_balance_minor: opening };
    store.accounts.push(a);
    return a.id;
  };
  const cash = account('Cash', 'cash', 'IDR', rp(850_000));
  const bca = account('BCA', 'bank', 'IDR', rp(21_400_000));
  const revolut = account('Revolut', 'bank', 'EUR', 1_240_50);
  account('mBank', 'bank', 'PLN', 3_100_00);
  const wise = account('Wise', 'ewallet', 'USD', 410_00);

  const tx = (
    account_id: string,
    type: Transaction['type'],
    amount_minor: number,
    occurred_on: string,
    category_id: string | null,
    note: string | null,
    transfer?: { to: string; amount: number },
  ) =>
    store.transactions.push({
      id: id('tx'),
      account_id,
      type,
      amount_minor,
      occurred_on,
      category_id,
      note,
      transfer_account_id: transfer?.to ?? null,
      transfer_amount_minor: transfer?.amount ?? null,
      created: counter,
    });

  tx(bca, 'income', rp(6_000_000), thisMonth(1), salary, 'Retainer: language services');
  tx(bca, 'income', rp(7_500_000), thisMonth(3), otherIncome, 'Interpreting: trade delegation');
  tx(revolut, 'income', 450_00, thisMonth(6), otherIncome, 'Translation: Istanbul client');
  tx(bca, 'expense', rp(3_500_000), thisMonth(5), housing, 'Rent');
  tx(bca, 'expense', rp(612_000), thisMonth(4), groceries, 'Groceries');
  tx(cash, 'expense', rp(85_000), thisMonth(7), food, 'Nasi padang with the team');
  tx(bca, 'expense', rp(254_000), thisMonth(8), transport, 'Ride-hailing, week total');
  tx(bca, 'expense', rp(375_000), thisMonth(9), bills, 'Electricity token');
  tx(revolut, 'expense', 64_90, thisMonth(10), travel, 'Train, Warsaw to Krakow');
  tx(cash, 'expense', rp(120_000), thisMonth(11), health, 'Pharmacy');
  tx(wise, 'expense', 15_99, thisMonth(12), fun, 'Streaming');
  tx(bca, 'expense', rp(438_000), thisMonth(14), groceries, 'Groceries');
  tx(cash, 'expense', rp(56_000), today, food, 'Coffee before the session');
  tx(bca, 'transfer', rp(1_000_000), thisMonth(13), null, null, { to: cash, amount: rp(1_000_000) });

  const task = (title: string, due_at: string | null, completed_at: string | null = null) =>
    store.tasks.push({ id: id('task'), title, notes: null, due_at, priority: 0, completed_at });
  task('Renew vehicle registration', at(-2, '17:00'));
  task('Send invoice to the Ankara delegation', at(0, '10:00'));
  task('Prepare glossary: maritime law terms', at(0, '18:00'));
  task('Confirm booth equipment with the venue', at(0, '08:00'), at(0, '07:40'));
  task('Book train to Krakow', at(1, '12:00'));
  task('Call the notary about the land certificate', null);

  const event = (title: string, starts_at: string, ends_at: string, location: string | null, all_day = false) =>
    store.events.push({ id: id('evt'), title, notes: null, starts_at, ends_at, all_day, location });
  event('Consecutive session: Ministry of Trade', at(0, '09:00'), at(0, '10:30'), 'Jakarta Convention Center');
  event('Weekly call with the team', at(0, '14:00'), at(0, '14:45'), 'Video call');
  event('Dinner with Deniz', at(0, '19:00'), at(0, '21:00'), 'Kemang');
  event('Simultaneous booth: energy forum', at(1, '08:30'), at(1, '17:00'), 'Hotel Mulia, Ballroom B');
  event('Dentist', at(3, '16:00'), at(3, '16:45'), null);
  event('Flight CGK to IST', dayRange(day(9)).from, dayRange(day(9)).to, null, true);
  event('Turkish conversation class', at(-3, '19:00'), at(-3, '20:30'), 'Online');
  event('Contract signing: publishing client', at(6, '11:00'), at(6, '12:00'), 'Sudirman');

  const bill = (
    name: string,
    type: Bill['type'],
    account_id: string,
    category_id: string | null,
    amount_minor: number,
    dueOn: string,
    recurrence_rule: string,
    monthsBack: number,
  ) => {
    // Start the schedule a few months back on the same day of the month so
    // earlier occurrences show as paid; next_due_on is always a real occurrence.
    const [y, m, d] = dueOn.split('-').map(Number);
    const starts_on =
      d > 28 ? dueOn : new Date(Date.UTC(y, m - 1 - monthsBack, d)).toISOString().slice(0, 10);
    const next_due_on = nextOccurrence(starts_on, recurrence_rule, dueOn);
    store.bills.push({ id: id('bill'), name, type, account_id, category_id, amount_minor, starts_on, recurrence_rule, next_due_on });
  };
  bill('Internet', 'expense', bca, bills, rp(450_000), day(-3), 'FREQ=MONTHLY;INTERVAL=1', 3);
  bill('Health insurance', 'expense', bca, health, rp(150_000), day(0), 'FREQ=MONTHLY;INTERVAL=1', 6);
  bill('Music subscription', 'expense', revolut, fun, 10_99, day(5), 'FREQ=MONTHLY;INTERVAL=1', 2);
  bill('Retainer: language services', 'income', bca, salary, rp(6_000_000), day(12), 'FREQ=MONTHLY;INTERVAL=1', 4);
  bill('Car insurance', 'expense', bca, transport, rp(2_100_000), day(40), 'FREQ=YEARLY;INTERVAL=1', 12);

  const asset = (name: string, type: AssetType, currency: Currency, value: number, valued_on: string, notes: string | null = null) => {
    const a = { id: id('asset'), name, type, currency, notes };
    store.assets.push(a);
    store.valuations.push({ asset_id: a.id, value_minor: value, valued_on });
  };
  asset('Apartment, Bekasi', 'property', 'IDR', rp(780_000_000), day(-109));
  asset('Gold, 25 g', 'gold', 'IDR', rp(48_000_000), day(-14));
  asset('Scooter', 'vehicle', 'IDR', rp(14_500_000), day(-200));
  asset('Index fund', 'investment', 'EUR', 6_200_00, day(-30));
  asset('Loan to a friend', 'receivable', 'IDR', rp(5_000_000), day(-45), 'Repaying monthly');

  const liability = (name: string, type: LiabilityType, currency: Currency, rate: number | null, balance: number, as_of: string) => {
    const l = { id: id('debt'), name, type, currency, interest_rate: rate };
    store.liabilities.push(l);
    store.balances.push({ liability_id: l.id, balance_minor: balance, as_of });
  };
  liability('Mortgage', 'mortgage', 'IDR', 7.25, rp(412_000_000), day(-17));
  liability('Credit card', 'card', 'IDR', null, rp(3_200_000), day(-2));

  return store;
}

let store: ReturnType<typeof seed> | null = null;
const s = () => (store ??= seed());

/** Starts the sample over (used when leaving and re-entering sample mode). */
export function resetDemo() {
  store = null;
}

const ref = (accountId: string) => {
  const a = s().accounts.find((x) => x.id === accountId)!;
  return { id: a.id, name: a.name, currency: a.currency };
};

const remove = <T extends { id: string }>(list: T[], rowId: string) => {
  const i = list.findIndex((x) => x.id === rowId);
  if (i >= 0) list.splice(i, 1);
};

export const demoRepo: Repo = {
  async workspace() {
    return { ...s().workspace };
  },
  async setBaseCurrency(_ws, currency) {
    s().workspace.base_currency = currency;
  },
  async accountBalances() {
    return s()
      .accounts.map((a) => ({
        account_id: a.id,
        name: a.name,
        type: a.type,
        currency: a.currency,
        balance_minor: s().transactions.reduce((sum, t) => {
          if (t.account_id === a.id) return sum + (t.type === 'income' ? t.amount_minor : -t.amount_minor);
          if (t.transfer_account_id === a.id) return sum + (t.transfer_amount_minor ?? 0);
          return sum;
        }, a.opening_balance_minor),
      }))
      .sort((x, y) => x.name.localeCompare(y.name));
  },
  async categories() {
    return [...s().categories].sort((a, b) => a.name.localeCompare(b.name));
  },
  async transactions(start, end) {
    return s()
      .transactions.filter((t) => t.occurred_on >= start && t.occurred_on <= end)
      .sort((a, b) => b.occurred_on.localeCompare(a.occurred_on) || b.created - a.created)
      .map((t) => ({
        id: t.id,
        type: t.type,
        amount_minor: t.amount_minor,
        occurred_on: t.occurred_on,
        note: t.note,
        category_id: t.category_id,
        account: ref(t.account_id),
        transfer_account: t.transfer_account_id ? ref(t.transfer_account_id) : null,
        transfer_amount_minor: t.transfer_amount_minor,
      }));
  },
  async fxRates() {
    return [...s().rates];
  },
  async createAccount(row) {
    s().accounts.push({ id: id('acc'), ...row });
  },
  async createTransaction(row) {
    s().transactions.push({ id: id('tx'), created: counter, ...row });
  },
  async deleteTransaction(txId) {
    remove(s().transactions, txId);
  },

  async tasks() {
    // Same as Supabase: open tasks plus those done in the last 30 days, by due time, undated last.
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    return s()
      .tasks.filter((t) => !t.completed_at || t.completed_at >= since)
      .sort((a, b) => Number(a.due_at === null) - Number(b.due_at === null) || (a.due_at ?? '').localeCompare(b.due_at ?? ''))
      .map((t) => ({ ...t }));
  },
  async createTask(row) {
    s().tasks.push({ id: id('task'), title: row.title, notes: row.notes ?? null, due_at: row.due_at, priority: 0, completed_at: null });
  },
  async setTaskCompleted(taskId, completedAt) {
    const t = s().tasks.find((x) => x.id === taskId);
    if (t) t.completed_at = completedAt;
  },
  async deleteTask(taskId) {
    remove(s().tasks, taskId);
  },

  async events(fromIso, toIso) {
    return s()
      .events.filter((e) => e.starts_at < toIso && e.ends_at >= fromIso)
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
      .map((e) => ({ ...e }));
  },
  async createEvent(row) {
    s().events.push({ id: id('evt'), title: row.title, notes: row.notes ?? null, starts_at: row.starts_at, ends_at: row.ends_at, all_day: row.all_day, location: row.location });
  },
  async deleteEvent(eventId) {
    remove(s().events, eventId);
  },

  async bills() {
    // Same order as Supabase: next due first, ended schedules last.
    return [...s().bills]
      .sort(
        (a, b) =>
          Number(a.next_due_on === null) - Number(b.next_due_on === null) ||
          (a.next_due_on ?? '').localeCompare(b.next_due_on ?? ''),
      )
      .map(({ account_id, ...b }) => ({ ...b, account: ref(account_id) }));
  },
  async createBill({ workspace_id: _ws, ...row }) {
    s().bills.push({ id: id('bill'), ...row });
  },
  async payBill({ bill, due_on, paid_on, next_due }) {
    const stored = s().bills.find((b) => b.id === bill.id);
    if (!stored || stored.next_due_on !== due_on) {
      throw new Error(`This bill was already paid for ${due_on}, or no longer exists.`);
    }
    stored.next_due_on = next_due;
    s().transactions.push({
      id: id('tx'),
      account_id: stored.account_id,
      type: stored.type,
      amount_minor: stored.amount_minor,
      category_id: stored.category_id,
      occurred_on: paid_on,
      note: stored.name,
      transfer_account_id: null,
      transfer_amount_minor: null,
      created: counter,
    });
  },
  async deleteBill(billId) {
    remove(s().bills, billId);
  },

  async assets() {
    const latest = latestPerKey(s().valuations, (v) => v.asset_id, (v) => v.valued_on);
    return s()
      .assets.map((a) => ({ ...a, value_minor: latest.get(a.id)?.value_minor ?? null, valued_on: latest.get(a.id)?.valued_on ?? null }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  async createAsset({ workspace_id: _ws, value_minor, valued_on, ...row }) {
    const a = { id: id('asset'), ...row };
    s().assets.push(a);
    s().valuations.push({ asset_id: a.id, value_minor, valued_on });
  },
  async addValuation(_ws, assetId, valueMinor, valuedOn) {
    s().valuations.push({ asset_id: assetId, value_minor: valueMinor, valued_on: valuedOn });
  },
  async deleteAsset(assetId) {
    remove(s().assets, assetId);
  },

  async liabilities() {
    const latest = latestPerKey(s().balances, (b) => b.liability_id, (b) => b.as_of);
    return s()
      .liabilities.map((l) => ({ ...l, balance_minor: latest.get(l.id)?.balance_minor ?? null, as_of: latest.get(l.id)?.as_of ?? null }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  async createLiability({ workspace_id: _ws, balance_minor, as_of, ...row }) {
    const l = { id: id('debt'), ...row };
    s().liabilities.push(l);
    s().balances.push({ liability_id: l.id, balance_minor, as_of });
  },
  async addLiabilityBalance(_ws, liabilityId, balanceMinor, asOf) {
    s().balances.push({ liability_id: liabilityId, balance_minor: balanceMinor, as_of: asOf });
  },
  async deleteLiability(debtId) {
    remove(s().liabilities, debtId);
  },
};
