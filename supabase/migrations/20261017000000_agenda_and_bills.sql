-- Agenda and bills support.
-- Run after 20261016000000_init.sql (SQL Editor, or `npx supabase db push`).

create index if not exists tasks_due_idx on tasks (workspace_id, due_at) where deleted_at is null;
create index if not exists events_starts_idx on events (workspace_id, starts_at) where deleted_at is null;
create index if not exists asset_valuations_asset_idx on asset_valuations (asset_id, valued_on);
create index if not exists liability_balances_liability_idx on liability_balances (liability_id, as_of);

-- Pays one occurrence of a bill: records the transaction and moves the
-- schedule forward in a single step, so a bill is never paid twice or left
-- half-updated. The app computes `next_due` with the same recurrence rules it
-- uses for display (src/core/agenda.ts). Runs with the caller's rights, so
-- row-level security still applies.
create function pay_recurring_item(item_id uuid, due_on date, paid_on date, next_due date)
returns uuid
language plpgsql security invoker set search_path = public as $$
declare
  item recurring_items;
  tx_id uuid;
begin
  update recurring_items
     set next_due_on = next_due
   where id = item_id
     and next_due_on = due_on
     and deleted_at is null
  returning * into item;

  if not found then
    raise exception 'This bill was already paid for %, or no longer exists.', due_on;
  end if;

  insert into transactions (
    workspace_id, account_id, type, amount_minor, category_id, occurred_on, note, recurring_id
  ) values (
    item.workspace_id, item.account_id, item.type, item.amount_minor, item.category_id,
    paid_on, item.name, item.id
  )
  returning id into tx_id;

  return tx_id;
end $$;
