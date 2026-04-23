-- ============================================================
-- FitPilot — Security fixes
-- Run AFTER previous migrations.
-- ============================================================

-- 1) Lock down invites: remove public USING(true), expose via RPC
drop policy if exists "Invites: public read by token" on public.invites;

-- Secure RPC to validate an invite token without leaking the table.
-- Returns only the trainer's display name when the token is valid & unused.
create or replace function public.get_invite_info(_token text)
returns table (trainer_name text)
language sql
stable
security definer
set search_path = public
as $$
  select p.full_name as trainer_name
  from public.invites i
  join public.profiles p on p.id = i.trainer_id
  where i.token = _token
    and i.used_at is null
  limit 1;
$$;

revoke all on function public.get_invite_info(text) from public;
grant execute on function public.get_invite_info(text) to anon, authenticated;

-- 2) Stop client-controlled role self-assignment in signup trigger.
-- Default everyone to 'client'. Trainer role must be granted by an admin
-- out-of-band (manual insert into user_roles).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.app_role := 'client';
  v_invite_token text;
  v_invite record;
begin
  v_invite_token := new.raw_user_meta_data ->> 'invite_token';

  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, v_role)
  on conflict (user_id, role) do nothing;

  if v_invite_token is not null then
    select * into v_invite from public.invites where token = v_invite_token and used_at is null limit 1;
    if found then
      update public.clients set user_id = new.id where id = v_invite.client_id;
      update public.invites set used_at = now() where id = v_invite.id;
    end if;
  end if;

  return new;
end;
$$;
