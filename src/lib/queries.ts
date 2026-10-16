import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Currency } from '@/core';

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
