import { Currency, FxRate } from '@/core';

/**
 * The app's data operations. Two implementations: Supabase (real data) and an
 * in-memory sample store for trying the app before Supabase is set up.
 */

export type Workspace = { id: string; name: string; base_currency: Currency };

export type AccountType = 'cash' | 'bank' | 'ewallet' | 'credit' | 'savings';

export type AccountBalance = {
  account_id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance_minor: number;
};

export type Category = { id: string; name: string; kind: 'income' | 'expense' };

export type AccountRef = { id: string; name: string; currency: Currency };

export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount_minor: number;
  occurred_on: string;
  note: string | null;
  category_id: string | null;
  account: AccountRef;
  transfer_account: AccountRef | null;
  transfer_amount_minor: number | null;
};

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  due_at: string | null;
  priority: number;
  completed_at: string | null;
};

export type CalendarEvent = {
  id: string;
  title: string;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  location: string | null;
};

export type Bill = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount_minor: number;
  category_id: string | null;
  starts_on: string;
  recurrence_rule: string;
  next_due_on: string | null;
  account: AccountRef;
};

export type AssetType = 'property' | 'vehicle' | 'gold' | 'investment' | 'receivable' | 'other';

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  currency: Currency;
  notes: string | null;
  value_minor: number | null;
  valued_on: string | null;
};

export type LiabilityType = 'loan' | 'mortgage' | 'card' | 'personal';

export type Liability = {
  id: string;
  name: string;
  type: LiabilityType;
  currency: Currency;
  interest_rate: number | null;
  balance_minor: number | null;
  as_of: string | null;
};

export type NewAccount = {
  workspace_id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  opening_balance_minor: number;
};

export type NewTransaction = {
  workspace_id: string;
  account_id: string;
  type: 'income' | 'expense' | 'transfer';
  amount_minor: number;
  category_id: string | null;
  occurred_on: string;
  note: string | null;
  transfer_account_id: string | null;
  transfer_amount_minor: number | null;
};

export type NewTask = { workspace_id: string; title: string; due_at: string | null; notes?: string | null };

export type NewEvent = {
  workspace_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  location: string | null;
  notes?: string | null;
};

export type NewBill = {
  workspace_id: string;
  name: string;
  type: 'income' | 'expense';
  account_id: string;
  category_id: string | null;
  amount_minor: number;
  starts_on: string;
  recurrence_rule: string;
  next_due_on: string | null;
};

export type BillPayment = {
  bill: Bill;
  /** The occurrence being settled (the bill's next_due_on). */
  due_on: string;
  /** The transaction date. */
  paid_on: string;
  /** Where next_due_on moves; null when the schedule has ended. */
  next_due: string | null;
};

/** Reverses one payment made through `payBill`, if nothing has moved since. */
export type BillPaymentUndo = {
  /** The transaction `payBill` recorded. */
  transaction_id: string;
  bill_id: string;
  due_on: string;
  next_due: string | null;
};

export type NewAsset = {
  workspace_id: string;
  name: string;
  type: AssetType;
  currency: Currency;
  notes: string | null;
  value_minor: number;
  valued_on: string;
};

export type NewLiability = {
  workspace_id: string;
  name: string;
  type: LiabilityType;
  currency: Currency;
  interest_rate: number | null;
  balance_minor: number;
  as_of: string;
};

export interface Repo {
  workspace(): Promise<Workspace>;
  setBaseCurrency(workspaceId: string, currency: Currency): Promise<void>;
  accountBalances(): Promise<AccountBalance[]>;
  categories(): Promise<Category[]>;
  transactions(start: string, end: string): Promise<Transaction[]>;
  fxRates(): Promise<FxRate[]>;
  createAccount(row: NewAccount): Promise<void>;
  createTransaction(row: NewTransaction): Promise<void>;
  deleteTransaction(id: string): Promise<void>;

  /** Open tasks plus tasks completed in the last 30 days. */
  tasks(): Promise<Task[]>;
  createTask(row: NewTask): Promise<void>;
  setTaskCompleted(id: string, completedAt: string | null): Promise<void>;
  deleteTask(id: string): Promise<void>;

  /** Events overlapping [fromIso, toIso). */
  events(fromIso: string, toIso: string): Promise<CalendarEvent[]>;
  createEvent(row: NewEvent): Promise<void>;
  deleteEvent(id: string): Promise<void>;

  bills(): Promise<Bill[]>;
  createBill(row: NewBill): Promise<void>;
  /** Records the payment and returns the new transaction id. */
  payBill(payment: BillPayment): Promise<string>;
  undoBillPayment(undo: BillPaymentUndo): Promise<void>;
  deleteBill(id: string): Promise<void>;

  assets(): Promise<Asset[]>;
  createAsset(row: NewAsset): Promise<void>;
  addValuation(workspaceId: string, assetId: string, valueMinor: number, valuedOn: string): Promise<void>;
  deleteAsset(id: string): Promise<void>;

  liabilities(): Promise<Liability[]>;
  createLiability(row: NewLiability): Promise<void>;
  addLiabilityBalance(workspaceId: string, liabilityId: string, balanceMinor: number, asOf: string): Promise<void>;
  deleteLiability(id: string): Promise<void>;
}
