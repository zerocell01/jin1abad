# Jin1abad — Website Alumni Matholi'ul Falah Angkatan 2012

Blog alumni: direktori, cerita (blog), dan galeri foto. Dibangun dengan
Next.js + Supabase, di-deploy gratis ke Vercel — kamu hanya bayar domain.

## 1. Setup Supabase (gratis)

1. Buat akun & project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** → tempel isi file `supabase/schema.sql` → Run.
   Ini membuat semua tabel, aturan keamanan (RLS), dan storage bucket.
3. Buka **Project Settings > API**, catat:
   - `Project URL`
   - `anon public key`

## 2. Jalankan di lokal

```bash
npm install
cp .env.local.example .env.local
# isi .env.local dengan Project URL & anon key dari langkah 1
npm run dev
```

Buka `http://localhost:3000`.

## 3. Jadikan diri sendiri admin

Setelah daftar lewat `/register`, buka **Table Editor > profiles** di
Supabase, cari baris dengan email kamu, ubah kolom `role` jadi `admin`.
Admin bisa menyetujui/menolak cerita yang dikirim alumni lain.

## 4. Deploy ke Vercel (gratis, tanpa hosting berbayar)

1. Push folder ini ke repo GitHub baru.
2. Buka [vercel.com](https://vercel.com) → New Project → import repo itu.
3. Saat diminta Environment Variables, isi `NEXT_PUBLIC_SUPABASE_URL` dan
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sama seperti `.env.local`).
4. Deploy. Vercel akan kasih URL seperti `nama-project.vercel.app`.

## 5. Pasang domain sendiri

Di project Vercel → **Settings > Domains** → masukkan domain yang sudah
kamu beli (mis. dari Niagahoster/Namecheap) → ikuti instruksi untuk
mengarahkan DNS (biasanya tambah record `CNAME` atau `A`). Setelah propagasi
DNS selesai (beberapa menit–jam), situs otomatis bisa diakses lewat domain
sendiri dengan HTTPS gratis. Total biaya rutin: hanya perpanjangan domain.

## Struktur Fitur

| Fitur | Lokasi |
|---|---|
| Direktori alumni + filter angkatan/kelas/domisili | `/alumni` |
| Peta persebaran alumni per provinsi/kota (domisili & asal) | `/persebaran` |
| Kas/donasi alumni (transparansi + konfirmasi transfer) | `/kas` |
| Laporan kas (cetak PDF / download Excel) | `/kas/laporan` |
| Agenda acara reuni + RSVP | `/agenda`, `/dashboard/agenda/new` |
| Direktori usaha/UMKM alumni | `/usaha`, `/dashboard/usaha/new` |
| Profil alumni (data, cerita, album) | `/alumni/[id]` |
| Cerita / blog (perlu approval admin) | `/blog`, `/dashboard/new-post` |
| Komentar & reaksi emoji di tiap cerita | `/blog/[id]` |
| Galeri album foto | `/gallery`, `/dashboard/new-album` |
| Edit data diri | `/dashboard/profile` |
| Approval cerita/usaha/kas (khusus admin) | `/dashboard` |

## Catatan

- Setiap anggota login dengan email & password biasa (Supabase Auth) — tidak
  perlu akun GitHub.
- Cerita baru berstatus "pending" sampai admin menekan **Setujui** di dashboard.
- Foto profil, cover cerita, dan foto album disimpan di Supabase Storage
  (free tier ±1GB, cukup untuk ratusan foto terkompresi).
- Direktori bisa difilter per **kelas** (A/B/C/D) dan domisili
  (**kota / kabupaten / provinsi**). Kalau project Supabase kamu sudah
  pernah dibuat sebelum field ini ditambahkan, jalankan
  `supabase/migration_add_location.sql` sekali di SQL Editor.
- Alamat lengkap (jalan/RT-RW) bersifat privat secara default — alumni harus
  mencentang "Tampilkan alamat lengkap" sendiri di halaman profil supaya
  orang lain bisa melihatnya. Kota/kabupaten/provinsi tetap publik karena
  dipakai untuk filter direktori.
- Data lokasi alumni dipisah jadi dua: **Domisili Sekarang** (tempat tinggal
  saat ini) dan **Alamat Asal** (kampung halaman). Halaman `/persebaran`
  punya toggle untuk lihat peta berdasarkan salah satu dari keduanya, dan
  klik nama daerah otomatis loncat ke Direktori yang sudah terfilter sesuai
  jenisnya. Kalau Supabase kamu sudah pernah disetup sebelum field ini ada,
  jalankan `supabase/migration_add_asal.sql` sekali di SQL Editor.
- **Kas Alumni** (`/kas`) ini cuma pembukuan transparansi, bukan payment
  gateway — alumni transfer manual ke rekening/e-wallet yang diatur admin,
  lalu isi form "Konfirmasi Transfer". Transaksi baru tampil di riwayat
  publik setelah admin menekan **Verifikasi** di dashboard (mencegah orang
  asal klaim sudah transfer). Admin juga bisa catat pengeluaran lewat
  **Catat Pengeluaran Kas** dan atur nomor rekening lewat **Atur Rekening
  Kas**. Kalau Supabase kamu sudah pernah disetup sebelum fitur ini ada,
  jalankan `supabase/migration_add_kas.sql` sekali di SQL Editor.
- **Laporan Kas** (`/kas/laporan`) bisa difilter per tanggal, lalu:
  - **Cetak / Simpan PDF** → pakai fitur print browser (tombol ini buka
    dialog print, pilih "Save as PDF" di situ). Gak butuh layanan PDF
    eksternal.
  - **Download Excel** → file `.xlsx` asli, langsung kebuka di Excel/Sheets.
- **Agenda** (`/agenda`) dan **Usaha** (`/usaha`) pakai pola yang sama
  seperti cerita/kas: admin yang bikin acara, anggota yang konfirmasi
  hadir (RSVP); anggota yang daftarkan usaha, admin yang setujui sebelum
  tayang publik. Kalau Supabase kamu sudah pernah disetup sebelum fitur
  ini ada, jalankan `supabase/migration_add_agenda_usaha.sql` sekali.
- **Preview link di WhatsApp/medsos** sudah otomatis rapi — judul, ringkasan,
  dan gambar (cover cerita/foto album, atau gambar default kalau gak ada)
  akan muncul saat link `/blog/...` atau `/gallery/...` di-paste. Gak perlu
  setting tambahan, otomatis jalan setelah deploy.
- **Add to Home Screen** — buka situsnya lewat Chrome/Safari di HP, lalu
  pilih "Add to Home Screen" / "Install App" dari menu browser. Ikon
  `Jin1abad` akan muncul di home screen kayak aplikasi biasa. (Ini bukan
  app native penuh dengan mode offline, cuma shortcut + ikon + tampilan
  fullscreen tanpa address bar.)
- **Komentar & reaksi** cuma bisa di cerita yang sudah "Tayang" (published) —
  ini dijaga di level database (RLS), jadi gak bisa dikomentari selagi masih
  ditinjau admin. Klik reaksi yang sama dua kali buat membatalkannya.
  Penulis komentar bisa hapus komentarnya sendiri; admin bisa hapus komentar
  siapa saja (moderasi). Kalau Supabase kamu sudah pernah disetup sebelum
  fitur ini ada, jalankan `supabase/migration_add_comments.sql` sekali.
- **Foto profil** bisa diupload di `/dashboard/profile`, langsung dipakai
  di Direktori, halaman profil, dan header cerita — sebelum diupload, semua
  tempat itu otomatis tampil cap angkatan sebagai pengganti (jadi gak ada
  yang kosong/rusak kalau alumni belum upload foto).
- **Statistik ringkas admin** — begitu admin login dan buka `/dashboard`,
  langsung tampil 5 angka penting di atas: total alumni, cerita tayang
  (+ jumlah pending), saldo kas (+ jumlah konfirmasi menunggu), acara
  mendatang, dan usaha terdaftar (+ jumlah pending). Tiap kartu bisa diklik
  buat loncat ke halaman terkait. Cuma muncul buat akun admin.
- **Pencarian global** (`/cari`) — satu kotak cari di navbar (PC: kotak kecil
  di sebelah menu; HP: di paling atas menu hamburger) buat cari sekaligus di
  alumni, cerita, usaha, album, dan acara. Hasilnya dikelompokkan per
  kategori.
- **Export Data Alumni ke Excel** — tombol "Export Data Alumni (Excel)" di
  dashboard, **khusus admin**. Pengecekan role admin dilakukan di server
  (route handler), jadi gak bisa diakses langsung lewat URL oleh member
  biasa meski tahu link-nya. File `.xlsx` isinya semua data profil
  (termasuk alamat lengkap) — dipakai buat cadangan data di luar Supabase.
