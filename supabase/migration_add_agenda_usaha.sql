-- ============================================================
-- MIGRATION: Tambah fitur Agenda Reuni (events + RSVP) dan
-- Direktori Usaha/UMKM Alumni (businesses).
-- Jalankan ini di Supabase SQL Editor KALAU kamu sudah pernah
-- menjalankan schema.sql sebelumnya. Kalau belum pernah setup
-- sama sekali, cukup jalankan schema.sql terbaru saja.
-- ============================================================

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  cover_image_url text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('hadir', 'mungkin', 'tidak_hadir')),
  jumlah_orang int not null default 1,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text,
  description text,
  whatsapp text,
  link text,
  location text,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.businesses enable row level security;

drop policy if exists "events_select_all" on public.events;
create policy "events_select_all" on public.events for select using (true);

drop policy if exists "events_admin_insert" on public.events;
create policy "events_admin_insert" on public.events for insert with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "events_admin_update" on public.events;
create policy "events_admin_update" on public.events for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "events_admin_delete" on public.events;
create policy "events_admin_delete" on public.events for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "rsvp_select_all" on public.event_rsvps;
create policy "rsvp_select_all" on public.event_rsvps for select using (true);

drop policy if exists "rsvp_insert_own" on public.event_rsvps;
create policy "rsvp_insert_own" on public.event_rsvps for insert with check (profile_id = auth.uid());

drop policy if exists "rsvp_update_own" on public.event_rsvps;
create policy "rsvp_update_own" on public.event_rsvps for update using (profile_id = auth.uid());

drop policy if exists "rsvp_delete_own" on public.event_rsvps;
create policy "rsvp_delete_own" on public.event_rsvps for delete using (profile_id = auth.uid());

drop policy if exists "business_select" on public.businesses;
create policy "business_select" on public.businesses for select using (
  status = 'approved'
  or owner_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "business_insert_own" on public.businesses;
create policy "business_insert_own" on public.businesses for insert with check (owner_id = auth.uid());

drop policy if exists "business_update_own_or_admin" on public.businesses;
create policy "business_update_own_or_admin" on public.businesses for update using (
  owner_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

insert into storage.buckets (id, name, public)
values ('business-photos', 'business-photos', true)
on conflict (id) do nothing;

drop policy if exists "public_read_business_photos" on storage.objects;
create policy "public_read_business_photos" on storage.objects
  for select using (bucket_id = 'business-photos');

drop policy if exists "auth_upload_business_photos" on storage.objects;
create policy "auth_upload_business_photos" on storage.objects
  for insert with check (bucket_id = 'business-photos' and auth.role() = 'authenticated');
