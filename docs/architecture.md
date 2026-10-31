# Arsitektur Rangkul

> **Status:** menggambarkan implementasi MVP saat ini
> **Terakhir diperbarui:** 31 Oktober 2026
> **Dokumen produk:** [`docs/product.md`](./product.md)

Dokumen ini adalah sumber kebenaran untuk keputusan teknis, struktur folder, design system, dan rencana implementasi Rangkul. Semua agent dan kontributor wajib mengikuti aturan di sini agar tidak terjadi perbedaan pola.

---

## 1. Ringkasan Produk

Rangkul adalah platform komunitas yang menyatukan tiga hal:

1. **Informasi aksesibilitas tempat umum** dengan satu postingan mewakili satu lokasi.
2. **Direktori komunitas disabilitas dan inklusif** di Indonesia.
3. **Kegiatan volunteer inklusif** yang bisa diikuti langsung.

Data tempat dikumpulkan lewat crowdsourcing dan saat ini langsung tayang setelah dikirim (moderasi AI dinonaktifkan sementara lewat `AI_MODERATION_ENABLED`). Verifikasi admin tetap dipakai untuk komunitas/penyelenggara.

### Prinsip teknis

| Prinsip | Konsekuensi teknis |
|---|---|
| Aksesibel sejak awal | WCAG 2.2 AA, keyboard-first, kontras teruji, target sentuh 44px, peta selalu punya alternatif teks |
| Detail lebih berguna daripada rating | Foto, fasilitas, dan titik peta per lokasi, bukan hanya rating |
| Dibangun bersama komunitas | Semua konten pengguna melewati validasi dan bisa diperbarui |
| Sederhana dulu | MVP fokus pada 3 fitur inti, tanpa over-engineering |
| Server sebagai sumber kebenaran | Otorisasi dan validasi selalu di server, bukan di client |

---

## 2. Stack & Versi

| Lapisan | Teknologi | Catatan |
|---|---|---|
| Framework | Next.js `16.4.3` | App Router, React Server Components |
| UI runtime | React `19.3.0` | |
| Bahasa | TypeScript `5.x` strict | `noEmit`, path alias `@/*` |
| Styling | Tailwind CSS `4.x` | Via `@tailwindcss/turbopack`, token di `app/globals.css` |
| Database | Supabase Postgres | |
| ORM | Prisma `6.19.x` | Runtime pakai pooled URL, migrasi pakai direct URL |
| Auth | Supabase Auth | `@supabase/ssr`, cookie-based |
| Storage | Supabase Storage | Foto tempat, logo komunitas, cover kegiatan, dokumen verifikasi |
| Peta | Leaflet + React Leaflet | Client-only, tanpa API key |
| Routing | OSRM (profil `foot`) | Panggilan `fetch` langsung dari client |
| UI primitives | Komponen sendiri + Tailwind | Tanpa Radix/cva; ikon SVG di `components/ui/icons.tsx` |
| Form | React `useActionState` + Server Action + Zod | Validasi ganda client & server |
| Tanggal & angka | `Intl.DateTimeFormat` / `Intl.NumberFormat` | Locale `id-ID`; tanpa date-fns |
| Export | ExcelJS | Export pendaftar kegiatan |
| Moderasi | Gemini API | Opsional; aktif hanya bila `AI_MODERATION_ENABLED=true` |

### Konfigurasi Next.js yang sudah aktif

`next.config.ts` sudah memakai:

```ts
experimental: {
  agentFeedback: true,
  serverActions: { bodySizeLimit: "16mb" },
}
cacheComponents: true
partialPrefetching: true
turbopack.rules["*.css"] = @tailwindcss/turbopack
turbopack.root = process.cwd()
```

Implikasi yang **wajib** dipatuhi:

- Jangan memakai `export const dynamic`, `revalidate`, atau `fetchCache` di route segment.
- Gunakan `"use cache"`, `cacheLife()`, dan `cacheTag()` untuk data publik.
- Bungkus data request-time dalam `<Suspense>` dengan skeleton.
- `params` dan `searchParams` adalah `Promise`; selalu `await`.
- Gunakan `proxy.ts` (bukan `middleware.ts`) untuk refresh sesi Supabase.
- Jangan memanggil synchronous IO (`new Date()`, `Math.random()`, `crypto.randomUUID()`) di static shell. Pindahkan ke server action, client component, atau di balik `connection()`/`Suspense`.

---

## 3. Design System

### 3.1 Arah visual

**Kata kunci:** hangat, tenang, terpercaya, manusiawi, tidak korporat.

Palet utama **teal hangat + amber**, dengan netral krem. Teal memberi kesan tenang dan terpercaya; amber memberi kehangatan dan menjadi aksen perhatian. Netral krem menghindari kesan dingin seperti produk medis.

Yang **tidak** dipakai:

- Biru teknologi generik sebagai warna utama.
- Gradient pelangi atau glassmorphism berlebihan.
- Warna sebagai satu-satunya pembeda status.
- Dark mode setengah jadi. MVP light-first; dukungan `forced-colors` disiapkan.

### 3.2 Font

| Peran | Font | Variabel | Alasan |
|---|---|---|---|
| Body & UI | **Lexend** | `--font-lexend` | Dirancang untuk meningkatkan keterbacaan; cocok untuk audiens disabilitas |
| Heading & display | **Plus Jakarta Sans** | `--font-jakarta` | Identitas Indonesia, tegas, tetap ramah |
| Angka teknis | **JetBrains Mono** | `--font-jetbrains` | Koordinat, ID, kode |

Implementasi: `next/font/google` di `app/layout.tsx`, `display: "swap"`, subset `latin`.

Aturan tipografi:

- Body minimal **16px**, line-height **1.6**.
- Lebar baca maksimal **68ch**.
- Heading memakai `font-display` dengan `letter-spacing: -0.02em`.
- Jangan memakai font di bawah 12px.
- Jangan memakai teks kapital penuh untuk paragraf; hanya label pendek.
- Angka penting (rating, kuota, tanggal) boleh memakai `font-mono` secukupnya.

Skala:

| Token | Size / Line-height | Pemakaian |
|---|---|---|
| `text-xs` | 12 / 16 | metadata, caption |
| `text-sm` | 14 / 20 | label form, helper text |
| `text-base` | 16 / 26 | body utama |
| `text-lg` | 18 / 28 | lead paragraph |
| `text-xl` | 20 / 30 | judul card |
| `text-2xl` | 24 / 32 | judul section |
| `text-3xl` | 30 / 38 | judul halaman |
| `text-display-sm` | 36 / 44 | hero mobile |
| `text-display` | 48 / 56 | hero desktop |
| `text-display-lg` | 60 / 66 | display besar |

### 3.3 Warna

Semua pasangan teks di bawah sudah memenuhi kontras WCAG AA (≥ 4.5:1 untuk teks normal, ≥ 3:1 untuk UI/large text).

#### Primary — Teal

| Token | Hex | Pemakaian |
|---|---|---|
| `primary-50` | `#F0FAF8` | background lembut |
| `primary-100` | `#DCF3EF` | chip, highlight |
| `primary-200` | `#B9E7DF` | border aktif |
| `primary-300` | `#86D3C7` | ilustrasi |
| `primary-400` | `#4DB6A8` | aksen peta |
| `primary-500` | `#1F9787` | hover ringan |
| `primary-600` | `#0F7B6F` | **tombol utama** (putih ±5.1:1) |
| `primary-700` | `#0B5F56` | hover/active, focus ring (±7.8:1) |
| `primary-800` | `#0A4C45` | teks di atas tint |
| `primary-900` | `#093E39` | section gelap |
| `primary-950` | `#04211F` | teks paling kuat |

#### Secondary — Amber

| Token | Hex | Pemakaian |
|---|---|---|
| `secondary-50` | `#FFF8EB` | background badge |
| `secondary-100` | `#FEEDC7` | highlight |
| `secondary-200` | `#FCD98A` | ilustrasi |
| `secondary-300` | `#F9C04D` | aksen visual |
| `secondary-400` | `#F5B942` | fill dengan teks `#1C1917` |
| `secondary-500` | `#E08A00` | ikon/garis |
| `secondary-600` | `#B45309` | **teks amber aksesibel** (±5.0:1) |
| `secondary-700` | `#92400E` | hover teks |
| `secondary-800` | `#78350F` | |
| `secondary-900` | `#5C2A0C` | teks di atas amber muda |
| `secondary-950` | `#3B1A07` | |

> Amber terang hanya untuk **fill** dengan teks gelap. Jangan memakai `secondary-300`/`400` sebagai warna teks di atas putih.

#### Netral — Sand

| Token | Hex | Pemakaian |
|---|---|---|
| `sand-50` | `#FAF8F4` | canvas |
| `sand-100` | `#F4F1EA` | surface muted |
| `sand-200` | `#E5DFD3` | divider |
| `sand-300` | `#D6CEC0` | border dekoratif |
| `sand-400` | `#A8A093` | placeholder |
| `sand-500` | `#78716C` | border kuat / outline input |
| `sand-600` | `#57534E` | teks sekunder |
| `sand-700` | `#44403C` | |
| `sand-800` | `#292524` | |
| `sand-900` | `#1C1917` | teks utama |

#### Semantik

| Status | Base | Soft | Pemakaian |
|---|---|---|---|
| Success | `#15803D` | `#DCFCE7` | terverifikasi, tersedia |
| Warning | `#B45309` | `#FEF3C7` | menunggu verifikasi |
| Danger | `#B91C1C` | `#FEE2E2` | error, tidak tersedia, laporan |
| Info | `#0369A1` | `#E0F2FE` | informasi netral |

#### Token semantik (dipakai di komponen)

| Token | Nilai | Class Tailwind |
|---|---|---|
| `--canvas` | `#FAF8F4` | `bg-canvas` |
| `--surface` | `#FFFFFF` | `bg-surface` |
| `--surface-muted` | `#F4F1EA` | `bg-surface-muted` |
| `--surface-inverse` | `#093E39` | `bg-surface-inverse` |
| `--ink` | `#1C1917` | `text-ink` |
| `--ink-muted` | `#57534E` | `text-ink-muted` |
| `--ink-inverse` | `#FAF8F4` | `text-ink-inverse` |
| `--line` | `#E5DFD3` | `border-line` |
| `--line-strong` | `#78716C` | `border-line-strong` |
| `--focus` | `#0B5F56` | `outline-focus` |
| `--overlay` | `rgb(28 25 23 / 0.55)` | `bg-overlay` |

**Aturan kontras:**

- Teks normal di atas `canvas`/`surface` memakai `text-ink` atau `text-ink-muted`.
- Teks di atas `primary-600`/`700` memakai putih.
- Border input wajib `border-line-strong` (≥ 3:1), bukan `border-line`.
- `border-line` hanya untuk divider dekoratif.
- Jangan menyampaikan status hanya dengan warna; selalu tambah ikon dan teks.

### 3.4 Spacing, radius, shadow, motion

**Spacing** mengikuti skala 4px Tailwind: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.

**Radius:**

| Token | Nilai | Pemakaian |
|---|---|---|
| `rounded-input` | 10px | input, textarea, select |
| `rounded-button` | 12px | tombol |
| `rounded-card` | 16px | card, panel |
| `rounded-sheet` | 24px | modal, bottom sheet |
| `rounded-full` | 999px | pill, avatar |

**Shadow:**

| Token | Nilai | Pemakaian |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgb(28 25 23 / .06)` | input fokus, chip |
| `shadow-card` | `0 2px 8px rgb(28 25 23 / .08)` | card |
| `shadow-lifted` | `0 8px 24px rgb(28 25 23 / .10)` | dropdown, sheet |

**Motion:**

- 150ms untuk hover/focus.
- 200ms untuk elemen masuk.
- 300ms untuk sheet/modal.
- Easing `ease-soft` (`cubic-bezier(0.22, 1, 0.36, 1)`).
- Selalu hormati `prefers-reduced-motion: reduce`.
- Jangan memakai animasi yang berkedip lebih dari 3 kali per detik.

### 3.5 Layout & breakpoint

| Breakpoint | Lebar | Catatan |
|---|---|---|
| `xs` | 360px | minimum yang didukung |
| `sm` | 640px | tablet kecil |
| `md` | 768px | tablet |
| `lg` | 1024px | desktop |
| `xl` | 1280px | desktop lebar |
| `2xl` | 1536px | layar besar |

- Container halaman: `max-w-page` = **1200px**, gutter 16/24/32.
- Lebar konten baca: `68ch`.
- Target sentuh minimum: **44×44px** (`tap-target`).
- Header sticky: `scroll-padding-top` 6rem agar anchor tidak tertutup.
- Grid card: 1 kolom di mobile, 2 di `sm`, 3 di `lg`.

### 3.6 Implementasi token

Semua token berada di `app/globals.css`:

- `@theme` — palet mentah, font, radius, shadow, easing, breakpoint.
- `:root` — token semantik (canvas, surface, ink, line, focus).
- `@theme inline` — memetakan token semantik menjadi utility Tailwind (`bg-canvas`, `text-ink`, dst).
- `@layer base` — gaya dasar, focus ring, selection, reduced motion, forced-colors.
- `@layer components` — `.container-page`, `.skip-link`, `.prose-rangkul`.
- `@utility` — `tap-target`.

Komponen **tidak boleh** memakai hex langsung. Selalu pakai token.

### 3.7 Komponen UI

Semua komponen di `components/ui` adalah primitif presentational:

- Tidak melakukan fetch/data access.
- Tidak mengimpor Prisma, Supabase, atau `server/`.
- Menerima `className` dan meneruskan props native.
- Varian didefinisikan sebagai objek `Record` biasa di dalam komponen (mis. `variants` dan `sizes` di `button.tsx`). Proyek **tidak** memakai Radix, `class-variance-authority`, `clsx`, atau `tailwind-merge`.
- Penggabungan class memakai `cn()` di `lib/utils/cn.ts`, yang hanya memfilter nilai falsy lalu menggabungkannya dengan spasi.
- Perilaku aksesibel (dialog, menu, dsb.) ditulis langsung di komponen domain dengan elemen native dan atribut ARIA.

Primitif yang **sudah ada** di `components/ui`:

`Button`/`ButtonLink`, `Badge`, `Breadcrumb`, `EmptyState`, `Field` (+ hint/error), `FileField`, `Select`, `Skeleton`, `Textarea`, `VerifiedBadge`, `Icons`.

Primitif lain (mis. `Dialog`, `Sheet`, `Tabs`, `Accordion`, `Toast`, `Pagination`, `Avatar`, `Tooltip`, `Switch`, `Stepper`) belum dibuat sebagai komponen `ui`; beberapa perilaku dialog/menu ditulis langsung di komponen domain.

### 3.8 Checklist aksesibilitas

Setiap halaman dan komponen wajib memenuhi:

- [ ] Struktur heading berurutan (`h1` → `h2` → `h3`), satu `h1` per halaman.
- [ ] Landmark: `header`, `nav`, `main#konten-utama`, `footer`.
- [ ] Skip link berfungsi dan terlihat saat fokus.
- [ ] Semua elemen interaktif bisa dijangkau keyboard.
- [ ] Focus ring terlihat jelas (3px, offset 2px).
- [ ] Target sentuh ≥ 44×44px.
- [ ] Label form eksplisit; placeholder bukan pengganti label.
- [ ] Error form: teks + ikon + `aria-describedby`; fokus pindah ke error pertama.
- [ ] Status async diumumkan lewat `aria-live="polite"`.
- [ ] Gambar punya `alt`; gambar dekoratif `alt=""`.
- [ ] Peta punya daftar lokasi alternatif dan petunjuk arah teks.
- [ ] Rating memakai `radiogroup` dengan label teks, bukan hanya bintang.
- [ ] Tidak ada teks yang terpotong saat zoom 200%.
- [ ] Kontras teks ≥ 4.5:1; UI ≥ 3:1.
- [ ] `prefers-reduced-motion` dihormati.
- [ ] `forced-colors` tetap terbaca.
- [ ] Bahasa halaman `lang="id"`.

---

## 4. Peta Route & Hak Akses

| Route | File | Akses | Keterangan |
|---|---|---|---|
| `/` | `app/(public)/page.tsx` | Publik | Beranda, CTA ke 3 fitur |
| `/jelajahi` | `app/(public)/jelajahi/page.tsx` | Publik | Feed postingan + pencarian + filter kategori di client |
| `/jelajahi/[slug]` | `app/(public)/jelajahi/[slug]/page.tsx` | Publik | Detail tempat: foto, rating pemosting, fasilitas, peta |
| `/jelajahi/[slug]/navigasi` | `app/(public)/jelajahi/[slug]/navigasi/page.tsx` | Publik | Navigasi GPS, rute OSRM, petunjuk arah |
| `/komunitas` | `app/(public)/komunitas/page.tsx` | Publik | Direktori komunitas `VERIFIED` |
| `/komunitas/[slug]` | `app/(public)/komunitas/[slug]/page.tsx` | Publik | Profil komunitas |
| `/komunitas/daftar` | `app/(public)/komunitas/daftar/page.tsx` | Login | Formulir pendaftaran komunitas |
| `/volunteer` | `app/(public)/volunteer/page.tsx` | Publik | Daftar kegiatan `PUBLISHED` |
| `/volunteer/[slug]` | `app/(public)/volunteer/[slug]/page.tsx` | Publik | Detail kegiatan + panel pendaftaran |
| `/volunteer/jadi-penyelenggara` | `app/(public)/volunteer/jadi-penyelenggara/page.tsx` | Publik (form wajib login) | Pengajuan verifikasi penyelenggara |
| `/tambah-info` | `app/(public)/tambah-info/page.tsx` | Login | Formulir posting tempat |
| `/profil` | `app/(public)/profil/page.tsx` | Login | Profil pengguna: edit nama/bio, postingan sendiri, pendaftaran volunteer |
| `/masuk` | `app/(auth)/masuk/page.tsx` | Guest | Login |
| `/daftar` | `app/(auth)/daftar/page.tsx` | Guest | Registrasi |
| `/auth/callback` | `app/auth/callback/route.ts` | Publik | Tukar kode konfirmasi Supabase, buat profil, redirect `next` |
| `/dashboard` | `app/dashboard/page.tsx` | Organizer/Admin | Redirect ke `/dashboard/kegiatan` |
| `/dashboard/kegiatan` | `app/dashboard/kegiatan/page.tsx` | Organizer/Admin | Daftar kegiatan milik sendiri |
| `/dashboard/kegiatan/baru` | `app/dashboard/kegiatan/baru/page.tsx` | Organizer/Admin | Buat kegiatan |
| `/dashboard/kegiatan/[id]/edit` | `app/dashboard/kegiatan/[id]/edit/page.tsx` | Organizer/Admin | Edit kegiatan |
| `/dashboard/kegiatan/[id]/pendaftar` | `app/dashboard/kegiatan/[id]/pendaftar/page.tsx` | Organizer/Admin | Tabel pendaftar |
| `/dashboard/kegiatan/[id]/pendaftar/export` | route handler | Organizer/Admin | Export Excel pendaftar |
| `/admin/masuk` | `app/admin/(auth)/masuk/page.tsx` | Guest | Login khusus admin |
| `/admin` | `app/admin/(dashboard)/page.tsx` | Admin | Ringkasan antrean verifikasi |
| `/admin/komunitas` | `app/admin/(dashboard)/komunitas/page.tsx` | Admin | Verifikasi komunitas |
| `/admin/penyelenggara` | `app/admin/(dashboard)/penyelenggara/page.tsx` | Admin | Verifikasi penyelenggara |
| `/admin/kegiatan` | `app/admin/(dashboard)/kegiatan/page.tsx` | Admin | Moderasi/penerbitan kegiatan |

Tidak ada route `/admin/tempat`, `/admin/laporan`, `/api/health`, atau `/api/moderasi` pada implementasi saat ini.

Aturan akses:

- **Guest** boleh menjelajah tempat, komunitas, kegiatan, dan melihat halaman pengajuan penyelenggara.
- **User** (login) boleh menambah tempat, memberi “Paling membantu”, mendaftar volunteer, dan mengajukan komunitas/penyelenggara.
- **Organizer** (terverifikasi) boleh mengelola kegiatan miliknya, melihat pendaftar, dan mengekspor data.
- **Admin** boleh memverifikasi komunitas/penyelenggara, menerbitkan/menolak kegiatan, dan melihat seluruh kegiatan.
- Semua guard halaman memakai `getAuthorizedProfile()` + `redirect` atau `requireOrganizer()`/`requireAdmin()`; server action memakai guard yang sama.

---

## 5. Struktur Folder

```text
app/
  layout.tsx                    # html lang="id", font, metadata, skip link
  globals.css                   # design tokens + base + components + utilities
  icon.svg
  (public)/
    layout.tsx                  # SiteHeader + main#konten-utama + SiteFooter
    page.tsx                    # landing
    jelajahi/
      page.tsx
      [slug]/page.tsx
      [slug]/navigasi/page.tsx
    komunitas/
      page.tsx
      [slug]/page.tsx
      daftar/page.tsx
    volunteer/
      page.tsx
      [slug]/page.tsx
      jadi-penyelenggara/page.tsx
    tambah-info/page.tsx
    profil/page.tsx
  (auth)/
    layout.tsx                  # layout minimal tanpa header publik
    masuk/page.tsx
    daftar/page.tsx
  dashboard/                    # bukan route group; guard ada di layout.tsx
    layout.tsx
    page.tsx                    # redirect ke /dashboard/kegiatan
    kegiatan/
      page.tsx
      baru/page.tsx
      [id]/edit/page.tsx
      [id]/pendaftar/page.tsx
      [id]/pendaftar/export/route.ts
  admin/
    (auth)/
      layout.tsx
      masuk/page.tsx
    (dashboard)/
      layout.tsx                # guard admin + navigasi
      page.tsx
      komunitas/page.tsx
      penyelenggara/page.tsx
      kegiatan/page.tsx
  auth/callback/route.ts

components/
  ui/                           # primitif desain, tanpa data
  layout/                       # header, footer, brand, auth nav, mobile nav, notification menu
  places/                       # feed, form posting, kartu, rating, badge, filter
  communities/                  # direktori, filter, kartu, form, profil
  volunteer/                    # eksplorasi, kartu, dialog, form, pendaftaran
  admin/                        # form login admin, aksi review
  map/                          # Leaflet, marker, routing, fallback, navigasi
  profile/                      # form edit profil
  auth/                         # form login/daftar
  feedback/                     # (belum ada komponen terpisah; empty state di ui/)

lib/
  db/prisma.ts                  # singleton Prisma
  supabase/
    server.ts                   # createServerClient + cookies
    client.ts                   # browser client
    admin.ts                    # service role (server-only)
    storage.ts                  # signed upload/download URL
    buckets.ts                  # nama bucket
  auth/
    session.ts                  # getAuthUser/getCurrentUser/getCurrentProfile
    guards.ts                   # requireUser/requireOrganizer/requireAdmin/getAuthorizedProfile
  ai/moderation.ts              # klien Gemini + fallback
  volunteer/                    # action, data, schema, status, filter, upload
  validation/                   # skema Zod komunitas & posting
  storage/place-photos.ts       # upload foto posting via sesi server
  constants/                    # site config, kategori, fitur, komunitas, foto
  map/                          # OSRM, geo, tile
  utils/                        # cn, format, slug, redirect, image
  env.ts / env/public.ts        # validasi environment

server/
  places/queries.ts             # "use cache" + cacheTag
  places/actions.ts             # "use server" + auth + Zod + revalidate
  places/mappers.ts             # Prisma → tipe UI
  communities/queries.ts
  communities/actions.ts
  profiles/queries.ts           # postingan + pendaftaran volunteer milik pengguna
  profiles/actions.ts           # update nama/bio profil
  admin/queries.ts
  admin/actions.ts
  admin/auth-actions.ts
  auth/actions.ts
  notifications/queries.ts
  notifications/actions.ts

hooks/                          # client hooks saja
types/                          # tipe domain bersama
prisma/
  schema.prisma
  seed.ts
  seed-data.ts
public/
  images/
docs/
  product.md
  architecture.md
  database.md
  design-system.md
  volunteer-admin-integration.md
proxy.ts                        # refresh sesi Supabase (Next 16)
```

Catatan struktur:

- Route dashboard berada di `app/dashboard`, bukan route group `(dashboard)`.
- Modul Volunteer tidak memakai `server/volunteer`; logikanya ada di `lib/volunteer`.
- Notifikasi memakai `server/notifications`.
- Folder route tanpa `page.tsx` tidak menghasilkan URL; jangan menambahkan folder baru tanpa alasan yang jelas.
- `error.tsx`/`not-found.tsx` hanya ada di route yang membutuhkannya saat ini: `app/(public)/volunteer/error.tsx`, `app/dashboard/error.tsx`, serta `not-found.tsx` di detail komunitas dan detail volunteer. Tidak ada error boundary global di root.
- Folder kosong sisa scaffold (`app/api`, `app/admin/tempat`, `app/admin/laporan`, `app/(dashboard)`) tidak menghasilkan route dan tidak dilacak Git; jangan dianggap fitur yang sudah ada.

---

## 6. Aturan Dependensi

Arah dependensi hanya boleh satu arah:

```text
app/  →  server/  →  lib/  →  types/
 ↓          ↓
components/ ┘
```

Aturan konkret:

1. **`app/**/page.tsx`** hanya menyusun UI dan memanggil query dari `server/<domain>/queries.ts` atau `lib/volunteer/data.ts`. Tidak boleh mengimpor Prisma.
2. **`components/ui/*`** tidak boleh mengimpor domain, `server/`, Prisma, atau Supabase. Hanya props dan Tailwind.
3. **`components/<domain>/*`** boleh mengimpor `ui`, `lib/utils`, `types`, dan server action dari `server/<domain>/actions.ts`, `lib/volunteer/actions.ts`, atau `server/notifications/actions.ts`. Tidak boleh mengimpor query atau Prisma.
4. **`server/*`** boleh mengimpor `lib`, Prisma, dan `types`. Tidak boleh mengimpor komponen React.
5. **`lib/*`** harus framework-agnostic dengan pengecualian: modul server-only (`lib/supabase/server.ts`, `lib/supabase/admin.ts`, `lib/db/prisma.ts`, `lib/storage/*`, `lib/volunteer/actions.ts`, `lib/volunteer/data.ts`, `lib/ai/moderation.ts`) hanya untuk server bundle.
6. **`hooks/*`** selalu client (`"use client"`), tidak boleh mengimpor `server/`.
7. **`types/*`** tidak boleh mengimpor runtime code.
8. **Tidak ada barrel `index.ts`.** Impor langsung ke file untuk menghindari circular dependency dan bundle bloat.
9. **Jangan impor `lib/supabase/admin.ts` dari client component.** Service role key tidak boleh bocor.
10. **Server action tidak boleh dipanggil dari komponen `ui`.** Action dipanggil dari form domain.

---

## 7. Alur Data

### 7.1 Membaca data

```text
Page (Server Component)
  └─ server/<domain>/queries.ts   ("use cache" + cacheTag)
       └─ lib/db/prisma.ts
            └─ Supabase Postgres
```

- Query publik memakai `"use cache"` dan `cacheTag`.
- Query yang bergantung pada user/session tidak di-cache.
- Data yang lambat dibungkus `<Suspense>` dengan skeleton.
- Jangan fetch di client kecuali untuk interaksi real-time (mis. pencarian peta).

### 7.2 Menulis data

```text
Client form (useActionState + Zod)
  └─ server/<domain>/actions.ts  ("use server")
       ├─ requireUser / requireOrganizer / requireAdmin
       ├─ Zod parse (sumber kebenaran)
       ├─ moderasi AI bila aktif (fail-closed → PENDING)
       ├─ Prisma write
       └─ updateTag / revalidatePath → redirect
```

Saat `AI_MODERATION_ENABLED=false` (default), postingan tempat langsung `PUBLISHED` tanpa memanggil Gemini. Saat aktif, kegagalan moderasi selalu menghasilkan `PENDING`.

Bentuk hasil action mengikuti domainnya:

```ts
// Posting tempat & pendaftaran komunitas
type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

// Volunteer (lib/volunteer/action-state.ts)
type VolunteerActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; code: VolunteerActionCode; message: string; fieldErrors?: VolunteerFieldErrors };
```

Jangan melempar error mentah ke client. Pesan error harus ramah pengguna dan tidak membocorkan detail internal.

### 7.3 Contoh action

```ts
"use server";

export async function createPlacePostAction(
  _previousState: PlacePostFormState,
  formData: FormData,
): Promise<PlacePostFormState> {
  const user = await requireUser("/tambah-info");
  const parsed = placePostSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    rating: formData.get("rating"),
    facilities: formData.getAll("facilities"),
    latitude: formData.get("lat"),
    longitude: formData.get("lng"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Periksa kembali isian postinganmu.", fieldErrors: /* ... */ };
  }

  const moderation = isModerationEnabled()
    ? await moderatePlacePost(parsed.data)
    : null;
  const status = moderation
    ? moderation.verdict === "SAFE" ? "PUBLISHED" : moderation.verdict === "BLOCK" ? "REJECTED" : "PENDING"
    : "PUBLISHED";

  await prisma.place.create({
    data: {
      ...parsed.data,
      slug,
      status,
      posterRating: parsed.data.rating,
      facilities: parsed.data.facilities,
      createdById: user.id,
    },
  });

  updateTag("places");
  updateTag(`place:${slug}`);
}
```

---

## 8. Caching & Revalidasi

Karena `cacheComponents: true`:

| Kebutuhan | Pola |
|---|---|
| Feed tempat (`getPlaceSummaries`, `getPlaceCount`) | `"use cache"` + `cacheTag("places")` + `cacheLife("minutes")` |
| Detail tempat (`getPlaceBySlug`) | `"use cache"` + `cacheTag("places")`, `cacheTag(\`place:${slug}\`)`, `cacheLife("days")` |
| Direktori komunitas | `"use cache"` + `cacheTag("communities")` + `cacheLife("minutes")` |
| Detail komunitas | `"use cache"` + `cacheTag(\`community:${slug}\`)` + `cacheLife("days")` |
| Komunitas terkait | `"use cache"` + `cacheTag("communities")` + `cacheLife("hours")` |
| Volunteer, dashboard, admin, notifikasi | Tanpa cache; bagian dinamis memakai `connection()` dan/atau `<Suspense>` |
| Setelah create/update/delete | `updateTag(tag)` untuk data ter-cache, atau `revalidatePath()` untuk halaman volunteer/admin |
| Setelah like | `updateTag("places")` + `updateTag(\`place:${slug}\`)` |

Tag yang dipakai saat ini:

```text
places
place:{slug}
communities
community:{slug}
```

Catatan penting:

- `getPlaceBySlug` di-cache hingga berhari-hari. Hasil `null` (404) juga dapat tersimpan di cache sampai `.next/cache` dibersihkan atau tag terkait diinvalidasi. Saat menguji halaman yang baru dibuat, pastikan cache tidak menyimpan 404 lama.
- Jangan memakai `export const dynamic/revalidate/fetchCache`.
- Jangan memanggil `cookies()`/`headers()` di dalam fungsi `"use cache"`.
- Jangan menyimpan data sensitif di cache publik.
- Jika route authenticated memblokir render instan, gunakan `<Suspense>`; `instant = false` hanya opsi terakhir dan harus didokumentasikan.

---

## 9. Auth & Otorisasi

### 9.1 Alur

1. Login/registrasi lewat Supabase Auth.
2. Sesi disimpan di cookie HTTP-only oleh `@supabase/ssr`.
3. `proxy.ts` me-refresh sesi pada request yang cocok (hanya bila env Supabase terisi).
4. `lib/auth/session.ts` memanggil `supabase.auth.getUser()` di server.
5. Profil aplikasi disimpan di tabel `profiles` dengan `id` = UUID Supabase Auth.
6. `getCurrentProfile()`/`ensureProfile()` membuat profil jika belum ada. Profil juga dibuat di `/auth/callback` setelah konfirmasi email.
7. Redirect setelah login memakai `safeNextPath()`: hanya path internal yang diawali `/` dan bukan halaman auth. Login admin memakai `safeAdminNextPath()` yang membatasi tujuan ke area `/admin`.

### 9.2 Role

```ts
enum Role {
  USER
  ORGANIZER
  ADMIN
}
```

- Role disimpan di database, bukan di cookie/client.
- Setiap server action memanggil guard sebelum menyentuh data.
- `requireUser(nextPath)` me-redirect ke `/masuk?next=...` bila belum login.
- `requireOrganizer()` dan `requireAdmin()` melempar `AuthorizationError` bila role tidak cocok.
- `getAuthorizedProfile(roles)` dipakai untuk mengecek tanpa redirect; halaman dashboard/admin menampilkan pesan “tidak memiliki akses” alih-alih error.
- Login admin (`/admin/masuk`) memverifikasi role `ADMIN` setelah Supabase auth; akun non-admin langsung di-sign-out.

### 9.3 Catatan Supabase + Prisma

Prisma terhubung langsung ke Postgres, sehingga **RLS Supabase tidak berlaku untuk query Prisma**. Konsekuensinya:

- Semua otorisasi wajib di layer server.
- Jangan mengekspos query Prisma lewat route handler tanpa guard.
- Supabase JS dari browser hanya untuk auth dan upload; jangan query tabel langsung dari browser.
- Service role key hanya di server.

---

## 10. Model Data

> Skema lengkap (kolom, tipe, default, constraint, index, status, dan RLS): [`docs/database.md`](./database.md). Bagian ini hanya ringkasan.

### 10.1 Entitas

| Entitas | Field penting |
|---|---|
| `Profile` | `id` (UUID auth), `name`, `email`, `role`, `avatarUrl`, `bio`, `createdAt` |
| `Place` | `slug`, `name`, `category`, `description`, `address`, `city`, `province`, `lat`, `lng`, `status`, `createdById`, `posterRating`, `facilities[]`, `ratingAvg`/`reviewCount` (legacy) |
| `Entrance` | `placeId`, `label`, `latitude`, `longitude`, `photoUrl`, `isMain`, `notes` (data legacy) |
| `AccessibilityFeature` | `key`, `label`, `shortLabel`, `category`, `icon` |
| `EntranceFeature` | `entranceId`, `featureId`, `value` (`AVAILABLE/NOT_AVAILABLE/UNKNOWN`), `notes` (legacy) |
| `PlacePhoto` | `placeId`, `url`, `alt`, `sortOrder`, `createdById` |
| `Review` | `placeId`, `authorId`, `rating` (1–5), `body`, `status` — **legacy, tidak dipakai UI** |
| `PlaceLike` | `placeId`, `userId`, unik `(placeId, userId)` |
| `Community` | `slug`, `name`, `description`, `province`, `city`, `focus[]`, `contact`, `socials`, `joinUrl`, `logoUrl`, `status`, `ownerId`, `verifiedAt` |
| `VolunteerEvent` | `slug`, `organizerId`, `communityId?`, `title`, `description`, `category`, `locationName`, `address`, `lat`, `lng`, `startsAt`, `endsAt`, `requirements`, `slots`, `registeredCount`, `status`, `moderationNote` |
| `EventRegistration` | `eventId`, `userId`, `name`, `email`, `phone`, `accessibilityNeeds`, `status`; unik `(eventId, userId)` |
| `VerificationRequest` | `type` (`COMMUNITY/ORGANIZER`), `payload`, `documentUrl`, `status`, `reviewerId`, `reviewedAt` |
| `Notification` | `userId`, `type` (`EVENT_UPDATED/EVENT_ARCHIVED`), `title`, `body`, `href`, `eventId?`, `readAt`, `createdAt` |
| `Report`, `ModerationLog` | **belum ada di schema**; rencana |

### 10.2 Relasi

```text
Profile 1─* Place
Place   1─* Entrance 1─* EntranceFeature *─1 AccessibilityFeature
Place   1─* PlacePhoto
Place   1─* PlaceLike *─1 Profile
Place   1─* Review *─1 Profile (legacy)
Profile 1─* Community (owner)
Profile 1─* VolunteerEvent (organizer)
VolunteerEvent 1─* EventRegistration *─1 Profile
VolunteerEvent 1─* Notification
Profile 1─* VerificationRequest
Profile 1─* Notification
```

`Community` dan `VolunteerEvent` belum terhubung lewat FK; `volunteer_events.community_id` masih kolom nullable tanpa relasi.

### 10.3 Status konten

| Entitas | Status |
|---|---|
| `Place` | `PENDING`, `PUBLISHED`, `REJECTED`, `ARCHIVED` |
| `Review` (legacy) | `PENDING`, `PUBLISHED`, `REJECTED` |
| `Community` | `PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED` |
| `VolunteerEvent` | `DRAFT`, `PENDING`, `PUBLISHED`, `CLOSED`, `REJECTED` |
| `EventRegistration` | `PENDING`, `CONFIRMED`, `CANCELLED` |
| `VerificationRequest` | `PENDING`, `APPROVED`, `REJECTED` |

### 10.4 Aturan data

- Semua ID memakai `uuid` atau `cuid`; jangan auto-increment yang bisa ditebak.
- `slug` unik dan stabil; jangan berubah setelah publikasi tanpa redirect.
- Simpan waktu dalam UTC (`timestamptz`).
- Rating tempat yang ditampilkan berasal dari `places.posterRating` (1–5). `ratingAvg`/`reviewCount` adalah agregat legacy dari `reviews` dan tidak dibaca UI.
- Fasilitas postingan baru disimpan di `places.facilities`; fasilitas `entrance_features` hanya untuk data legacy dan digabung saat mapping.
- Hapus data memakai soft delete (`archivedAt`) untuk konten publik.
- Status kegiatan hanya boleh diubah lewat server action dengan guard; `published_at` diisi admin saat menerbitkan.

---

## 11. Upload & Storage

Bucket Supabase Storage:

| Bucket | Isi | Akses |
|---|---|---|
| `place-photos` | foto postingan tempat | public read, authenticated write (folder milik sendiri) |
| `community-logos` | logo komunitas | public read, authenticated write (folder milik sendiri) |
| `event-covers` | cover kegiatan | public read, authenticated write (folder milik sendiri) |
| `verification-docs` | dokumen verifikasi penyelenggara | privat; hanya admin lewat signed URL |

Aturan upload per bucket:

Alur upload saat ini:

```text
Foto postingan Jelajahi:
1. Form mengirim file ke Server Action createPlacePostAction (body limit 16 MB)
2. Server Action memvalidasi tipe/ukuran, mengunggah ke Storage memakai sesi pengguna
3. Baris place + place_photos dibuat; jika gagal, foto yang sudah terunggah dihapus (best-effort)

Logo komunitas, cover kegiatan, dokumen verifikasi:
1. Client minta signed upload URL ke Server Action (guard + validasi tipe/ukuran)
2. Client upload langsung ke Supabase Storage
3. Client mengirim path → Server Action menyimpan record
4. Server Action revalidasi cache/path terkait
```

Aturan:

- Format gambar: JPEG, PNG, WebP. **Tidak menerima SVG.** Dokumen verifikasi juga menerima PDF.
- Ukuran maksimal 5MB per file.
- Nama file acak: `{userId}/{uuid}.{ext}` atau `{prefix}/{userId}/{uuid}.{ext}`.
- Alt text wajib untuk foto konten; foto dekoratif `alt=""`.
- Validasi MIME di server, bukan hanya `accept` di input.
- Jangan pernah mengekspos service role key ke client.
- Bersihkan file yatim secara berkala (cron/edge function).

---

## 12. Moderasi AI

### 12.1 Tujuan

Menyaring **postingan tempat** dari spam, konten tidak senonoh, ujaran kebencian, dan potensi pelanggaran hukum. Moderasi berjalan di belakang layar dan tidak menampilkan alasan mentah ke pengguna.

Saat ini moderasi AI **default mati** (`AI_MODERATION_ENABLED=false`). Komunitas dan kegiatan tetap melewati verifikasi/moderasi admin, bukan AI.

### 12.2 Kontrak

```ts
type ModerationVerdict = "SAFE" | "REVIEW" | "BLOCK";

type ModerationResult = {
  verdict: ModerationVerdict;
  reason: string;
  source: "ai" | "fallback";
};
```

Implementasi: `lib/ai/moderation.ts` memakai Gemini `generateContent` dengan `responseSchema` JSON. Provider dan model diatur lewat `GEMINI_API_KEY` dan `GEMINI_MODERATION_MODEL` (default `gemini-3.1-flash-lite`).

### 12.3 Aturan

- **Fail-closed:** key belum diisi, timeout (20 detik), error HTTP, atau respons tidak valid → `REVIEW`, yang dipetakan action menjadi `PENDING`.
- Moderasi berjalan **sebelum** postingan disimpan bila diaktifkan.
- `SAFE` → `PUBLISHED`; `REVIEW` → `PENDING`; `BLOCK` → `REJECTED`.
- Saat moderasi mati, postingan langsung `PUBLISHED`, `moderated_at = NULL`, dan catatan “Moderasi AI dinonaktifkan sementara.”.
- Admin belum memiliki antrean moderasi tempat; postingan `PENDING` belum punya UI peninjauan.
- Jangan menampilkan alasan moderasi mentah ke pengguna.
- Rate limit submission belum diterapkan (lihat risiko terbuka).
- Moderasi bukan pengganti verifikasi admin untuk komunitas/penyelenggara/kegiatan.

---

## 13. Peta & Routing

### 13.1 Stack

- **Leaflet** + **react-leaflet** untuk peta.
- **OpenStreetMap** sebagai tile sumber.
- **OSRM** untuk rute pejalan kaki, dipanggil langsung dari browser dengan `fetch`, lalu digambar sebagai `<Polyline>`.
- Semua komponen peta adalah client component dan di-`dynamic import` dengan `ssr: false`.
- Kita **tidak** memakai Leaflet Routing Machine. Library itu menambah dependensi dan sulit dikontrol untuk instruksi aksesibel; kita hanya butuh geometri rute dan langkah-langkahnya.

### 13.2 Implementasi saat ini

| Bagian | File |
|---|---|
| Klien OSRM, terjemahan instruksi, format jarak/waktu | `lib/map/osrm.ts` |
| Peta detail tempat | `components/map/leaflet-place-map.tsx` |
| Peta rute | `components/map/leaflet-route-map.tsx` |
| Pembungkus + fallback | `components/map/place-map.tsx`, `components/map/route-map.tsx` |
| Alur navigasi live (geolocation, suara, progres rute) | `components/map/navigation-experience.tsx` |
| Perhitungan jarak/sisa rute | `lib/map/geo.ts` |

Detail perilaku:

- Endpoint default `https://routing.openstreetmap.de/routed-foot`, karena demo `router.project-osrm.org` mengabaikan profil `foot` dan memberi hasil mirip mobil.
- Request: `GET {OSRM}/route/v1/foot/{lon},{lat};{lon},{lat}?overview=full&geometries=geojson&steps=true`. Path `/routed-foot` wajib dipertahankan; jangan memakai `new URL("/route/...")` karena sub-path akan terbuang dan OSRM membalas 404.
- Hasil rute disimpan cache in-memory 5 menit per pasangan koordinat (presisi 5 desimal) dan di-`AbortController` saat titik awal berubah.
- Timeout 8 detik. Jika gagal, UI menampilkan pesan + tombol “Hitung ulang rute”, tanpa langkah arah karangan.
- Titik awal **hanya** lokasi perangkat via `navigator.geolocation.watchPosition`. Tidak ada input manual, titik contoh, atau fallback `places.default_origin_*`.
- Rute dihitung ulang otomatis saat pengguna bergerak > 80 m atau menyimpang > 35 m dari garis rute.
- Garis rute memakai biru literal `#2563eb` dengan casing putih; marker pengguna berupa titik biru berdenyut. Peta mengikuti pengguna sampai pengguna menggeser peta, lalu tombol “Ikuti lokasi” mengaktifkannya lagi.
- Panduan suara (opsional) membacakan langkah aktif setiap kali langkah berubah.

### 13.3 Aturan

- Peta tidak boleh menjadi satu-satunya cara mengakses informasi. Selalu sediakan:
  - ringkasan jarak dan petunjuk arah dalam teks di samping peta,
  - status lokasi dan tombol coba lagi bila GPS gagal,
  - koordinat yang bisa dibaca screen reader.
- Marker harus punya label aksesibel dan bisa difokuskan keyboard.
- `aria-label` pada container peta, mis. “Peta lokasi tempat, gunakan daftar lokasi di bawah untuk alternatif”.
- Jangan memakai `role="application"` kecuali benar-benar perlu.
- Legenda rute memakai bentuk dan label teks, bukan hanya warna.
- Jika tile gagal dimuat (≥3 `tileerror`), tampilkan peringatan + tautan ke OpenStreetMap.
- Simpan `lat`/`lng` sebagai `Decimal(9,6)` di database.

### 13.4 Produksi

- Tile OSM publik hanya untuk pengembangan. Untuk produksi, gunakan tile provider yang sesuai kebijakan penggunaan.
- Endpoint OSRM publik punya rate limit dan tanpa jaminan SLA. Untuk produksi, self-host OSRM atau gunakan provider berbayar.
- Endpoint `routing.openstreetmap.de` mengirim `Access-Control-Allow-Origin: *`; jika self-host, pastikan CORS dan profil `foot` aktif.
- Simpan URL tile, atribusi, dan OSRM di env agar mudah diganti.

---

## 14. Konvensi Kode

### 14.1 Penamaan

| Hal | Aturan | Contoh |
|---|---|---|
| File | `kebab-case` | `place-card.tsx` |
| Komponen | `PascalCase` | `PlaceCard` |
| Fungsi/variabel | `camelCase` | `getPublishedPlaces` |
| Konstanta | `SCREAMING_SNAKE_CASE` | `MAX_PAGE_SIZE` |
| Tipe/interface | `PascalCase` | `PlaceWithEntrances` |
| Route URL | Bahasa Indonesia | `/jelajahi`, `/komunitas` |
| Kode | Bahasa Inggris | `createPlace`, `publishedAt` |
| CSS token | `kebab-case` | `--color-primary-600` |

### 14.2 TypeScript

- `strict: true`; jangan memakai `any`. Gunakan `unknown` + validasi.
- Prefer `type` untuk union/utility, `interface` untuk objek yang bisa diperluas.
- Ekspor tipe dari `types/` jika dipakai lintas domain.
- Gunakan tipe Prisma yang di-generate untuk entity; buat DTO di `types/` untuk data yang dikirim ke client.

### 14.3 React & Next.js

- Server Component adalah default.
- `"use client"` hanya di komponen yang butuh state/effect/browser API.
- Jangan menaruh `"use client"` di layout besar.
- Gunakan `next/image` untuk gambar; sertakan `sizes` dan `alt`.
- Gunakan `next/link` untuk navigasi internal.
- Gunakan `loading.tsx`/`<Suspense>` untuk skeleton, bukan spinner global.
- Gunakan `error.tsx` per route group untuk error boundary.
- Jangan memakai `useEffect` untuk data fetching yang bisa dilakukan di server.

### 14.4 Form

- Setiap form punya label eksplisit dan pesan error inline.
- Validasi client untuk UX; validasi server sebagai sumber kebenaran.
- Gunakan `useActionState` atau React Hook Form + server action.
- Setelah submit sukses: redirect + toast/`aria-live`.
- Jangan reset form sebelum server merespons sukses.

### 14.5 Tanggal & angka

- Simpan UTC.
- Tampilkan dengan locale `id` dan zona `Asia/Jakarta`.
- Format tanggal panjang: `31 Oktober 2026`.
- Format tanggal pendek: `31 Okt 2026`.
- Gunakan `Intl.NumberFormat("id-ID")` untuk angka.

### 14.6 Error & logging

- Error yang diharapkan (validasi, auth) dikembalikan sebagai `ActionResult`.
- Error tak terduga dicatat di server dengan konteks (route, action, user id) tanpa data sensitif.
- Di production, integrasikan error tracking (Sentry/Highlight) — belum dipasang.

---

## 15. Environment Variables

Buat `.env.local` (tidak di-commit):

```bash
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Auth & Storage
NEXT_PUBLIC_SUPABASE_URL=
# Isi salah satu: publishable key (project baru) atau anon key (project lama)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Prisma)
# Runtime: pooled connection Supabase (port 6543, pgbouncer=true)
DATABASE_URL=
# Migrasi: direct/session connection (port 5432)
DIRECT_URL=

# Moderasi AI (Gemini)
AI_MODERATION_ENABLED=false
GEMINI_API_KEY=
GEMINI_MODERATION_MODEL=gemini-3.1-flash-lite

# Peta & routing
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_ATTRIBUTION=&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
NEXT_PUBLIC_OSRM_URL=https://routing.openstreetmap.de/routed-foot

# Seed opsional
SEED_ADMIN_EMAIL=
SEED_ORGANIZER_EMAIL=
SEED_ALLOW_ROLE_PROMOTION=false
```

Aturan:

- Hanya variabel `NEXT_PUBLIC_*` yang boleh dipakai di client.
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, dan `GEMINI_API_KEY` hanya di server.
- `lib/env.ts` memvalidasi env dengan Zod. Env publik dibaca lewat `lib/env/public.ts`; `assertDatabaseEnv()` dipanggil lazy di `lib/db/prisma.ts` supaya `next build` tidak butuh koneksi database.
- Prisma CLI tidak membaca `.env.local`. Script `db:*` memakai `scripts/with-env.mjs` untuk memuat env tersebut.
- `AI_MODERATION_ENABLED=false` membuat postingan langsung tayang. Set `true` hanya setelah `GEMINI_API_KEY` tersedia, karena tanpa key semua postingan akan ditahan `PENDING`.
- Jangan commit `.env.local`. Template ada di `.env.example`.

---

## 16. Setup & Perintah

### 16.1 Prasyarat

- Node.js 20.9+ (sesuaikan dengan requirement Next 16)
- npm
- Akun Supabase + project
- PostgreSQL via Supabase

### 16.2 Perintah

```bash
npm install
npm run dev
npm run build          # prisma generate && next build
npm run lint
npm run typecheck
npm run db:generate
npm run db:migrate    # buat migrasi baru (lokal)
npm run db:deploy     # terapkan migrasi ke database bersama
npm run db:seed
npm run db:studio
```

Semua script `db:*` memakai `scripts/with-env.mjs` untuk memuat `.env.local`. `npm run build` menjalankan `prisma generate` terlebih dahulu; hentikan dev server sebelum build agar DLL Prisma tidak terkunci (`EPERM`).

### 16.3 Urutan setup lokal

1. `npm install`
2. Salin `.env.example` → `.env.local`, isi `DATABASE_URL`, `DIRECT_URL`, kredensial Supabase, dan opsional Gemini/seed.
3. `npm run db:generate`
4. `npm run db:deploy` (database bersama) atau `npm run db:migrate` (membuat migrasi baru)
5. `npm run db:seed`
6. `npm run dev`
7. Buka `http://localhost:3000/jelajahi`
8. Login admin lewat `http://localhost:3000/admin/masuk` memakai akun berrole `ADMIN`.

---

## 17. Rencana Implementasi

### Status implementasi saat ini

| Item | Status |
|---|---|
| `docs/architecture.md` | ✅ diperbarui |
| Token desain di `app/globals.css` | ✅ selesai |
| Font & metadata di `app/layout.tsx` | ✅ selesai |
| Skip link + landmark dasar | ✅ selesai |
| Kerangka folder | ✅ selesai |
| Dependency (Prisma, Leaflet, Zod, Supabase, ExcelJS) | ✅ terpasang |
| `lib/env.ts` + `.env.example` | ✅ selesai |
| Skema Prisma + migration + seed | ✅ Fitur 1, komunitas, volunteer, notifikasi |
| Komponen UI inti | ✅ dipakai seluruh fitur |
| Halaman fitur | ✅ semua route di §4 memakai database |
| Auth Supabase + guard | ✅ selesai, termasuk login admin dan konfirmasi email |
| Moderasi AI | 🟡 tersedia tetapi default mati |
| Dashboard admin tempat/laporan | ⬜ belum |
| Laporan konten & rate limiting | ⬜ belum |

### Ringkasan fase

| Fase | Status |
|---|---|
| 0 — Fondasi desain & arsitektur | ✅ selesai |
| 1 — Tooling & data layer | ✅ selesai |
| 2 — UI kit & layout | ✅ selesai untuk komponen yang dipakai |
| 3 — Tempat & peta | ✅ selesai (feed, detail, navigasi, form posting) |
| 4 — Komunitas | ✅ selesai (direktori, pendaftaran, verifikasi admin) |
| 5 — Volunteer & dashboard | ✅ selesai (CRUD, pengajuan, pendaftar, export, notifikasi) |
| 6 — Admin & moderasi AI | 🟡 admin komunitas/penyelenggara/kegiatan selesai; moderasi tempat, laporan, dan rate limit belum |
| 7 — Polish & peluncuran | 🟡 audit aksesibilitas dan operasional masih berjalan |

### Pekerjaan yang belum selesai

- Halaman admin untuk memoderasi postingan tempat berstatus `PENDING`/`REJECTED`.
- Mekanisme laporan konten (`reports`) dan log moderasi (`moderation_logs`).
- Rate limiting submission.
- Audit WCAG menyeluruh dan uji screen reader.
- `sitemap.ts`/`robots.ts` dan metadata OG per halaman.
- Notifikasi email/push.
- FK `volunteer_events.community_id` → `communities.id`.

---

## 18. Definition of Done

Setiap PR/fitur dianggap selesai jika:

- [ ] `npm run lint` lolos.
- [ ] `npm run typecheck` lolos.
- [ ] `npm run build` lolos (hentikan dev server agar `prisma generate` tidak kena `EPERM`).
- [ ] Tidak ada `any` baru.
- [ ] Otorisasi dicek di server, bukan hanya UI.
- [ ] Input divalidasi dengan Zod di server.
- [ ] Ada state loading, empty, error, dan success.
- [ ] Bisa dipakai dengan keyboard saja.
- [ ] Kontras teks dan UI lolos WCAG AA.
- [ ] Target sentuh ≥ 44px.
- [ ] Responsif di 360px dan 1440px.
- [ ] Cache tag diinvalidasi setelah mutasi (`updateTag` untuk data ter-cache, `revalidatePath` untuk halaman volunteer/admin).
- [ ] Tidak ada secret di client bundle.
- [ ] Perubahan skema disertai migration baru di `prisma/migrations` dan sudah diterapkan.
- [ ] Dokumentasi diperbarui jika mengubah arsitektur, alur, skema, atau token.

---

## 19. Risiko & Keputusan Terbuka

| Topik | Status | Catatan |
|---|---|---|
| Provider moderasi AI | Diputuskan | Gemini `generateContent`; kode sudah ada dan default dimatikan lewat `AI_MODERATION_ENABLED` |
| Tile peta produksi | Terbuka | OSM publik hanya untuk dev; perlu provider/self-host |
| OSRM produksi | Terbuka | `routing.openstreetmap.de` dipakai untuk dev; rate limit/SLA perlu self-host |
| Database lokal/bersama | Diputuskan | Supabase hosted + Prisma; `DATABASE_URL` pooler, `DIRECT_URL` migrasi |
| RLS | Sebagian | Prisma bypass RLS; semua mutasi lewat server action. Policy `profiles`/`communities` masih perlu hardening (lihat `docs/database.md` §8) |
| Rate limiting | Terbuka | Belum ada; perlu Upstash/Redis atau edge function |
| Notifikasi in-app | Diputuskan | Tabel `notifications` + `NotificationType` untuk update/arsip kegiatan |
| Notifikasi email/push | Terbuka | Supabase Auth email vs Resend |
| Export Excel | Diputuskan | ExcelJS di server |
| Dark mode | Ditunda | Light-first; high contrast + forced-colors didukung |
| Login untuk daftar komunitas | Diputuskan | Wajib login agar kepemilikan bisa diverifikasi |
| Login untuk tambah tempat | Diputuskan | Wajib login untuk mencegah spam |
| Login untuk daftar volunteer | Diputuskan | Wajib login; pendaftaran `PENDING` lalu dikonfirmasi penyelenggara |
| Antrean moderasi tempat | Terbuka | Postingan `PENDING` belum punya UI admin |
| Laporan konten (`reports`) | Terbuka | Tabel dan alur belum dibuat |
| Log moderasi (`moderation_logs`) | Terbuka | Belum dibuat; keputusan moderator belum tersimpan sebagai audit |
| Pencarian teks | Terbuka | Feed Jelajahi mengambil semua data lalu memfilter di client; pertimbangkan full-text server-side saat volume naik |
| Rating tempat | Diputuskan | `places.poster_rating` (1–5) dari pemosting; badge “Ramah Disabilitas” bila ≥ 4. `reviews` legacy tidak dipakai |
| Fasilitas tempat | Diputuskan | `places.facilities` untuk postingan baru, digabung dengan `entrance_features` legacy saat mapping |
| PWA/offline | Ditunda | Dipertimbangkan setelah MVP |

---

## 20. Ringkasan Aturan Emas

1. Server adalah sumber kebenaran untuk auth dan validasi.
2. Jangan pernah import Prisma/Supabase admin di client.
3. Komponen `ui` tetap presentational.
4. Semua warna lewat token, bukan hex.
5. Setiap halaman harus bisa dipakai tanpa mouse.
6. Peta selalu punya alternatif teks.
7. Konten pengguna selalu melewati moderasi.
8. Cache diinvalidasi setelah mutasi.
9. Tidak ada barrel file.
10. Jika ragu, ikuti pola yang sudah ada di dokumen ini.
