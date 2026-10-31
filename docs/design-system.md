# Deskripsi Sketsa Wireframe Platform

Dokumen ini menerjemahkan sketsa Excalidraw (`Untitled-2026-10-30-2329.excalidraw`) ke dalam bentuk teks. Sketsa berupa wireframe platform web yang menghubungkan pengguna dengan tempat/acara, komunitas, dan volunteer.

> Catatan: beberapa coretan tangan (panah dan garis bebas) ditafsirkan dari posisinya, jadi sebagian alur perlu dikonfirmasi.

---

## 1. Landing Page (sebelum login)

- **Navbar:** Nama web, tentang, komunitas, volunteer, tombol login.
- **Hero:** teks "HERO LANDING PAGE" dengan tombol CTA **"Jelajahi Tempat"**. Tombol ini punya panah menuju beranda.
- **Bagian tengah:** "ngoberan fitur", penjelasan fitur-fitur platform.
- **Footer.**
- Catatan: "landing page jelasin platform", dan ada catatan kecil "fungsi disini".
- Penanda alur **"blm login"** dan **"udah login"** menunjukkan kondisi navbar sebelum dan sesudah login.

## 2. Halaman Profil

- Foto profil
- Nama lengkap
- Username
- Email
- No telp
- Alamat
- Bio

## 3. Fitur 1: Beranda

- **Navbar:** Nama web, beranda, placeholder, komunitas, volunteer, ikon avatar. Ada tombol bulat "+".
- Search bar dan filter kategori.
- Daftar **postingan** berupa kartu-kartu.

**Card postingan**
- Foto tempat, lokasi, sender, detail deskripsi.
- Tombol **"navigasi"**.

**Detail postingan**
- Foto tempat, lokasi, sender, detail deskripsi.
- Tombol "navigasi" menuju halaman Maps.

**Halaman Maps**
- Peta besar.
- Tombol **"Arah"**.
- Opsi **"Suara"** dengan pilihan "tanpa" atau "Pakai".
- **"Fitur lainnya"**.

## 4. Fitur 2: Halaman Awal Komunitas

- Navbar sama seperti beranda.
- Judul "komunitas" dan tombol **"daftarin komunitas lu"**.
- Search dan filter wilayah.
- Grid kartu komunitas (sampul + tombol "bergabung").
- Catatan: *bergabung komunitas bisa langsung tanpa daftar/login web*.

**Card komunitas**
- Sampul, lokasi, sender, detail deskripsi.
- Tombol "navigasi" dan "bergabung".

**Form pendaftaran penyelenggara komunitas**
- Nama, no telp, email
- Nama komunitas, deskripsi, lokasi
- Foto KTP
- Grup WA/saluran
- Sampul (upload foto)
- Tombol **"selenggarakan"**

## 5. Fitur 3: Volunteer (sisi user)

**Halaman awal volunteer**
- Navbar, search, filter kategori.
- Tombol **"Jadi penyelenggara"**.
- Tiga "card volunteer".

**Card volunteer**
- Sampul, lokasi, nama acara, tanggal, penyelenggara.
- Kuota (contoh "62/80").
- Tombol "bergabung".

**Detail acara volunteer**
- Carousel foto
- Lokasi, sender, detail deskripsi
- Info-info tambahan
- Tombol "Bergabung"

**Form pendaftaran peserta volunteer**
- Nama, no telp, email
- Tombol "daftar"

**Form pendaftaran penyelenggara volunteer**
- Nama, no telp, email
- Foto KTP
- Selfie KTP
- Tombol "Jadi penyelenggara"

## 6. Fitur 3: Sisi Penyelenggara Volunteer

(di luar frame "user")

**Dashboard "Admin Volunteer"**
- Tombol **"tambah acara +"**.
- Daftar acara (acara a, acara b). Klik acara membuka halaman detail.

**Detail acara (admin volunteer)**
- Input gambar ("+")
- Lokasi, detail deskripsi
- List pendaftar dengan tombol **"export xlsx"**
- Tombol **"hapus acara"**

**Form pengadaan acara**
- Nama, no telp, email
- Nama acara, deskripsi acara, lokasi
- Sampul (up foto)
- Tombol **"selenggarakan"**

## 7. Administrator (dashboard admin)

- **Header "admin":** search bar dan filter kategori.
- **Daftar penyelenggara** (contoh "penyelenggara 1") dengan tombol **Cek**, **Setujui**, **Tolak**.
- Status: "Penyelenggara telah disetujui……" dan "Penyelenggara dibatalkan……".
- Panel dua kolom: **"di setujui"** (kiri) dan **"dibatalkan"** (kanan).

**Detail penyelenggara** (dibuka lewat tombol Cek)
- Sampul/logo, nama acara
- Nama, email, no telp
- Foto KTP

---

## Alur Utama

1. Landing page → "Jelajahi" → Beranda (Fitur 1).
2. Beranda → detail postingan → Maps/navigasi.
3. Navbar → Komunitas (Fitur 2) → bergabung langsung atau daftarkan komunitas sendiri.
4. Navbar → Volunteer (Fitur 3) → daftar jadi peserta atau jadi penyelenggara.
5. Pendaftaran penyelenggara → dicek admin (Cek/Setujui/Tolak) → penyelenggara yang disetujui mengelola acara lewat dashboard.
