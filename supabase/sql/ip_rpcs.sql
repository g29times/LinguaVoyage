-- Atomic RPCs for IP spend/earn with ledger logging
-- Safe to run multiple times

-- 1) Idempotency support: optional key with partial unique index
alter table if exists public.app_24b6a0157d_ip_ledger
  add column if not exists idempotency_key text;

create unique index if not exists app_ledger_idem_idx
  on public.app_24b6a0157d_ip_ledger (user_id, idempotency_key)
  where idempotency_key is not null;

-- 2) Atomic spend + ledger insert
create or replace function public.fn_spend_ip_and_log(
  p_user_id uuid,
  p_amount integer,
  p_activity text,
  p_description text,
  p_metadata jsonb default '{}'::jsonb,
  p_idempotency_key text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_curr integer;
  v_new integer;
  v_ledger_id uuid;
  v_existing uuid;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'unauthorized';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  -- Idempotency: if key exists, return existing state
  if p_idempotency_key is not null then
    select id into v_existing
    from public.app_24b6a0157d_ip_ledger
    where user_id = p_user_id and idempotency_key = p_idempotency_key;

    if v_existing is not null then
      select total_ip into v_curr from public.app_24b6a0157d_user_progress where user_id = p_user_id;
      return jsonb_build_object('ledger_id', v_existing, 'new_total_ip', v_curr, 'idempotent', true);
    end if;
  end if;

  -- Lock user's progress row
  select total_ip into v_curr
  from public.app_24b6a0157d_user_progress
  where user_id = p_user_id
  for update;

  if v_curr is null then
    raise exception 'user progress not found';
  end if;
  if v_curr < p_amount then
    raise exception 'insufficient_funds';
  end if;

  v_new := v_curr - p_amount;

  update public.app_24b6a0157d_user_progress
  set total_ip = v_new
  where user_id = p_user_id;

  insert into public.app_24b6a0157d_ip_ledger (
    user_id, amount_delta, activity, description, metadata, idempotency_key
  ) values (
    p_user_id, -p_amount, p_activity, p_description, p_metadata, p_idempotency_key
  ) returning id into v_ledger_id;

  return jsonb_build_object('ledger_id', v_ledger_id, 'new_total_ip', v_new, 'idempotent', false);
end$$;

grant execute on function public.fn_spend_ip_and_log(uuid, integer, text, text, jsonb, text) to authenticated;

-- 3) Atomic MBTI: update indicators + ensure 'mbti_vision' unlocked + spend + ledger (idempotent)
create or replace function public.fn_mbti_save_and_charge(
  p_user_id uuid,
  p_indicators jsonb,
  p_amount integer,
  p_idempotency_key text default null,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_curr integer;
  v_new integer;
  v_spells text[];
  v_has boolean;
  v_ledger_id uuid;
  v_existing uuid;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'unauthorized';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  -- Idempotency: if key exists, return existing state
  if p_idempotency_key is not null then
    select id into v_existing
    from public.app_24b6a0157d_ip_ledger
    where user_id = p_user_id and idempotency_key = p_idempotency_key;
    if v_existing is not null then
      select total_ip into v_curr from public.app_24b6a0157d_user_progress where user_id = p_user_id;
      return jsonb_build_object('ledger_id', v_existing, 'new_total_ip', v_curr, 'idempotent', true);
    end if;
  end if;

  -- Lock row and get current values
  select total_ip, coalesce(unlocked_spells, '{}')
    into v_curr, v_spells
  from public.app_24b6a0157d_user_progress
  where user_id = p_user_id
  for update;

  if v_curr is null then
    raise exception 'user progress not found';
  end if;
  if v_curr < p_amount then
    raise exception 'insufficient_funds';
  end if;

  -- ensure mbti_vision in spells
  select 'mbti_vision' = any(v_spells) into v_has;
  if not v_has then
    v_spells := array_append(v_spells, 'mbti_vision');
  end if;

  v_new := v_curr - p_amount;

  update public.app_24b6a0157d_user_progress
  set total_ip = v_new,
      unlocked_spells = v_spells,
      mbti_indicators = p_indicators
  where user_id = p_user_id;

  insert into public.app_24b6a0157d_ip_ledger (
    user_id, amount_delta, activity, description, metadata, idempotency_key
  ) values (
    p_user_id, -p_amount, 'mbti_assessment', 'MBTI assessment', coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object('source','rpc'), p_idempotency_key
  ) returning id into v_ledger_id;

  return jsonb_build_object('ledger_id', v_ledger_id, 'new_total_ip', v_new, 'idempotent', false);
end$$;

grant execute on function public.fn_mbti_save_and_charge(uuid, jsonb, integer, text, jsonb) to authenticated;
