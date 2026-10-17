-- Undo for "Mark paid".
-- Run after 20261017000000_agenda_and_bills.sql (SQL Editor, or `npx supabase db push`).

-- Reverses one payment made by pay_recurring_item: removes the transaction it
-- recorded and moves the bill's schedule back, in a single step. It refuses
-- when the bill has moved on since (paid again, edited or deleted), so an
-- undo can never put a bill out of step with its payments. Runs with the
-- caller's rights, so row-level security still applies.
create function unpay_recurring_item(tx_id uuid, due_on date, next_due date)
returns void
language plpgsql security invoker set search_path = public as $$
declare
  tx transactions;
begin
  update transactions
     set deleted_at = now()
   where id = tx_id
     and recurring_id is not null
     and deleted_at is null
  returning * into tx;

  if not found then
    raise exception 'This payment was already undone or no longer exists.';
  end if;

  update recurring_items
     set next_due_on = due_on
   where id = tx.recurring_id
     and next_due_on is not distinct from next_due
     and deleted_at is null;

  if not found then
    raise exception 'This bill has changed since it was paid, so the payment can no longer be undone.';
  end if;
end $$;
