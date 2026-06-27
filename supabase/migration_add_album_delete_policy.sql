-- ============================================================
-- MIGRATION: ADD DELETE POLICY FOR ALBUMS TABLE
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- Izinkan pembuat album dan admin untuk menghapus album
create policy "albums_delete_own_or_admin" on public.albums
  for delete using (
    created_by = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
