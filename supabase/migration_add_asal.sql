-- ============================================================
-- MIGRATION: Tambah field "Alamat Asal" (terpisah dari domisili
-- sekarang) ke profiles.
-- Jalankan ini di Supabase SQL Editor KALAU kamu sudah pernah
-- menjalankan schema.sql sebelumnya.
-- ============================================================

alter table public.profiles
  add column if not exists asal_alamat text,
  add column if not exists asal_kota text,
  add column if not exists asal_kabupaten text,
  add column if not exists asal_provinsi text,
  add column if not exists asal_show_address boolean default false;
