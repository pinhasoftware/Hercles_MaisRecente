-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FitPilot — Phase 1 schema                                    ║
-- ║  Run this in your Supabase SQL Editor                         ║
-- ║  https://tynoqcelrnqofmdzhxgd.supabase.co/project/_/sql       ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ──────────────────────────────────────────────────────────────
-- 1) ENUM TYPES
-- ──────────────────────────────────────────────────────────────
do $$ begin
  create type public.app_role as enum ('trainer', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.client_type as enum ('presencial', 'consultoria');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.client_status as enum ('ativo', 'atencao', 'inativo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.session_status as enum ('agendado', 'em_curso', 'concluido', 'atencao', 'faltou');
exception when duplicate_object then null; end $$;

-- ──────────────────────────────────────────────────────────────
-- 2) PROFILES
-- ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- 3) USER ROLES (separate table — security best practice)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

drop policy if exists "Roles: read own" on public.user_roles;
create policy "Roles: read own"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- ──────────────────────────────────────────────────────────────
-- 4) CLIENTS (trainer ↔ client link)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  avatar_url text,
  type public.client_type not null default 'presencial',
  monthly_value numeric(10,2),
  session_value numeric(10,2),
  start_date date not null default current_date,
  status public.client_status not null default 'ativo',
  attendance_pct integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists clients_trainer_idx on public.clients(trainer_id);
create index if not exists clients_user_idx on public.clients(user_id);

alter table public.clients enable row level security;

drop policy if exists "Clients: trainer manages own" on public.clients;
create policy "Clients: trainer manages own"
  on public.clients for all
  to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

drop policy if exists "Clients: client reads own row" on public.clients;
create policy "Clients: client reads own row"
  on public.clients for select
  to authenticated
  using (user_id = auth.uid());

-- Profiles policy that depends on public.clients (must come after clients exists)
drop policy if exists "Profiles: read own + linked trainer" on public.profiles;
create policy "Profiles: read own + linked trainer"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or exists (select 1 from public.clients c where c.trainer_id = profiles.id and c.user_id = auth.uid())
    or exists (select 1 from public.clients c where c.user_id = profiles.id and c.trainer_id = auth.uid())
  );

-- ──────────────────────────────────────────────────────────────
-- 5) SESSIONS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_min integer not null default 60,
  type public.client_type not null default 'presencial',
  status public.session_status not null default 'agendado',
  paid boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists sessions_trainer_idx on public.sessions(trainer_id, scheduled_at);
create index if not exists sessions_client_idx on public.sessions(client_id);

alter table public.sessions enable row level security;

drop policy if exists "Sessions: trainer manages own" on public.sessions;
create policy "Sessions: trainer manages own"
  on public.sessions for all
  to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

drop policy if exists "Sessions: client reads own" on public.sessions;
create policy "Sessions: client reads own"
  on public.sessions for select
  to authenticated
  using (exists (select 1 from public.clients c where c.id = sessions.client_id and c.user_id = auth.uid()));

-- ──────────────────────────────────────────────────────────────
-- 6) INVITES (copyable link tokens)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  token text not null unique,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists invites_token_idx on public.invites(token);

alter table public.invites enable row level security;

drop policy if exists "Invites: trainer manages own" on public.invites;
create policy "Invites: trainer manages own"
  on public.invites for all
  to authenticated
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

-- Anyone (incl. anonymous) can read by token to validate the invite on the auth screen.
-- Only minimal data is exposed via the join with profiles in the app code.
drop policy if exists "Invites: public read by token" on public.invites;
create policy "Invites: public read by token"
  on public.invites for select
  to anon, authenticated
  using (true);

-- ──────────────────────────────────────────────────────────────
-- 7) TRIGGER: auto-create profile + role on signup,
--             link invite if provided
-- ──────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_role public.app_role;
  v_invite_token text;
  v_invite record;
begin
  v_invite_token := new.raw_user_meta_data ->> 'invite_token';
  -- If user signed up with an invite token, they're a client. Otherwise default to trainer.
  v_role := case
    when v_invite_token is not null then 'client'::public.app_role
    else coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'trainer')
  end;

  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, v_role)
  on conflict (user_id, role) do nothing;

  if v_invite_token is not null and v_role = 'client' then
    select * into v_invite from public.invites where token = v_invite_token and used_at is null limit 1;
    if found then
      update public.clients set user_id = new.id where id = v_invite.client_id;
      update public.invites set used_at = now() where id = v_invite.id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
