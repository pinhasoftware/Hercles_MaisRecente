-- ============================================================
-- Fase 1: Storage buckets para fotos e ficheiros
-- Corre este SQL no Supabase SQL Editor uma vez.
-- ============================================================

-- 1) Buckets
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('nutrition-files', 'nutrition-files', false),
  ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- 2) RLS para 'avatars' (público para ler, só dono escreve)
create policy if not exists "avatars are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

create policy if not exists "users upload own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy if not exists "users update own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy if not exists "users delete own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3) RLS para 'nutrition-files' (PT escreve, cliente lê o seu)
-- Path convention: {trainer_id}/{client_id}/filename
create policy if not exists "trainer manages nutrition files"
on storage.objects for all
to authenticated
using (
  bucket_id = 'nutrition-files'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'nutrition-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy if not exists "client reads own nutrition files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'nutrition-files'
  and exists (
    select 1 from public.clients c
    where c.user_id = auth.uid()
      and c.id::text = (storage.foldername(name))[2]
  )
);

-- 4) RLS para 'progress-photos' (cliente escreve as suas, PT vê as do seu cliente)
-- Path: {client_user_id}/filename
create policy if not exists "users manage own progress photos"
on storage.objects for all
to authenticated
using (
  bucket_id = 'progress-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'progress-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy if not exists "trainer views client progress photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'progress-photos'
  and exists (
    select 1 from public.clients c
    where c.trainer_id = auth.uid()
      and c.user_id::text = (storage.foldername(name))[1]
  )
);
