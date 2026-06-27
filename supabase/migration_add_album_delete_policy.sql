-- ============================================================
-- MIGRATION: ADD DELETE POLICIES FOR ALBUMS, PHOTOS & STORAGE
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Kebijakan hapus untuk tabel ALBUMS
drop policy if exists "albums_delete_own_or_admin" on public.albums;
create policy "albums_delete_own_or_admin" on public.albums
  for delete using (
    created_by = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 2. Kebijakan hapus untuk tabel PHOTOS (mengizinkan pemilik album menghapus semua foto di dalamnya)
drop policy if exists "photos_delete_own" on public.photos;
drop policy if exists "photos_delete_policy" on public.photos;
create policy "photos_delete_policy" on public.photos
  for delete using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from public.albums a
      where a.id = album_id and a.created_by = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 3. Kebijakan hapus untuk objek di STORAGE (bucket 'album-photos')
drop policy if exists "delete_album_photos" on storage.objects;
create policy "delete_album_photos" on storage.objects
  for delete using (
    bucket_id = 'album-photos'
    and auth.role() = 'authenticated'
  );
