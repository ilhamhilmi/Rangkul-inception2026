# Integrasi Modul Volunteer dengan Dashboard Admin Global

Dokumen ini adalah catatan untuk pemilik dashboard admin global. Modul
Volunteer **tidak membuat dashboard admin baru** dan tidak mengubah kode
dashboard admin. Semua perubahan di bawah ini harus diimplementasikan oleh
pemilik fitur admin global.

## 1. Persetujuan pengajuan penyelenggara

Modul Volunteer menulis pengajuan ke tabel bersama `verification_requests`:

- `type = 'ORGANIZER'`
- `status = 'PENDING'`
- `document_url` = path file di bucket privat `verification-docs`
  (contoh: `organizer/<user_id>/<uuid>.pdf`), **bukan** data KTP/selfie di
  dalam `payload`.
- `payload` hanya berisi data teks: `organizationName`, `contactName`,
  `phone`, `city`, `province`, `experience`.

Dashboard admin perlu:

1. Menampilkan pengajuan `type = 'ORGANIZER'` dengan `status = 'PENDING'`.
2. Membuka dokumen verifikasi lewat signed URL server-side. Helper tersedia:
   `createVerificationDocumentSignedUrl(path, expiresInSeconds)` di
   `lib/supabase/storage.ts`. Panggil hanya setelah guard `requireAdmin()` /
   `getAuthorizedProfile(["ADMIN"])` lolos.
3. Saat menyetujui, dalam satu transaksi:
   - `verification_requests.status = 'APPROVED'`
   - `reviewer_id` = id admin
   - `reviewed_at = now()`
   - `profiles.role = 'ORGANIZER'` untuk `user_id` pengajuan
4. Saat menolak:
   - `verification_requests.status = 'REJECTED'`
   - `reviewer_id`, `reviewed_at`, dan `review_note` diisi.
   - Role profil **tidak** diubah.

Modul Volunteer hanya membaca `profiles.role` dan status pengajuan terbaru;
tidak ada aksi admin yang diduplikasi di modul ini.

## 2. Penerbitan dan penolakan kegiatan volunteer

Kegiatan dibuat penyelenggara dengan status `DRAFT` atau `PENDING`.
`published_at` hanya boleh diisi admin.

Modul Volunteer sudah menyediakan Server Action untuk dipakai dashboard admin:

```ts
import { adminModerateEventAction } from "@/lib/volunteer/actions";

// formData: { eventId: string, status: "PUBLISHED" | "REJECTED" | "PENDING" }
```

Aturan transisi yang sudah divalidasi action tersebut:

- `PENDING` → `PUBLISHED` (mengisi `published_at` bila masih kosong)
- `PENDING` atau `PUBLISHED` → `REJECTED`
- Status lain ditolak dengan hasil `INVALID_STATUS`

Dashboard admin cukup menambahkan daftar kegiatan berstatus `PENDING` dan
tombol aksi yang memanggil action di atas. Jangan mengubah status kegiatan
langsung dari client atau menulis `registered_count`.

## 3. Data dan query yang dipakai modul Volunteer

- Publik: `volunteer_events` dengan `status = 'PUBLISHED'` dan
  `archived_at IS NULL`.
- Dashboard penyelenggara: kegiatan milik `organizer_id` sendiri, atau semua
  kegiatan bila role `ADMIN`.
- Ekspor peserta: hanya pemilik kegiatan atau `ADMIN`, lewat route
  `/dashboard/kegiatan/[id]/pendaftar/export`.
- `registered_count` dipelihara trigger database dari pendaftaran berstatus
  `CONFIRMED`. Jangan menulis kolom ini secara manual.

## 4. Temuan keamanan tabel bersama (belum diperbaiki)

Sesuai batas tugas, modul Volunteer tidak mengubah policy tabel bersama.
Temuan berikut perlu ditangani pemilik fitur bersama:

- `profiles_select_authenticated USING (true)` membuka seluruh email pengguna.
- `profiles_update_own` / `profiles_insert_own` memungkinkan eskalasi role
  (`role = 'ADMIN'`) dari Supabase client.
- `communities_update_own` memungkinkan self-verification komunitas.

Mitigasi sementara: semua mutasi Volunteer berjalan lewat Server Action dengan
Prisma dan guard server, bukan dari Supabase client. Role selalu dibaca ulang
dari database di server, tidak pernah dari input client.

## 5. Checklist sebelum rilis

- [ ] Migration Volunteer (`20261101121000`–`20261101121400`) diterapkan ke
      database staging oleh pemilik database.
- [ ] Bucket `event-covers` (publik) dan `verification-docs` (privat) tersedia
      beserta policy storage-nya.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` hanya tersedia di environment server.
- [ ] Dashboard admin menangani pengajuan `ORGANIZER` dan moderasi kegiatan
      `PENDING` sesuai bagian 1 dan 2.
- [ ] Policy tabel bersama ditinjau ulang oleh pemilik fitur bersama.
