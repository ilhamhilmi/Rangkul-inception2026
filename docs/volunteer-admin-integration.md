# Integrasi Modul Volunteer dengan Dashboard Admin Global

> **Status:** sudah diimplementasikan. Migration Volunteer sudah diterapkan dan dashboard admin di `/admin` sudah menangani pengajuan komunitas, penyelenggara, dan moderasi kegiatan.
> **Terakhir diperbarui:** 31 Oktober 2026

Dokumen ini menjelaskan titik integrasi antara modul Volunteer dan dashboard admin global. Modul Volunteer tidak membuat dashboard admin terpisah; seluruh keputusan admin dilakukan di route `/admin`.

## 1. Persetujuan pengajuan penyelenggara

Modul Volunteer menulis pengajuan ke tabel bersama `verification_requests`:

- `type = 'ORGANIZER'`
- `status = 'PENDING'`
- `document_url` = path file di bucket privat `verification-docs` (contoh: `organizer/<user_id>/<uuid>.pdf`), **bukan** data KTP/selfie di dalam `payload`.
- `payload` hanya berisi data teks: `organizationName`, `contactName`, `phone`, `city`, `province`, `experience`.

Implementasi saat ini:

1. `/admin/penyelenggara` menampilkan pengajuan `ORGANIZER` dengan status `PENDING` melalui `getPendingOrganizerApplications()` di `server/admin/queries.ts`.
2. Dokumen dibuka lewat signed URL server-side memakai `createVerificationDocumentSignedUrl(path, expiresInSeconds)` di `lib/supabase/storage.ts`, setelah guard admin lolos.
3. Saat disetujui (`approveOrganizerAction`), dalam satu transaksi:
   - `verification_requests.status = 'APPROVED'`
   - `reviewer_id` = id admin
   - `reviewed_at = now()`
   - `profiles.role = 'ORGANIZER'` bila role saat ini bukan `ORGANIZER`/`ADMIN`
4. Saat ditolak (`rejectOrganizerAction`):
   - `verification_requests.status = 'REJECTED'`
   - `reviewer_id`, `reviewed_at`, dan `review_note` diisi.
   - Role profil **tidak** diubah.

Setelah keputusan, cache/path `/admin`, `/admin/penyelenggara`, `/volunteer`, `/volunteer/jadi-penyelenggara`, `/dashboard`, dan `/dashboard/kegiatan` direvalidasi.

## 2. Penerbitan dan penolakan kegiatan volunteer

Kegiatan dibuat penyelenggara sebagai `DRAFT` atau diajukan sebagai `PENDING`. `published_at` hanya diisi admin.

Server Action yang dipakai dashboard admin:

```ts
import { adminModerateEventAction } from "@/lib/volunteer/actions";

// formData: { eventId: string, status: "PUBLISHED" | "REJECTED" | "PENDING", note?: string }
```

Aturan transisi yang divalidasi action:

- `PENDING` → `PUBLISHED` (mengisi `published_at` bila masih kosong)
- `PENDING` atau `PUBLISHED` → `REJECTED` (wajib catatan minimal 3 karakter, maksimal 500)
- Status lain ditolak dengan hasil `INVALID_STATUS`

Dashboard admin menampilkan kegiatan `PENDING` di `/admin/kegiatan` melalui `getPendingVolunteerEvents()`. Komponen `EventReviewActions` memanggil action di atas. Jangan mengubah status kegiatan langsung dari client atau menulis `registered_count`.

## 3. Data dan query yang dipakai modul Volunteer

- Publik: `volunteer_events` dengan `status = 'PUBLISHED'`, `archived_at IS NULL`, dan `ends_at > now()` untuk pendaftaran.
- Dashboard penyelenggara: kegiatan milik `organizer_id` sendiri, atau semua kegiatan bila role `ADMIN`.
- Ekspor peserta: hanya pemilik kegiatan atau `ADMIN`, lewat route `/dashboard/kegiatan/[id]/pendaftar/export`.
- `registered_count` dipelihara trigger database dari pendaftaran berstatus `CONFIRMED`. Jangan menulis kolom ini secara manual.
- Kuota penerimaan pendaftaran dihitung dari pendaftaran `PENDING` + `CONFIRMED`; konfirmasi admin/penyelenggara tetap dibatasi `slots` dan dihitung ulang di dalam transaksi.

## 4. Notifikasi in-app

Tabel `notifications` sudah diterapkan dan dipakai untuk:

- `EVENT_UPDATED`: dikirim ke peserta `PENDING`/`CONFIRMED` saat penyelenggara mengubah detail kegiatan yang sudah `PUBLISHED`/`CLOSED`.
- `EVENT_ARCHIVED`: dikirim ke peserta `PENDING`/`CONFIRMED` saat kegiatan diarsipkan.

Notifikasi dibaca lewat `getNotificationsForUser()` dan ditampilkan di menu lonceng navbar. Pengguna dapat menandai satu atau semua notifikasi sebagai dibaca lewat `server/notifications/actions.ts`. RLS `notifications_select_own` / `notifications_update_own` membatasi akses ke pemiliknya.

## 5. Temuan keamanan tabel bersama (belum diperbaiki)

Modul Volunteer tidak mengubah policy tabel bersama. Temuan berikut masih perlu ditangani pemilik fitur bersama:

- `profiles_select_authenticated USING (true)` membuka seluruh email pengguna.
- `profiles_update_own` / `profiles_insert_own` memungkinkan eskalasi role (`role = 'ADMIN'`) dari Supabase client.
- `communities_update_own` memungkinkan self-verification komunitas.

Mitigasi sementara: semua mutasi Volunteer berjalan lewat Server Action dengan Prisma dan guard server, bukan dari Supabase client. Role selalu dibaca ulang dari database di server, tidak pernah dari input client.

## 6. Status migration dan checklist rilis

Migration Volunteer sudah diterapkan ke database bersama:

| Migrasi | Isi |
|---|---|
| `20261101121000_create_volunteer_enums` | `pg_trgm` (jika belum ada), `EventStatus`, `EventCategory`, `RegistrationStatus` |
| `20261101121100_create_volunteer_events` | tabel, check constraint, index, trigram, FK ke `profiles` |
| `20261101121200_create_event_registrations` | pendaftaran, unique `(event_id, user_id)` |
| `20261101121300_add_volunteer_triggers` | `updated_at` Volunteer, agregat `registered_count`, proteksi kegiatan/pendaftaran |
| `20261101121400_enable_volunteer_rls` | RLS dan grant khusus tabel Volunteer |
| `20261104100000_community_and_volunteer_storage` | bucket `community-logos`, `event-covers`, `verification-docs` + policy |
| `20261104110000_add_notifications_and_event_moderation` | `notifications`, `NotificationType`, `volunteer_events.moderation_note` |

Checklist:

- [x] Migration Volunteer dan migration notifikasi/storage diterapkan ke database bersama.
- [x] Bucket `event-covers` (publik) dan `verification-docs` (privat) tersedia beserta policy storage.
- [x] `SUPABASE_SERVICE_ROLE_KEY` hanya tersedia di environment server.
- [x] Dashboard admin menangani pengajuan `ORGANIZER` dan moderasi kegiatan `PENDING`.
- [x] Notifikasi in-app untuk perubahan dan pengarsipan kegiatan.
- [ ] Policy tabel bersama ditinjau ulang oleh pemilik fitur bersama.
