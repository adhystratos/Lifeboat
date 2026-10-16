import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Currency, FxRate } from '@/core';

import { requireSupabase } from './supabase';

export type Workspace = { id: string; name: string; base_currency: Currency };

export type AccountBalance = {
  account_id: string;
  name: string;
  type: string;
  currency: Currency;
  balance_minor: number;
};

/** The user's personal workspace (exactly one in v1). */
export function useWorkspace() {
  return useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from('workspaces')
        .select('id, name, base_currency')
        .order('created_at')
        .limit(1)
        .single();
      if (error) throw error;
      return data as Workspace;
    },
  });
}

export function useSetBaseCurrency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, currency }: { workspaceId: string; currency: Currency }) => {
      const { error } = await requireSupabase()
        .from('workspaces')
        .update({ base_currency: currency })
        .eq('id', workspaceId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace'] }),
  });
}

export function useAccountBalances() {
  return useQuery({
    queryKey: ['account_balances'],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from('account_balances')
        .select('account_id, name, type, currency, balance_minor')
        .eq('archived', false)
        .order('name');
      if (error) throw error;
      // bigint columns arrive as numbers or strings depending on size.
      return (data ?? []).map((a) => ({ ...a, balance_minor: Number(a.balance_minor) })) as AccountBalance[];
    },
  });
}

export type Category = { id: string; name: string; kind: 'income' | 'expense' };

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from('categories')
        .select('id, name, kind')
        .is('deleted_at', null)
        .order('name');
      if (error) throw error;
      return data as Category[];
    },
  });
}

export type Transaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount_minor: number;
  occurred_on: string;
  note: string | null;
  category_id: string | null;
  account: { id: string; name: string; currency: Currency };
  transfer_account: { id: string; name: string; currency: Currency } | null;
  transfer_amount_minor: number | null;
};

/** Transactions with occurred_on in [start, end], newest first. */
export function useTransactions(start: string, end: string) {
  return useQuery({
    queryKey: ['transactions', start, end],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
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
        .order('created_at', { ascending: false });
      if (error) throw error;
      return ((data ?? []) as unknown as Transaction[]).map((t) => ({
        ...t,
        amount_minor: Number(t.amount_minor),
        transfer_amount_minor: t.transfer_amount_minor === null ? null : Number(t.transfer_amount_minor),
      }));
    },
  });
}

/** The most recent rate for each currency pair. */
export function useFxRates() {
  return useQuery({
    queryKey: ['fx_rates'],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from('fx_rates')
        .select('base, quote, rate, as_of')
        .order('as_of', { ascending: false })
        .limit(200);
      if (error) throw error;
      const latest = new Map<string, FxRate>();
      for (const r of data ?? []) {
        const key = `${r.base}/${r.quote}`;
        if (!latest.has(key)) latest.set(key, { base: r.base, quote: r.quote, rate: Number(r.rate) });
      }
      return [...latest.values()];
    },
    staleTime: 60 * 60 * 1000,
  });
}

export type NewAccount = {
  workspace_id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'credit' | 'savings';
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

function useInsert<T extends object>(table: string, invalidate: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (row: T) => {
      const { error } = await requireSupabase().from(table).insert(row);
      if (error) throw error;
    },
    onSuccess: () =>
      Promise.all(invalidate.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))),
  });
}

export const useCreateAccount = () => useInsert<NewAccount>('accounts', ['account_balances']);

export const useCreateTransaction = () =>
  useInsert<NewTransaction>('transactions', ['transactions', 'account_balances']);

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await requireSupabase()
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () =>
      Promise.all(
        ['transactions', 'account_balances'].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key] }),
        ),
      ),
  });
}
