-- ============================================================
-- MIGRATION: Tambah fitur Komentar & Reaksi di Cerita.
-- Jalankan ini di Supabase SQL Editor KALAU kamu sudah pernah
-- menjalankan schema.sql sebelumnya. Kalau belum pernah setup
-- sama sekali, cukup jalankan schema.sql terbaru saja.
-- ============================================================

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check (reaction in ('suka', 'cinta', 'semangat')),
  created_at timestamptz not null default now(),
  unique (post_id, profile_id)
);

alter table public.comments enable row level security;
alter table public.post_reactions enable row level security;

drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments for select using (
  exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
  or author_id = auth.uid()
  or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments for insert with check (
  author_id = auth.uid()
  and exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
);

drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own" on public.comments for update using (author_id = auth.uid());

drop policy if exists "comments_delete_own_or_admin" on public.comments;
create policy "comments_delete_own_or_admin" on public.comments for delete using (
  author_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "reactions_select_all" on public.post_reactions;
create policy "reactions_select_all" on public.post_reactions for select using (true);

drop policy if exists "reactions_insert_own" on public.post_reactions;
create policy "reactions_insert_own" on public.post_reactions for insert with check (profile_id = auth.uid());

drop policy if exists "reactions_update_own" on public.post_reactions;
create policy "reactions_update_own" on public.post_reactions for update using (profile_id = auth.uid());

drop policy if exists "reactions_delete_own" on public.post_reactions;
create policy "reactions_delete_own" on public.post_reactions for delete using (profile_id = auth.uid());
