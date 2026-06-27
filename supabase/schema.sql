-- ============================================================
-- SCHEMA DATABASE WEBSITE ALUMNI
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- Aktifkan extension untuk generate UUID
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. TABEL PROFILES (data alumni + terhubung ke akun login)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  angkatan int,                -- tahun lulus, mis. 2015
  kelas text,                  -- mis. 'A', 'B', 'C', 'D'
  jurusan text,
  pekerjaan text,
  perusahaan text,
  bio text,
  alamat text,                 -- alamat domisili sekarang (privat, lihat show_address)
  kota text,
  kabupaten text,
  provinsi text,
  show_address boolean default false,   -- tampilkan alamat domisili lengkap ke publik atau tidak
  asal_alamat text,            -- alamat asal/kampung halaman (privat, lihat asal_show_address)
  asal_kota text,
  asal_kabupaten text,
  asal_provinsi text,
  asal_show_address boolean default false,  -- tampilkan alamat asal lengkap ke publik atau tidak
  linkedin_url text,
  whatsapp text,
  show_contact boolean default false,   -- tampilkan kontak ke publik atau tidak
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

-- Otomatis buat baris profile saat ada user baru daftar
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Alumni Baru'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. TABEL POSTS (konten blog)
-- ============================================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  cover_image_url text,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

-- ============================================================
-- 3. TABEL ALBUMS (kumpulan foto, mis. per acara/angkatan)
-- ============================================================
create table public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  angkatan int,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. TABEL PHOTOS (foto individual di dalam album)
-- ============================================================
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  image_url text not null,
  caption text,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;

-- --- PROFILES ---
-- Semua orang (termasuk yang belum login) bisa lihat list alumni
create policy "profiles_select_all" on public.profiles
  for select using (true);

-- Hanya pemilik akun yang bisa update profil sendiri
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- --- POSTS ---
-- Post yang sudah 'published' bisa dilihat semua orang.
-- Penulis bisa lihat post miliknya sendiri meski masih 'pending'.
-- Admin bisa lihat semua post.
create policy "posts_select" on public.posts
  for select using (
    status = 'published'
    or author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- User yang login bisa membuat post atas nama dirinya sendiri
create policy "posts_insert_own" on public.posts
  for insert with check (auth.uid() = author_id);

-- Penulis bisa edit post miliknya yang masih pending, admin bisa edit apa saja (approve/reject)
create policy "posts_update" on public.posts
  for update using (
    (author_id = auth.uid() and status = 'pending')
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- --- ALBUMS ---
create policy "albums_select_all" on public.albums
  for select using (true);

create policy "albums_insert_own" on public.albums
  for insert with check (auth.uid() = created_by);

create policy "albums_update_own" on public.albums
  for update using (
    created_by = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- --- PHOTOS ---
create policy "photos_select_all" on public.photos
  for select using (true);

create policy "photos_insert_own" on public.photos
  for insert with check (auth.uid() = uploaded_by);

create policy "photos_delete_own" on public.photos
  for delete using (
    uploaded_by = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 5. TABEL KAS_SETTINGS (info rekening, baris tunggal)
-- ============================================================
create table public.kas_settings (
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

-- ============================================================
-- 6. TABEL KAS_TRANSACTIONS (kas masuk/keluar alumni)
-- ============================================================
create table public.kas_transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('masuk', 'keluar')),
  amount numeric(14, 2) not null check (amount > 0),
  description text,
  category text,                          -- mis. 'iuran', 'donasi', 'acara', 'operasional'
  contributor_id uuid references public.profiles(id) on delete set null,
  is_anonymous boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  verified_by uuid references public.profiles(id),
  transaction_date date not null default current_date,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

-- Paksa status jadi 'pending' kalau yang insert bukan admin, supaya member
-- tidak bisa langsung menandai transaksinya sendiri sebagai 'verified'.
create function public.kas_force_pending()
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

create trigger before_insert_kas
  before insert on public.kas_transactions
  for each row execute procedure public.kas_force_pending();

alter table public.kas_settings enable row level security;
alter table public.kas_transactions enable row level security;

-- --- KAS_SETTINGS ---
create policy "kas_settings_select_all" on public.kas_settings
  for select using (true);

create policy "kas_settings_update_admin" on public.kas_settings
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- --- KAS_TRANSACTIONS ---
-- Transaksi 'verified' bisa dilihat siapa saja (transparansi kas).
-- Pengirim bisa lihat transaksinya sendiri meski masih pending. Admin lihat semua.
create policy "kas_select" on public.kas_transactions
  for select using (
    status = 'verified'
    or submitted_by = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- User yang login bisa kirim konfirmasi transaksi atas nama dirinya sendiri
create policy "kas_insert_own" on public.kas_transactions
  for insert with check (submitted_by = auth.uid());

-- Hanya admin yang bisa verifikasi/tolak/ubah transaksi
create policy "kas_update_admin" on public.kas_transactions
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 7. TABEL EVENTS (agenda/acara reuni)
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  event_date timestamptz not null,
  cover_image_url text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 8. TABEL EVENT_RSVPS (konfirmasi hadir alumni per acara)
-- ============================================================
create table public.event_rsvps (
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

alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

create policy "events_select_all" on public.events
  for select using (true);

create policy "events_admin_insert" on public.events
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "events_admin_update" on public.events
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "events_admin_delete" on public.events
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Semua orang bisa lihat daftar yang konfirmasi hadir (transparan ke panitia & alumni lain)
create policy "rsvp_select_all" on public.event_rsvps
  for select using (true);

create policy "rsvp_insert_own" on public.event_rsvps
  for insert with check (profile_id = auth.uid());

create policy "rsvp_update_own" on public.event_rsvps
  for update using (profile_id = auth.uid());

create policy "rsvp_delete_own" on public.event_rsvps
  for delete using (profile_id = auth.uid());

-- ============================================================
-- 9. TABEL BUSINESSES (direktori usaha/UMKM alumni)
-- ============================================================
create table public.businesses (
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

alter table public.businesses enable row level security;

-- Usaha 'approved' bisa dilihat siapa saja. Pemilik bisa lihat usahanya sendiri
-- meski masih pending. Admin bisa lihat semua.
create policy "business_select" on public.businesses
  for select using (
    status = 'approved'
    or owner_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "business_insert_own" on public.businesses
  for insert with check (owner_id = auth.uid());

create policy "business_update_own_or_admin" on public.businesses
  for update using (
    owner_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ============================================================
-- 10. TABEL COMMENTS (komentar di cerita/post)
-- ============================================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 11. TABEL POST_REACTIONS (reaksi emoji di cerita/post)
-- ============================================================
create table public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check (reaction in ('suka', 'cinta', 'semangat')),
  created_at timestamptz not null default now(),
  unique (post_id, profile_id)
);

alter table public.comments enable row level security;
alter table public.post_reactions enable row level security;

-- --- COMMENTS ---
-- Komentar bisa dilihat siapa saja KALAU post-nya sudah 'published'.
-- Penulis komentar & admin tetap bisa lihat komentarnya sendiri di post apa pun.
create policy "comments_select" on public.comments
  for select using (
    exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
    or author_id = auth.uid()
    or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
  );

-- Hanya bisa komentar di post yang sudah 'published', atas nama diri sendiri
create policy "comments_insert_own" on public.comments
  for insert with check (
    author_id = auth.uid()
    and exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
  );

create policy "comments_update_own" on public.comments
  for update using (author_id = auth.uid());

-- Penulis komentar bisa hapus punyanya sendiri, admin bisa hapus komentar siapa saja (moderasi)
create policy "comments_delete_own_or_admin" on public.comments
  for delete using (
    author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- --- POST_REACTIONS ---
create policy "reactions_select_all" on public.post_reactions
  for select using (true);

create policy "reactions_insert_own" on public.post_reactions
  for insert with check (profile_id = auth.uid());

create policy "reactions_update_own" on public.post_reactions
  for update using (profile_id = auth.uid());

create policy "reactions_delete_own" on public.post_reactions
  for delete using (profile_id = auth.uid());

-- ============================================================
-- STORAGE BUCKETS (untuk foto profil, cover post, foto album, foto usaha)
-- Jalankan ini juga di SQL Editor, atau buat manual lewat
-- menu Storage di dashboard Supabase dengan nama yang sama.
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('post-covers', 'post-covers', true),
  ('album-photos', 'album-photos', true),
  ('business-photos', 'business-photos', true)
on conflict (id) do nothing;

-- Semua orang boleh melihat (download) file di bucket publik ini
create policy "public_read_avatars" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "public_read_post_covers" on storage.objects
  for select using (bucket_id = 'post-covers');
create policy "public_read_album_photos" on storage.objects
  for select using (bucket_id = 'album-photos');
create policy "public_read_business_photos" on storage.objects
  for select using (bucket_id = 'business-photos');

-- Hanya user yang sudah login yang boleh upload
create policy "auth_upload_avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "auth_upload_post_covers" on storage.objects
  for insert with check (bucket_id = 'post-covers' and auth.role() = 'authenticated');
create policy "auth_upload_album_photos" on storage.objects
  for insert with check (bucket_id = 'album-photos' and auth.role() = 'authenticated');
create policy "auth_upload_business_photos" on storage.objects
  for insert with check (bucket_id = 'business-photos' and auth.role() = 'authenticated');
