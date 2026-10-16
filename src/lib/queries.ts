import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Currency } from '@/core';

import type { BillPayment, Repo, Task } from './repo';
import { repo } from './repo-active';

export type * from './repo';

/** Query keys, grouped so a mutation can refresh everything it affects. */
const MONEY = ['account_balances', 'transactions', 'bills'];
const WEALTH = ['assets', 'liabilities'];

function useRefresh() {
  const queryClient = useQueryClient();
  return (keys: string[]) => Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
}

/** A mutation that calls one repo method and refreshes the given queries. */
function useRepoMutation<T>(run: (r: Repo, input: T) => Promise<void>, refresh: string[]) {
  const invalidate = useRefresh();
  return useMutation({
    mutationFn: (input: T) => run(repo(), input),
    onSuccess: () => invalidate(refresh),
  });
}

// ---------------------------------------------------------------------------
// Workspace and money
// ---------------------------------------------------------------------------

/** The user's personal workspace (exactly one in v1). */
export const useWorkspace = () => useQuery({ queryKey: ['workspace'], queryFn: () => repo().workspace() });

export function useSetBaseCurrency() {
  const invalidate = useRefresh();
  return useMutation({
    mutationFn: ({ workspaceId, currency }: { workspaceId: string; currency: Currency }) =>
      repo().setBaseCurrency(workspaceId, currency),
    onSuccess: () => invalidate(['workspace']),
  });
}

export const useAccountBalances = () =>
  useQuery({ queryKey: ['account_balances'], queryFn: () => repo().accountBalances() });

export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: () => repo().categories() });

/** Transactions with occurred_on in [start, end], newest first. */
export const useTransactions = (start: string, end: string) =>
  useQuery({ queryKey: ['transactions', start, end], queryFn: () => repo().transactions(start, end) });

/** The most recent rate for each currency pair. */
export const useFxRates = () =>
  useQuery({ queryKey: ['fx_rates'], queryFn: () => repo().fxRates(), staleTime: 60 * 60 * 1000 });

export const useCreateAccount = () => useRepoMutation((r, row: Parameters<Repo['createAccount']>[0]) => r.createAccount(row), MONEY);

export const useCreateTransaction = () =>
  useRepoMutation((r, row: Parameters<Repo['createTransaction']>[0]) => r.createTransaction(row), MONEY);

export const useDeleteTransaction = () => useRepoMutation((r, id: string) => r.deleteTransaction(id), MONEY);

// ---------------------------------------------------------------------------
// Agenda
// ---------------------------------------------------------------------------

export const useTasks = () => useQuery({ queryKey: ['tasks'], queryFn: () => repo().tasks() });

export const useCreateTask = () => useRepoMutation((r, row: Parameters<Repo['createTask']>[0]) => r.createTask(row), ['tasks']);

/** Checks a task off (or back on) immediately, then confirms with the server. */
export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completedAt }: { id: string; completedAt: string | null }) =>
      repo().setTaskCompleted(id, completedAt),
    onMutate: async ({ id, completedAt }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (tasks) =>
        tasks?.map((t) => (t.id === id ? { ...t, completed_at: completedAt } : t)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(['tasks'], context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export const useDeleteTask = () => useRepoMutation((r, id: string) => r.deleteTask(id), ['tasks']);

/** Events overlapping [fromIso, toIso). */
export const useEvents = (fromIso: string, toIso: string) =>
  useQuery({ queryKey: ['events', fromIso, toIso], queryFn: () => repo().events(fromIso, toIso) });

export const useCreateEvent = () =>
  useRepoMutation((r, row: Parameters<Repo['createEvent']>[0]) => r.createEvent(row), ['events']);

export const useDeleteEvent = () => useRepoMutation((r, id: string) => r.deleteEvent(id), ['events']);

// ---------------------------------------------------------------------------
// Bills
// ---------------------------------------------------------------------------

export const useBills = () => useQuery({ queryKey: ['bills'], queryFn: () => repo().bills() });

export const useCreateBill = () => useRepoMutation((r, row: Parameters<Repo['createBill']>[0]) => r.createBill(row), ['bills']);

export const usePayBill = () => useRepoMutation((r, payment: BillPayment) => r.payBill(payment), MONEY);

export const useDeleteBill = () => useRepoMutation((r, id: string) => r.deleteBill(id), ['bills']);

// ---------------------------------------------------------------------------
// Assets and debts
// ---------------------------------------------------------------------------

export const useAssets = () => useQuery({ queryKey: ['assets'], queryFn: () => repo().assets() });

export const useCreateAsset = () => useRepoMutation((r, row: Parameters<Repo['createAsset']>[0]) => r.createAsset(row), WEALTH);

export const useAddValuation = () =>
  useRepoMutation(
    (r, v: { workspaceId: string; assetId: string; valueMinor: number; valuedOn: string }) =>
      r.addValuation(v.workspaceId, v.assetId, v.valueMinor, v.valuedOn),
    WEALTH,
  );

export const useDeleteAsset = () => useRepoMutation((r, id: string) => r.deleteAsset(id), WEALTH);

export const useLiabilities = () => useQuery({ queryKey: ['liabilities'], queryFn: () => repo().liabilities() });

export const useCreateLiability = () =>
  useRepoMutation((r, row: Parameters<Repo['createLiability']>[0]) => r.createLiability(row), WEALTH);

export const useAddLiabilityBalance = () =>
  useRepoMutation(
    (r, v: { workspaceId: string; liabilityId: string; balanceMinor: number; asOf: string }) =>
      r.addLiabilityBalance(v.workspaceId, v.liabilityId, v.balanceMinor, v.asOf),
    WEALTH,
  );

export const useDeleteLiability = () => useRepoMutation((r, id: string) => r.deleteLiability(id), WEALTH);
