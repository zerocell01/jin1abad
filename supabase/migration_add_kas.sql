-- ============================================================
-- MIGRATION: Tambah fitur Kas/Donasi Alumni
-- Jalankan ini di Supabase SQL Editor KALAU kamu sudah pernah
-- menjalankan schema.sql sebelumnya. Kalau belum pernah setup
-- sama sekali, cukup jalankan schema.sql terbaru saja.
-- ============================================================

create table if not exists public.kas_settings (
  id smallint primary key default 1 check (id = 1),
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  ewallet_name text,
  ewallet_number text,
  note text,
  updated_at timestamptz not null default now()
);

insert into public.kas_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.kas_transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('masuk', 'keluar')),
  amount numeric(14, 2) not null check (amount > 0),
  description text,
  category text,
  contributor_id uuid references public.profiles(id) on delete set null,
  is_anonymous boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  verified_by uuid references public.profiles(id),
  transaction_date date not null default current_date,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create or replace function public.kas_force_pending()
returns trigger as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    new.status := 'pending';
    new.verified_by := null;
    new.verified_at := null;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists before_insert_kas on public.kas_transactions;
create trigger before_insert_kas
  before insert on public.kas_transactions
  for each row execute procedure public.kas_force_pending();

alter table public.kas_settings enable row level security;
alter table public.kas_transactions enable row level security;

drop policy if exists "kas_settings_select_all" on public.kas_settings;
create policy "kas_settings_select_all" on public.kas_settings
  for select using (true);

drop policy if exists "kas_settings_update_admin" on public.kas_settings;
create policy "kas_settings_update_admin" on public.kas_settings
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "kas_select" on public.kas_transactions;
create policy "kas_select" on public.kas_transactions
  for select using (
    status = 'verified'
    or submitted_by = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "kas_insert_own" on public.kas_transactions;
create policy "kas_insert_own" on public.kas_transactions
  for insert with check (submitted_by = auth.uid());

drop policy if exists "kas_update_admin" on public.kas_transactions;
create policy "kas_update_admin" on public.kas_transactions
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
