-- ============================================================
-- MIGRATION: Tambah field kelas & alamat ke profiles
-- Jalankan ini di Supabase SQL Editor KALAU kamu sudah pernah
-- menjalankan schema.sql sebelumnya (tabel profiles sudah ada).
-- Kalau belum pernah setup sama sekali, cukup jalankan schema.sql
-- yang sudah terbaru, tidak perlu file ini.
-- ============================================================

alter table public.profiles
  add column if not exists kelas text,
  add column if not exists alamat text,
  add column if not exists kota text,
  add column if not exists kabupaten text,
  add column if not exists provinsi text,
  add column if not exists show_address boolean default false;
