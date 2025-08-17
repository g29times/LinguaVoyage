-- IP Ledger table for LinguaVoyage
-- Stores point changes (earn/spend) per user. Positive amount_delta = earn; negative = spend.

-- Optional extensions for search indexing
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

create table if not exists public.app_24b6a0157d_ip_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_delta integer not null,
  activity text not null,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Useful indexes
create index if not exists app_24b6a0157d_ip_ledger_user_time_idx
  on public.app_24b6a0157d_ip_ledger (user_id, created_at desc);

-- Simple text search across activity + description
create index if not exists app_24b6a0157d_ip_ledger_search_idx
  on public.app_24b6a0157d_ip_ledger using gin (
    to_tsvector('simple', coalesce(activity,'') || ' ' || coalesce(description,''))
  );

-- RLS: only owner can read their ledger
alter table public.app_24b6a0157d_ip_ledger enable row level security;

drop policy if exists "Users can view own ledger" on public.app_24b6a0157d_ip_ledger;
create policy "Users can view own ledger"
  on public.app_24b6a0157d_ip_ledger
  for select
  using (auth.uid() = user_id);

-- (Optional) If you want to allow client-side inserts for testing only, uncomment below.
-- NOTE: For production, prefer server-side RPC with service role to ensure atomicity.
drop policy if exists "Users can insert own ledger" on public.app_24b6a0157d_ip_ledger;
create policy "Users can insert own ledger"
  on public.app_24b6a0157d_ip_ledger
  for insert
  with check (auth.uid() = user_id);

-- Example query
-- select * from public.app_24b6a0157d_ip_ledger where user_id = auth.uid() order by created_at desc limit 20;
