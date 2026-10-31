# Sketsa Wireframe & Status Implementasi

Dokumen ini menerjemahkan sketsa Excalidraw awal (`Untitled-2026-10-30-2329.excalidraw`) ke dalam bentuk teks. Dokumen ini **bukan** design system teknis; token warna, tipografi, spacing, radius, dan aturan komponen ada di [`docs/architecture.md`](./architecture.md) §3.

> **Status:** dokumen referensi historis. Alur di bawah sudah disesuaikan dengan implementasi MVP saat ini. Perbedaan dari sketsa awal dicatat per bagian agar tidak dianggap sebagai rencana yang belum dikerjakan.

---

## 1. Landing Page

**Sketsa awal:** navbar berisi nama web, tentang, komunitas, volunteer, dan tombol login; hero dengan CTA “Jelajahi Tempat”; penjelasan fitur; footer.

**Implementasi saat ini:**

- Navbar: brand Rangkul, **Jelajahi**, **Komunitas**, **Volunteer**, lalu tombol **Masuk/Daftar** bila belum login.
- Setelah login: tombol **Kelola Kegiatan** (khusus organizer/admin), menu notifikasi, nama pengguna (tautan ke `/profil`), badge terverifikasi untuk organizer, dan tombol **Keluar**.
- Di bawah breakpoint `lg`, navbar diganti tombol hamburger yang membuka panel berisi seluruh CTA: Jelajahi, Komunitas, Volunteer, Profil saya, Kelola kegiatan/Dashboard admin sesuai peran, Keluar, serta Masuk/Daftar dan **Bagikan pengalaman** untuk tamu.
- Hero: “Membantu sesama, ruang untuk semua.” dengan CTA **Jelajahi tempat** dan **Jadi relawan**.
- Bagian fitur menjelaskan tiga pilar: informasi & navigasi, direktori komunitas, dan volunteer inklusif.
- Tautan masuk/daftar membawa parameter `next` agar pengguna kembali ke halaman asal setelah autentikasi.

## 2. Halaman Profil

**Sketsa awal:** foto profil, nama lengkap, username, email, no. telepon, alamat, dan bio.

**Implementasi saat ini:** halaman `/profil` (wajib login) menampilkan inisial nama, nama, email, badge peran, dan tanggal bergabung. Pengguna dapat mengubah nama tampilan dan bio lewat form; email dan peran hanya ditampilkan. Halaman yang sama memuat daftar postingan sendiri beserta status moderasinya (`PUBLISHED`/`PENDING`/`REJECTED`/`ARCHIVED`), daftar pendaftaran volunteer, dan ringkasan kontribusi. Avatar unggahan belum tersedia: UI memakai inisial, meski `profiles.avatarUrl` sudah ada di skema.

## 3. Fitur 1: Jelajahi & Navigasi

**Navbar:** sama seperti landing page. Tidak ada tombol bulat “+”; penambahan tempat dilakukan lewat CTA **Tambah Info** di halaman Jelajahi dan tautan navigasi.

**Feed Jelajahi** (`/jelajahi`):

- Search bar “Cari tempat, kota, atau alamat…” dan filter kategori.
- Daftar kartu postingan. Setiap kartu berisi foto sampul, kontributor, tanggal, kategori, nama tempat, lokasi, ringkasan cerita, jumlah “Paling membantu”, chip fasilitas, dan tombol navigasi.
- Urutan feed: **jumlah like terbanyak**, lalu **postingan terbaru**. Pencarian dan filter kategori dilakukan di client tanpa mengubah urutan tersebut.
- Tombol **“Paling membantu”** membutuhkan login.
- Badge **“Ramah Disabilitas”** muncul di halaman detail bila rating pemosting ≥ 4 (tidak ditampilkan di kartu feed).

**Detail postingan** (`/jelajahi/[slug]`):

- Carousel foto, nama tempat, kategori, kontributor, tanggal, rating pemosting, dan badge ramah disabilitas.
- Daftar fasilitas yang tercatat, peta lokasi, dan tombol **“Buka navigasi”**.
- **Tidak ada bagian ulasan** dan **tidak ada pemilihan pintu masuk**. Satu postingan mewakili satu lokasi.

**Halaman navigasi** (`/jelajahi/[slug]/navigasi`):

- Peta besar dengan rute pejalan kaki dari lokasi perangkat.
- Tombol menghitung ulang rute, ringkasan jarak/waktu, petunjuk arah teks, dan opsi panduan suara.
- Tidak ada input titik awal manual atau fallback titik contoh.

## 4. Fitur 2: Komunitas

**Sketsa awal:** halaman awal komunitas dengan search/filter wilayah, grid kartu, tombol “daftarin komunitas lu”, dan form pendaftaran berisi KTP.

**Implementasi saat ini:**

- `/komunitas`: hero direktori, pencarian kata kunci, filter wilayah dan fokus, grid kartu komunitas **VERIFIED**, serta CTA **“Daftarkan komunitasmu”**.
- Kartu komunitas: logo/sampul, nama, wilayah, fokus, ringkasan, dan tombol bergabung ke tautan eksternal.
- `/komunitas/[slug]`: profil komunitas, kontak, media sosial, fokus, dan komunitas terkait.
- `/komunitas/daftar`: **wajib login**. Form berisi data pengurus (nama, telepon, email), profil komunitas (nama, deskripsi, wilayah, fokus), kanal komunikasi, Instagram/website, dan unggah logo. **Tidak ada unggahan KTP/selfie** di alur komunitas.
- Pengajuan membuat komunitas `PENDING` + `verification_requests` tipe `COMMUNITY`. Admin memverifikasi lewat `/admin/komunitas`.

## 5. Fitur 3: Volunteer (Sisi Pengguna)

**Halaman awal volunteer** (`/volunteer`):

- Search dan filter kategori, lokasi, serta waktu.
- Tombol **“Jadi penyelenggara”** menuju `/volunteer/jadi-penyelenggara`.
- Kartu kegiatan menampilkan sampul, judul, tanggal, lokasi, penyelenggara, dan kuota peserta terkonfirmasi.
- Detail kegiatan dapat dibuka lewat dialog di halaman daftar atau halaman `/volunteer/[slug]`.

**Pendaftaran peserta:**

- Wajib login.
- Form berisi nama, email, telepon, dan kebutuhan aksesibilitas (opsional).
- Pendaftaran disimpan berstatus **PENDING**. Penyelenggara mengonfirmasi menjadi **CONFIRMED**; pengguna dapat membatalkan.
- Kuota dihitung dari pendaftaran `PENDING` + `CONFIRMED` saat menerima pendaftaran baru, sedangkan `registered_count` yang ditampilkan dihitung dari `CONFIRMED` lewat trigger.

**Pengajuan penyelenggara** (`/volunteer/jadi-penyelenggara`):

- Wajib login dan hanya untuk role `USER`.
- Form berisi nama organisasi, nama kontak, telepon, kota, provinsi, pengalaman, dan **dokumen pendukung** (JPG/PNG/WebP/PDF, maksimal 5 MB).
- Dokumen diunggah ke bucket privat `verification-docs`; pengajuan masuk ke `verification_requests` tipe `ORGANIZER`.
- Setelah disetujui admin, role berubah menjadi `ORGANIZER`. Halaman menampilkan status pengajuan (menunggu, disetujui, ditolak) dan CTA ke dashboard.

## 6. Fitur 3: Sisi Penyelenggara Volunteer

**Dashboard penyelenggara** (`/dashboard/kegiatan`):

- Guard: role `ORGANIZER` atau `ADMIN`.
- Tombol **“Buat kegiatan”**.
- Daftar kegiatan milik sendiri (admin melihat semua) dengan status: Draft, Menunggu tinjauan, Terbit, Ditutup, Ditolak, atau Diarsipkan.
- Aksi: edit, ajukan penerbitan, tutup kegiatan, arsipkan kegiatan.

**Form kegiatan** (`/dashboard/kegiatan/baru` dan `[id]/edit`):

- Judul, deskripsi, kategori, nama lokasi, alamat, kota, provinsi, jadwal mulai/selesai, persyaratan, catatan aksesibilitas, kuota, dan cover.
- Dapat disimpan sebagai `DRAFT` atau langsung diajukan (`PENDING`).
- Penerbitan hanya dilakukan admin. Setelah diajukan, status menjadi **menunggu tinjauan**.

**Pendaftar** (`/dashboard/kegiatan/[id]/pendaftar`):

- Tabel pendaftar dengan status dan kebutuhan aksesibilitas.
- Aksi konfirmasi/batalkan sesuai aturan transisi.
- Tombol **export xlsx** lewat route `/dashboard/kegiatan/[id]/pendaftar/export`.

## 7. Administrator (Dashboard Admin)

**Login admin** (`/admin/masuk`): khusus akun dengan role `ADMIN`; akun non-admin langsung ditolak dan sesinya diakhiri.

**Dashboard admin** (`/admin`):

- Ringkasan jumlah komunitas menunggu, penyelenggara menunggu, kegiatan menunggu, komunitas terverifikasi, dan total profil.
- Navigasi: Ringkasan, Komunitas, Penyelenggara, Kegiatan.

**Halaman admin:**

- `/admin/komunitas`: daftar komunitas `PENDING`, detail pengajuan, tombol setujui/tolak dengan catatan.
- `/admin/penyelenggara`: daftar pengajuan `ORGANIZER` `PENDING`, dokumen verifikasi via signed URL, tombol setujui/tolak.
- `/admin/kegiatan`: daftar kegiatan `PENDING`, detail, dan aksi terbitkan/tolak dengan catatan.

Belum ada halaman admin untuk moderasi tempat atau laporan konten.

---

## Alur Utama Saat Ini

1. Landing page → Jelajahi → feed postingan → detail tempat → navigasi GPS.
2. Tambah Info (login) → isi rating, fasilitas, foto, titik lokasi → posting tayang (moderasi AI default mati).
3. Navbar → Komunitas → cari/filter → profil → gabung lewat tautan eksternal.
4. Komunitas baru → form (login) → verifikasi admin → tampil di direktori.
5. Volunteer → pilih kegiatan → login → daftar → penyelenggara konfirmasi.
6. Pengajuan penyelenggara → verifikasi admin → dashboard → buat kegiatan → ajukan → admin terbitkan → peserta mendaftar.
7. Perubahan/arsip kegiatan → notifikasi in-app ke peserta aktif.

## Ringkasan Perbedaan dari Sketsa Awal

| Sketsa awal | Implementasi saat ini |
|---|---|
| Halaman profil lengkap | `/profil`: edit nama/bio, postingan sendiri, pendaftaran volunteer |
| Ulasan dan rating opsional setelah posting | Rating pemosting wajib 1–5; ulasan tidak dipakai |
| Pemilihan pintu masuk | Satu postingan = satu lokasi; navigasi ke koordinat tempat |
| Form komunitas meminta KTP | Form komunitas meminta data pengurus + logo; KTP hanya untuk pengajuan penyelenggara |
| Volunteer langsung bergabung | Pendaftaran `PENDING`, dikonfirmasi penyelenggara |
| Dashboard “Admin Volunteer” | Dashboard penyelenggara `/dashboard/kegiatan` + dashboard admin global `/admin` |
| Admin memeriksa KTP pada detail penyelenggara | Admin membuka dokumen via signed URL dan menyetujui/menolak pengajuan |
