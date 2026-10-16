-- Lifeboat initial schema.
-- Every row belongs to a workspace. In v1 each user gets exactly one personal
-- workspace on sign-up; sharing later only needs an invite flow, because all
-- access rules already go through workspace membership.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type currency_code as enum ('IDR', 'EUR', 'USD', 'PLN');
create type member_role as enum ('owner', 'member');
create type account_type as enum ('cash', 'bank', 'ewallet', 'credit', 'savings');
create type category_kind as enum ('income', 'expense');
create type transaction_type as enum ('income', 'expense', 'transfer');
create type asset_type as enum ('property', 'vehicle', 'gold', 'investment', 'receivable', 'other');
create type liability_type as enum ('loan', 'mortgage', 'card', 'personal');
create type reminder_target as enum ('task', 'event', 'bill');

-- ---------------------------------------------------------------------------
-- Users & workspaces
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_currency currency_code not null default 'IDR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role member_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- Used by every policy below. SECURITY DEFINER avoids recursive RLS on
-- workspace_members itself.
create function is_member(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Agenda
-- ---------------------------------------------------------------------------
create table lists (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  list_id uuid references lists on delete set null,
  title text not null,
  notes text,
  due_at timestamptz,
  priority smallint not null default 0 check (priority between 0 and 3),
  completed_at timestamptz,
  recurrence_rule text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  title text not null,
  notes text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  location text,
  recurrence_rule text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_at >= starts_at)
);

create table reminders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  target_type reminder_target not null,
  target_id uuid not null,
  remind_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Money
-- ---------------------------------------------------------------------------
create table accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  name text not null,
  type account_type not null,
  currency currency_code not null default 'IDR',
  opening_balance_minor bigint not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  name text not null,
  kind category_kind not null,
  parent_id uuid references categories on delete set null,
  icon text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table recurring_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  name text not null,
  type transaction_type not null check (type <> 'transfer'),
  account_id uuid not null references accounts on delete cascade,
  category_id uuid references categories on delete set null,
  amount_minor bigint not null check (amount_minor > 0),
  starts_on date not null,
  recurrence_rule text not null,
  next_due_on date,
  auto_post boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- amount_minor is always positive; `type` decides the sign. A transfer moves
-- amount_minor out of account_id and transfer_amount_minor (in the target
-- account's currency) into transfer_account_id.
create table transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  account_id uuid not null references accounts on delete cascade,
  type transaction_type not null,
  amount_minor bigint not null check (amount_minor > 0),
  category_id uuid references categories on delete set null,
  occurred_on date not null default current_date,
  note text,
  transfer_account_id uuid references accounts on delete cascade,
  transfer_amount_minor bigint,
  recurring_id uuid references recurring_items on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (
    (type = 'transfer' and transfer_account_id is not null and transfer_amount_minor > 0)
    or (type <> 'transfer' and transfer_account_id is null)
  )
);
create index transactions_account_idx on transactions (account_id, occurred_on);

create table budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  category_id uuid not null references categories on delete cascade,
  amount_minor bigint not null check (amount_minor > 0),
  currency currency_code not null default 'IDR',
  starts_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Wealth
-- ---------------------------------------------------------------------------
create table assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  name text not null,
  type asset_type not null,
  currency currency_code not null default 'IDR',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table asset_valuations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  asset_id uuid not null references assets on delete cascade,
  value_minor bigint not null,
  valued_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table liabilities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  name text not null,
  type liability_type not null,
  currency currency_code not null default 'IDR',
  principal_minor bigint not null default 0,
  interest_rate numeric(6, 3),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table liability_balances (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces on delete cascade,
  created_by uuid references auth.users default auth.uid(),
  liability_id uuid not null references liabilities on delete cascade,
  balance_minor bigint not null,
  as_of date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Shared reference data, written by a scheduled job (not by users).
create table fx_rates (
  base currency_code not null,
  quote currency_code not null,
  rate numeric(20, 8) not null check (rate > 0),
  as_of date not null,
  primary key (base, quote, as_of)
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
create policy "own profile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

alter table workspaces enable row level security;
create policy "members read" on workspaces for select using (is_member(id));
create policy "members update" on workspaces for update using (is_member(id)) with check (is_member(id));

alter table workspace_members enable row level security;
create policy "members read" on workspace_members for select using (is_member(workspace_id));

alter table fx_rates enable row level security;
create policy "signed-in read" on fx_rates for select to authenticated using (true);

do $$
declare t text;
begin
  foreach t in array array[
    'lists', 'tasks', 'events', 'reminders', 'accounts', 'categories',
    'recurring_items', 'transactions', 'budgets', 'assets', 'asset_valuations',
    'liabilities', 'liability_balances'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "workspace members" on %I for all
         using (is_member(workspace_id)) with check (is_member(workspace_id))', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'workspaces', 'lists', 'tasks', 'events', 'reminders', 'accounts',
    'categories', 'recurring_items', 'transactions', 'budgets', 'assets',
    'asset_valuations', 'liabilities', 'liability_balances'
  ] loop
    execute format(
      'create trigger touch_updated_at before update on %I
         for each row execute function touch_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Derived balances
-- ---------------------------------------------------------------------------
create view account_balances with (security_invoker = true) as
select
  a.id as account_id,
  a.workspace_id,
  a.name,
  a.type,
  a.currency,
  a.archived,
  a.opening_balance_minor
    + coalesce(sum(case
        when t.account_id = a.id and t.type = 'income' then t.amount_minor
        when t.account_id = a.id then -t.amount_minor
        when t.transfer_account_id = a.id then t.transfer_amount_minor
      end), 0) as balance_minor
from accounts a
left join transactions t
  on (t.account_id = a.id or t.transfer_account_id = a.id) and t.deleted_at is null
where a.deleted_at is null
group by a.id;

-- ---------------------------------------------------------------------------
-- New user bootstrap: profile, personal workspace, starter categories
-- ---------------------------------------------------------------------------
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare ws uuid;
begin
  insert into profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));

  insert into workspaces (name) values ('Personal') returning id into ws;
  insert into workspace_members (workspace_id, user_id, role) values (ws, new.id, 'owner');

  insert into categories (workspace_id, created_by, name, kind) values
    (ws, new.id, 'Salary', 'income'),
    (ws, new.id, 'Other income', 'income'),
    (ws, new.id, 'Food & drinks', 'expense'),
    (ws, new.id, 'Groceries', 'expense'),
    (ws, new.id, 'Transport', 'expense'),
    (ws, new.id, 'Housing', 'expense'),
    (ws, new.id, 'Bills & utilities', 'expense'),
    (ws, new.id, 'Shopping', 'expense'),
    (ws, new.id, 'Health', 'expense'),
    (ws, new.id, 'Entertainment', 'expense'),
    (ws, new.id, 'Travel', 'expense'),
    (ws, new.id, 'Other', 'expense');

  insert into accounts (workspace_id, created_by, name, type, currency)
  values (ws, new.id, 'Cash', 'cash', 'IDR');

  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
