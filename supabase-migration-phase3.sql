-- ============================================================
-- FitPilot — Phase 3 migration: Chat + AI Assistant
-- Run AFTER phases 1 and 2.
-- ============================================================

-- ---------- AI Assistant: conversations + messages ----------
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.ai_conversations(id) on delete cascade not null,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_ai_msgs_conv on public.ai_messages(conversation_id, created_at);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

drop policy if exists "ai_conv_owner" on public.ai_conversations;
create policy "ai_conv_owner" on public.ai_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ai_msg_owner" on public.ai_messages;
create policy "ai_msg_owner" on public.ai_messages
  for all using (
    exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
  );

-- ---------- PT ↔ Cliente chat ----------
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  sender_role text not null check (sender_role in ('trainer','client')),
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_chat_pair on public.chat_messages(trainer_id, client_id, created_at);

alter table public.chat_messages enable row level security;

drop policy if exists "chat_trainer_access" on public.chat_messages;
create policy "chat_trainer_access" on public.chat_messages
  for all using (auth.uid() = trainer_id) with check (auth.uid() = trainer_id);

drop policy if exists "chat_client_access" on public.chat_messages;
create policy "chat_client_access" on public.chat_messages
  for all using (
    exists (select 1 from public.clients c where c.id = client_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.clients c where c.id = client_id and c.user_id = auth.uid())
  );

-- Realtime
alter publication supabase_realtime add table public.chat_messages;
