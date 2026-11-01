# Rangkul

**Platform aksesibilitas, komunitas, dan volunteer untuk penyandang disabilitas di Indonesia.**

Rangkul adalah aplikasi web berbasis komunitas yang menyatukan **informasi aksesibilitas tempat umum**, **direktori komunitas disabilitas**, dan **kegiatan volunteer inklusif** dalam satu tempat. Data tempat dikumpulkan lewat kontribusi pengguna, diperiksa moderasi AI, dan diverifikasi admin untuk komunitas serta penyelenggara kegiatan.

Status saat ini: **MVP** yang siap didemonstrasikan dan diuji pengguna.

---

## Masalah yang Diselesaikan

1. **Informasi aksesibilitas sulit ditemukan.** Penyandang disabilitas sering baru tahu sebuah tempat tidak punya ramp, lift, atau toilet aksesibel setelah tiba di lokasi.
2. **Komunitas disabilitas tersebar dan sulit dijangkau.** Info komunitas ada di banyak platform dan jaringan personal, sehingga sulit ditemukan.
3. **Relawan sulit menemukan kegiatan yang tepat.** Tidak ada satu tempat untuk melihat kegiatan yang benar-benar membutuhkan tenaga mereka.

Rangkul menjawab ketiganya dengan satu alur: **tahu medan → temukan komunitas → ambil aksi**.

## Target Pengguna

| Pengguna | Kebutuhan | Yang didapat |
|---|---|---|
| **Penyandang disabilitas** | Info tempat yang bisa diakses, komunitas, kegiatan sosial | Bisa merencanakan aktivitas dengan lebih percaya diri |
| **Keluarga & pendamping** | Membantu mencari destinasi, fasilitas, dan komunitas | Info aksesibilitas dan komunitas lebih mudah ditemukan |
| **Volunteer & masyarakat umum** | Berkontribusi atau mengadakan kegiatan sosial | Publikasi kegiatan lebih luas; pendaftaran dan data peserta lebih mudah dikelola |
| **Komunitas & organisasi disabilitas** | Memperkenalkan komunitas | Visibilitas lebih besar, peluang mendapat anggota, relawan, dan kolaborator |

## Fitur Utama

### 1. Jelajahi — informasi & navigasi tempat ramah disabilitas

- Feed postingan dengan **satu postingan mewakili satu lokasi** dan satu titik peta.
- Kategori: **Wisata, Kuliner, Transportasi, Ibadah, Fasilitas Umum, Fasilitas Kesehatan, dan Lainnya**.
- Setiap postingan memuat cerita pengalaman, **rating pemosting** 1–5, dan **fasilitas disabilitas**: ramp, lift, toilet aksesibel, guiding block, parkir aksesibel, pintu otomatis, dan pintu lebar.
- Pencarian dan filter kategori; badge **“Ramah Disabilitas”** untuk rating ≥ 4.
- **Navigasi live** dari **GPS perangkat** ke titik lokasi: garis rute, jarak, estimasi waktu, petunjuk arah teks, dan panduan suara opsional.
- Kontribusi baru melewati validasi server dan **moderasi AI** sebelum tayang.

### 2. Komunitas — direktori komunitas disabilitas & inklusif

- Direktori komunitas dari berbagai daerah, dengan pencarian dan filter wilayah/fokus kegiatan.
- Hanya komunitas **terverifikasi** yang tampil publik.
- Profil komunitas: deskripsi, wilayah, kontak, media sosial, tautan gabung, logo, dan kegiatan terkait.
- Pengurus dapat mendaftarkan komunitasnya; admin memverifikasi sebelum komunitas tayang.

### 3. Volunteer — kegiatan inklusif

- Daftar kegiatan yang masih berjalan, dengan pencarian dan filter kategori/lokasi/waktu.
- Pengguna login dapat mendaftar; status pendaftaran **PENDING** sampai dikonfirmasi penyelenggara, dan bisa dibatalkan sendiri.
- Calon penyelenggara mengajukan verifikasi (data organisasi, kontak, pengalaman, dokumen pendukung).
- Penyelenggara terverifikasi mendapat dashboard untuk mengelola kegiatan, melihat pendaftar, dan **mengekspor data pendaftar ke Excel**.
- Pembatalan kegiatan membatalkan pendaftaran aktif dan mengirim **notifikasi in-app** ke peserta; perubahan detail kegiatan terbit juga diberitahukan ke peserta aktif.

### 4. Admin

- Verifikasi komunitas dan penyelenggara kegiatan, termasuk pencabutan verifikasi.
- Moderasi kegiatan sebelum tayang serta penghapusan kegiatan yang melanggar.
- Antrean moderasi tempat: postingan yang ditahan AI dapat diterbitkan atau ditolak.
- Penghapusan konten yang melanggar.

### 5. Akun & profil

- Registrasi dan login email lewat Supabase Auth, termasuk konfirmasi email dan login admin terpisah.
- Profil pengguna: nama, bio, riwayat postingan, dan pendaftaran volunteer.
- Notifikasi in-app (lonceng navbar).

**Aksesibilitas adalah fitur, bukan tambahan:** antarmuka dirancang mengikuti WCAG 2.2 AA — kontras teruji, navigasi keyboard, label jelas, target sentuh 44px, dan peta selalu punya alternatif teks.

## AI Use

Rangkul memakai AI untuk **satu hal saja: moderasi postingan tempat**. Tidak ada fitur generatif yang menghadap pengguna.

**Alur moderasi**

1. Pengguna mengirim postingan tempat (nama, kategori, deskripsi).
2. Server memanggil Gemini `generateContent` dengan skema JSON, sebelum data disimpan.
3. Model mengembalikan salah satu keputusan:
   - `SAFE` → postingan langsung tayang.
   - `REVIEW` → postingan ditahan dan masuk antrean admin.
   - `BLOCK` → postingan ditolak.
4. Admin dapat menerbitkan atau menolak postingan yang ditahan.

**Prinsip**

- **Fail-closed:** API key kosong, timeout (20 detik), error HTTP, atau respons tidak valid selalu berujung penahanan postingan. Tidak ada konten yang lolos tanpa penilaian saat moderasi aktif.
- **Batas input:** hanya nama tempat, kategori, dan deskripsi (dipotong 4.000 karakter). Foto dan data pribadi pengguna tidak dikirim ke model.
- **Prompt-injection aware:** instruksi di dalam teks pengguna diperlakukan sebagai data, bukan perintah.
- **Tanpa alasan mentah:** alasan moderasi tidak pernah ditampilkan ke pengguna.
- **Bukan pengganti manusia:** komunitas dan kegiatan tetap diverifikasi/dimoderasi admin, bukan AI.
- **Bisa dimatikan:** moderasi aktif secara default dan dapat dinonaktifkan lewat konfigurasi server, sehingga postingan langsung tayang tanpa memanggil model.

## Third-Party Declaration

### Layanan eksternal

| Layanan | Dipakai untuk | Catatan |
|---|---|---|
| **Supabase** (Postgres, Auth, Storage) | Database, autentikasi, penyimpanan gambar & dokumen | Akun pengguna (email, nama), konten, dan file tersimpan di infrastruktur Supabase |
| **Google Gemini API** | Moderasi teks postingan tempat | Hanya teks nama/kategori/deskripsi yang dikirim; tunduk pada Google APIs Terms of Service |
| **OpenStreetMap tile server** | Gambar peta | Data peta © kontributor OpenStreetMap, lisensi ODbL; atribusi ditampilkan di peta |
| **OSRM** | Perhitungan rute | Server demo tanpa SLA; koordinat awal & tujuan dikirim dari browser untuk menghitung rute |

### Pustaka open source

| Pustaka | Lisensi | Dipakai untuk |
|---|---|---|
| Next.js, React, React DOM | MIT | Framework & UI runtime |
| Tailwind CSS | MIT | Styling |
| Prisma | Apache-2.0 | ORM & migrasi database |
| `@supabase/supabase-js`, `@supabase/ssr` | MIT | Klien Supabase & sesi cookie |
| Leaflet | BSD-2-Clause | Peta interaktif |
| React Leaflet, `@react-leaflet/core` | MIT | Binding React untuk Leaflet |
| Zod | MIT | Validasi skema |
| ExcelJS | MIT | Ekspor Excel |
| `server-only` | MIT | Penjaga modul server |
| Lexend, Plus Jakarta Sans, JetBrains Mono | SIL Open Font License 1.1 | Tipografi, di-self-host lewat `next/font` |

### Aset & ikon

- Ikon antarmuka digambar sendiri sebagai SVG (tanpa pustaka ikon eksternal).
- Tidak ada aset berbayar atau foto stok; semua layanan eksternal yang dipakai tercantum di tabel di atas.

Dokumentasi produk, arsitektur, basis data, dan design system ada di folder [`docs/`](docs/).
