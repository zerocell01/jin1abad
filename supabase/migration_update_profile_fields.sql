-- ============================================================
-- MIGRASI SINKRONISASI DATA ALUMNI
-- Jalankan skrip ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Hapus kolom lama yang tidak digunakan lagi
ALTER TABLE public.profiles DROP COLUMN IF EXISTS jurusan;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS linkedin_url;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS kota;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS asal_kota;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS perusahaan;

-- 2. Tambah kolom baru untuk Desa dan Kecamatan
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS desa text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kecamatan text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS asal_desa text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS asal_kecamatan text;
