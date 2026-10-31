# Rangkul

**Membantu Sesama, Ruang untuk Semua**

> **Status:** menggambarkan implementasi MVP saat ini (31 Oktober 2026)
> **Dokumen teknis:** [`docs/architecture.md`](./architecture.md) · **Skema data:** [`docs/database.md`](./database.md)

Rangkul adalah platform web berbasis komunitas yang menyatukan tiga hal dalam satu tempat: informasi aksesibilitas tempat umum, direktori komunitas disabilitas, dan kegiatan volunteer inklusif.

---

## 1. Masalah yang Ingin Diselesaikan

**Informasi aksesibilitas tempat sulit ditemukan.**
Penyandang disabilitas sering tidak tahu apakah sebuah tempat punya ramp, lift, toilet aksesibel, guiding block, atau parkir khusus. Informasi ini jarang lengkap dan tidak mudah dicari di platform yang umum dipakai. Akibatnya, mereka baru tahu kondisi sebenarnya setelah sampai di lokasi.

**Komunitas disabilitas tersebar dan sulit dijangkau.**
Info komunitas ada di banyak platform dan jaringan personal. Penyandang disabilitas, keluarga, maupun masyarakat yang ingin ikut berkontribusi kesulitan menemukannya.

**Relawan sulit menemukan komunitas yang butuh bantuan.**
Orang yang ingin jadi volunteer tidak punya satu tempat untuk melihat kegiatan yang benar-benar membutuhkan tenaga mereka.

## 2. Ide Utama

Satu platform yang menghubungkan **informasi, komunitas, dan aksi sosial**:

1. Pengguna tahu tempat mana yang bisa diakses sebelum berangkat.
2. Pengguna bisa menemukan komunitas yang sesuai dengan kebutuhan dan minatnya.
3. Siapa pun bisa berkontribusi lewat kegiatan volunteer, termasuk membantu mendata aksesibilitas tempat.

Data aksesibilitas dikumpulkan lewat **kontribusi pengguna** (crowdsourcing), bukan dari satu sumber resmi.

## 3. Fitur Utama

### A. Informasi & Navigasi Tempat Ramah Disabilitas

Pengguna bisa mencari dan menambahkan info aksesibilitas tempat umum. Feed **Jelajahi** menampilkan satu kartu per postingan; satu postingan mewakili satu lokasi dengan satu titik peta.

Kategori yang tersedia: **Wisata, Kuliner, Transportasi, Ibadah, Fasilitas Umum, Fasilitas Kesehatan, dan Lainnya**.

**Membuat postingan** (wajib login, lewat `/tambah-info`):

- Nama tempat, kategori, dan cerita pengalaman aksesibilitas (minimal 40 karakter).
- **Rating pemosting** 1–5 bintang. Rating ini wajib diisi dan menggambarkan penilaian pengunggah, bukan rata-rata ulasan pengguna lain.
- **Fasilitas disabilitas** berupa checkbox: ramp, lift, toilet aksesibel, guiding block, parkir aksesibel, pintu otomatis, dan pintu lebar. Fasilitas boleh dikosongkan bila belum terverifikasi.
- Minimal satu foto (maksimal 4 foto, JPG/PNG/WebP, maksimal 5 MB per foto).
- Titik lokasi di peta atau koordinat manual.

**Melihat postingan:**

- Feed `/jelajahi` selalu diurutkan dari jumlah **“Paling membantu”** terbanyak, lalu postingan terbaru. Pencarian dan filter kategori dilakukan di sisi klien tanpa mengubah urutan tersebut.
- Kartu menampilkan foto sampul, kategori, lokasi, ringkasan, jumlah like, dan fasilitas yang tercatat.
- Detail tempat menampilkan carousel foto, rating pemosting, badge **“Ramah Disabilitas”** bila rating ≥ 4, fasilitas yang tercatat, peta lokasi, dan tombol menuju navigasi.
- Tidak ada lagi halaman atau form ulasan pengguna. Rating komunitas digantikan rating pemosting.
- Tidak ada pemilihan pintu masuk. Navigasi langsung menuju koordinat lokasi.

**Navigasi** (`/jelajahi/[slug]/navigasi`):

- Rute pejalan kaki dihitung dari **lokasi perangkat** (GPS) ke titik lokasi.
- Peta Leaflet, garis rute, petunjuk arah teks, estimasi jarak/waktu, dan panduan suara opsional.
- Bila izin lokasi ditolak atau GPS gagal, pengguna mendapat pesan dan tombol coba lagi; rute tidak digambar dengan titik karangan.

### B. Direktori Komunitas Inklusif

Direktori komunitas disabilitas dan komunitas inklusif di berbagai daerah Indonesia.

- Hanya komunitas berstatus **VERIFIED** yang tampil publik.
- Pencarian berdasarkan kata kunci, wilayah, dan fokus kegiatan. Filter berjalan di sisi klien dan disimpan di URL (`q`, `wilayah`, `fokus`).
- Tiap komunitas punya profil: nama, deskripsi, wilayah, kontak, media sosial, tautan gabung, logo, dan kegiatan terkait.
- Pengurus komunitas mendaftarkan komunitasnya lewat `/komunitas/daftar` (wajib login). Pengajuan membuat baris `communities` berstatus `PENDING` dan `verification_requests` tipe `COMMUNITY`.
- Admin memverifikasi lewat `/admin/komunitas`. Setelah disetujui, komunitas tampil di direktori.

### C. Volunteer Inklusif

Menghubungkan orang yang ingin berkontribusi dengan penyelenggara yang butuh bantuan.

- Jenis kegiatan: pendampingan acara, pendataan aksesibilitas, kegiatan sosial, program inklusif, dan lainnya.
- Halaman `/volunteer` menampilkan kegiatan `PUBLISHED` yang belum berakhir. Pencarian dan filter kategori/lokasi/waktu berjalan di sisi klien; detail kegiatan dapat dibuka lewat dialog atau halaman `/volunteer/[slug]`.
- Pengguna yang login dapat mendaftar sebagai volunteer. Pendaftaran berstatus **PENDING** sampai dikonfirmasi penyelenggara; pengguna dapat membatalkan pendaftaran.
- Calon penyelenggara mengajukan verifikasi lewat `/volunteer/jadi-penyelenggara` dengan data organisasi, kontak, pengalaman, dan dokumen pendukung. Pengajuan masuk ke `verification_requests` tipe `ORGANIZER`.
- Setelah disetujui admin, akun berrole **ORGANIZER** dapat membuat kegiatan lewat dashboard (`/dashboard/kegiatan`), mengajukan penerbitan ke admin, menutup kegiatan, membatalkan kegiatan, mengarsipkan kegiatan, melihat pendaftar, dan mengekspor data pendaftar ke Excel.
- Pembatalan kegiatan mengubah status menjadi **CANCELLED**, membatalkan pendaftaran aktif, dan mengirim **notifikasi pembatalan** ke peserta.
- Kegiatan berstatus **CANCELLED** dapat dihapus permanen oleh penyelenggara; kegiatan dengan status lain tidak dapat dihapus.
- Perubahan detail kegiatan yang sudah terbit mengirim **notifikasi in-app** ke peserta aktif.
- Kegiatan yang diarsipkan juga mengirim notifikasi ke peserta.
- Saat penyelenggara mengonfirmasi pendaftaran, peserta menerima **notifikasi konfirmasi** di menu lonceng navbar.

Ketiga fitur saling terhubung: pengguna yang mencari tempat juga bisa menemukan komunitas dan kegiatan, dan volunteer bisa membantu memperkaya data tempat.

## 4. Siapa Penggunanya

| Pengguna | Kebutuhan | Yang didapat |
|---|---|---|
| Penyandang disabilitas | Info tempat, komunitas, kegiatan sosial | Bisa merencanakan aktivitas dengan lebih percaya diri |
| Keluarga & pendamping | Bantu cari destinasi, fasilitas, dan komunitas | Info aksesibilitas dan komunitas lebih mudah ditemukan |
| Volunteer, penyelenggara & masyarakat umum | Berkontribusi atau mengadakan kegiatan sosial | Publikasi kegiatan lebih luas, pendaftaran dan data peserta lebih mudah dikelola |
| Komunitas & organisasi disabilitas | Memperkenalkan komunitas | Visibilitas lebih besar, peluang dapat anggota, relawan, dan kolaborator |

## 5. Alur Pengguna Singkat

**Cari tempat:** buka Jelajahi, cari atau filter kategori, buka detail, lihat rating pemosting dan fasilitas, lalu mulai navigasi dari lokasi perangkat.

**Tambah info tempat:** masuk, buka Tambah Info, isi nama/kategori/cerita, pilih rating 1–5, centang fasilitas yang tersedia, unggah 1–4 foto (ambil langsung dari kamera atau pilih dari perangkat), tandai titik lokasi, lalu kirim. Postingan langsung tayang bila moderasi AI dimatikan.

**Cari komunitas:** buka Direktori Komunitas, cari atau filter wilayah/fokus, buka profil, lalu hubungi atau gabung lewat tautan yang tersedia.

**Daftarkan komunitas:** masuk, isi formulir dan unggah logo, tunggu verifikasi admin, lalu komunitas tampil di direktori.

**Jadi volunteer:** buka Volunteer, pilih kegiatan, masuk bila belum, isi data pendaftaran, lalu tunggu konfirmasi penyelenggara.

**Jadi penyelenggara:** buka “Jadi penyelenggara”, masuk, kirim pengajuan beserta dokumen, tunggu verifikasi admin, lalu kelola kegiatan lewat dashboard.

## 6. Kepercayaan & Keamanan

Karena kontennya dari pengguna, platform menjaga kualitas dan keamanan lewat:

- **Moderasi AI** untuk postingan Jelajahi memakai Gemini. **Aktif secara default** (`AI_MODERATION_ENABLED=true`), sehingga `SAFE` tayang, `REVIEW` ditahan sebagai `PENDING` untuk diputuskan admin di `/admin/tempat`, `BLOCK` ditolak, dan kegagalan moderasi selalu ditahan (`PENDING`).
- **Hapus postingan**: pemilik dapat menghapus postingannya dari halaman profil; admin dapat menghapus postingan dari `/admin/tempat`.
- **Verifikasi admin** untuk komunitas dan penyelenggara kegiatan.
- **Moderasi kegiatan** oleh admin sebelum kegiatan tampil publik.
- **Notifikasi in-app** untuk perubahan atau pengarsipan kegiatan yang diikuti, serta konfirmasi pendaftaran volunteer.
- **Otorisasi di server** untuk semua mutasi; role dibaca dari database, bukan dari client.

Belum tersedia: mekanisme laporan konten (report), antrean moderasi tempat di dashboard admin, dan rate limiting submission.

## 7. Prinsip Produk

- **Aksesibel sejak awal:** antarmuka sendiri harus ramah penyandang disabilitas (kontras, navigasi keyboard, label jelas, responsif).
- **Detail lebih berguna daripada rating umum:** fasilitas spesifik dan titik lokasi lebih berharga daripada sekadar bintang. Rating pemosting tetap ditampilkan sebagai konteks, bukan pengganti detail.
- **Dibangun bersama komunitas:** data dan kegiatan tumbuh dari kontribusi pengguna dan komunitas.
- **Sederhana dulu:** fokus pada tiga fitur inti, bukan semua hal sekaligus.

## 8. Cakupan MVP

Halaman yang tersedia:

1. **Beranda** (`/`): penjelasan platform dan jalan pintas ke tiga fitur.
2. **Jelajahi** (`/jelajahi`): feed postingan dengan pencarian, filter kategori, dan like.
3. **Detail tempat** (`/jelajahi/[slug]`): foto, rating pemosting, badge ramah disabilitas, fasilitas, peta, dan tautan navigasi.
4. **Navigasi** (`/jelajahi/[slug]/navigasi`): rute pejalan kaki dari lokasi perangkat.
5. **Tambah Info** (`/tambah-info`): form posting tempat bertahap.
6. **Komunitas** (`/komunitas`, `/komunitas/[slug]`, `/komunitas/daftar`): direktori, profil, dan pendaftaran komunitas.
7. **Volunteer** (`/volunteer`, `/volunteer/[slug]`, `/volunteer/jadi-penyelenggara`): daftar kegiatan, detail, pendaftaran peserta, dan pengajuan penyelenggara.
8. **Dashboard penyelenggara** (`/dashboard/kegiatan`): CRUD kegiatan, pendaftar, dan ekspor Excel.
9. **Dashboard admin** (`/admin`, `/admin/komunitas`, `/admin/penyelenggara`, `/admin/kegiatan`): verifikasi komunitas/penyelenggara dan moderasi kegiatan.
10. **Profil** (`/profil`): edit nama/bio, riwayat postingan, dan pendaftaran volunteer pengguna.
11. **Auth** (`/masuk`, `/daftar`, `/admin/masuk`, `/auth/callback`): login, registrasi, konfirmasi email, dan login admin.

Dilengkapi desain responsif, navigasi keyboard, dan notifikasi in-app.

## 9. Pengembangan Lanjutan (Setelah MVP)

- Menyempurnakan produk berdasarkan masukan pengguna dan perwakilan komunitas.
- Memperluas data tempat dan komunitas.
- Menambahkan mekanisme laporan konten dan antrean moderasi tempat di dashboard admin.
- Memperkuat verifikasi informasi dan moderasi konten.
- Menjajaki kolaborasi dengan komunitas disabilitas dan organisasi terkait.

**Target akhir:** MVP Rangkul yang bisa didemonstrasikan di kompetisi, diuji oleh pengguna, dan dikembangkan berdasarkan kebutuhan nyata penyandang disabilitas.
