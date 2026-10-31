# Arsitektur Rangkul

> **Status:** fondasi desain & arsitektur
> **Terakhir diperbarui:** 31 Oktober 2026
> **Dokumen produk:** [`docs/product.md`](./product.md)

Dokumen ini adalah sumber kebenaran untuk keputusan teknis, struktur folder, design system, dan rencana implementasi Rangkul. Semua agent dan kontributor wajib mengikuti aturan di sini agar tidak terjadi perbedaan pola.

---

## 1. Ringkasan Produk

Rangkul adalah platform komunitas yang menyatukan tiga hal:

1. **Informasi aksesibilitas tempat umum** sampai level pintu masuk.
2. **Direktori komunitas disabilitas dan inklusif** di Indonesia.
3. **Kegiatan volunteer inklusif** yang bisa diikuti langsung.

Data tempat dikumpulkan lewat crowdsourcing, dimoderasi dengan bantuan AI, dan diverifikasi admin untuk komunitas/penyelenggara.

### Prinsip teknis

| Prinsip | Konsekuensi teknis |
|---|---|
| Aksesibel sejak awal | WCAG 2.2 AA, keyboard-first, kontras teruji, target sentuh 44px, peta selalu punya alternatif teks |
| Detail lebih berguna daripada rating | Model data menyimpan fasilitas per pintu masuk, bukan hanya per tempat |
| Dibangun bersama komunitas | Semua konten pengguna melewati validasi + moderasi |
| Sederhana dulu | MVP fokus pada 3 fitur inti, tanpa over-engineering |
| Server sebagai sumber kebenaran | Otorisasi dan validasi selalu di server, bukan di client |

---

## 2. Stack & Versi

| Lapisan | Teknologi | Catatan |
|---|---|---|
| Framework | Next.js `16.4.3` | App Router, React Server Components |
| UI runtime | React `19.3.0` | |
| Bahasa | TypeScript `5.x` strict | `noEmit`, path alias `@/*` |
| Styling | Tailwind CSS `4.x` | Via `@tailwindcss/turbopack` |
| Database | Supabase Postgres | |
| ORM | Prisma | Runtime pakai pooled URL, migrasi pakai direct URL |
| Auth | Supabase Auth | `@supabase/ssr`, cookie-based |
| Storage | Supabase Storage | Foto tempat, logo komunitas, cover kegiatan |
| Peta | Leaflet + OpenStreetMap | Client-only, tanpa API key |
| Routing | OSRM + Leaflet Routing Machine | Instruksi arah aksesibel |
| UI primitives | Radix UI + Tailwind | Bukan shadcn penuh, komponen milik sendiri |
| Ikon | Lucide React | |
| Form | React Hook Form + Zod | Validasi ganda client & server |
| Tanggal | date-fns + locale `id` | Simpan UTC, tampilkan `Asia/Jakarta` |
| Export | ExcelJS | Export pendaftar kegiatan |

### Konfigurasi Next.js yang sudah aktif

`next.config.ts` sudah memakai:

```ts
cacheComponents: true
partialPrefetching: true
turbopack.rules["*.css"] = @tailwindcss/turbopack
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
- Memakai Radix untuk perilaku aksesibel (dialog, select, tabs, tooltip).
- Varian memakai `class-variance-authority`; penggabungan class memakai `cn()` (`clsx` + `tailwind-merge`).

Daftar primitif yang direncanakan:

`Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Field`, `Label`, `Badge`, `Card`, `Dialog`, `Sheet`, `Tabs`, `Accordion`, `Alert`, `Toast`, `Skeleton`, `Pagination`, `Breadcrumb`, `EmptyState`, `Avatar`, `Tooltip`, `Switch`, `Rating`, `FileDropzone`, `Stepper`.

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
| `/jelajahi` | `app/(public)/jelajahi/page.tsx` | Publik | Katalog tempat + filter + peta |
| `/jelajahi/[slug]` | `app/(public)/jelajahi/[slug]/page.tsx` | Publik | Detail tempat, pintu masuk, foto, ulasan |
| `/jelajahi/[slug]/navigasi` | `app/(public)/jelajahi/[slug]/navigasi/page.tsx` | Publik | Peta, pilihan pintu, petunjuk arah, panduan suara |
| `/komunitas` | `app/(public)/komunitas/page.tsx` | Publik | Direktori komunitas |
| `/komunitas/[slug]` | `app/(public)/komunitas/[slug]/page.tsx` | Publik | Profil komunitas |
| `/komunitas/daftar` | `app/(public)/komunitas/daftar/page.tsx` | Login | Formulir pendaftaran komunitas |
| `/volunteer` | `app/(public)/volunteer/page.tsx` | Publik | Daftar kegiatan |
| `/volunteer/[slug]` | `app/(public)/volunteer/[slug]/page.tsx` | Publik | Detail kegiatan + daftar |
| `/tambah-info` | `app/(public)/tambah-info/page.tsx` | Login | Formulir tempat baru |
| `/masuk` | `app/(auth)/masuk/page.tsx` | Guest | Login |
| `/daftar` | `app/(auth)/daftar/page.tsx` | Guest | Registrasi |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Organizer/Admin | Ringkasan penyelenggara |
| `/dashboard/kegiatan` | `app/(dashboard)/dashboard/kegiatan/page.tsx` | Organizer/Admin | Daftar kegiatan milik sendiri |
| `/dashboard/kegiatan/baru` | `app/(dashboard)/dashboard/kegiatan/baru/page.tsx` | Organizer/Admin | Buat kegiatan |
| `/dashboard/kegiatan/[id]/edit` | `app/(dashboard)/dashboard/kegiatan/[id]/edit/page.tsx` | Organizer/Admin | Edit kegiatan |
| `/dashboard/kegiatan/[id]/pendaftar` | `app/(dashboard)/dashboard/kegiatan/[id]/pendaftar/page.tsx` | Organizer/Admin | Tabel pendaftar + export Excel |
| `/admin` | `app/admin/page.tsx` | Admin | Antrean moderasi |
| `/admin/tempat` | `app/admin/tempat/page.tsx` | Admin | Moderasi tempat |
| `/admin/komunitas` | `app/admin/komunitas/page.tsx` | Admin | Verifikasi komunitas |
| `/admin/penyelenggara` | `app/admin/penyelenggara/page.tsx` | Admin | Verifikasi penyelenggara |
| `/admin/laporan` | `app/admin/laporan/page.tsx` | Admin | Laporan konten |
| `/api/health` | `app/api/health/route.ts` | Internal | Health check |
| `/api/moderasi` | `app/api/moderasi/route.ts` | Internal | Webhook moderasi (opsional) |

Aturan akses:

- **Guest** boleh menjelajah tempat, komunitas, dan kegiatan.
- **User** (login) boleh menambah tempat, memberi ulasan, mendaftar volunteer, dan mengajukan komunitas.
- **Organizer** (terverifikasi) boleh mengelola kegiatan dan mengekspor pendaftar.
- **Admin** boleh memoderasi konten, memverifikasi komunitas/penyelenggara, dan menangani laporan.

---

## 5. Struktur Folder

```text
app/
  layout.tsx                    # html lang="id", font, metadata, skip link
  globals.css                   # design tokens + base + components + utilities
  not-found.tsx
  error.tsx
  (public)/
    layout.tsx                  # SiteHeader + main#konten-utama + SiteFooter
    page.tsx
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
    tambah-info/page.tsx
  (auth)/
    layout.tsx                  # layout minimal tanpa header publik
    masuk/page.tsx
    daftar/page.tsx
  (dashboard)/
    dashboard/
      layout.tsx                # shell + sidebar + guard organizer
      page.tsx
      kegiatan/
        page.tsx
        baru/page.tsx
        [id]/edit/page.tsx
        [id]/pendaftar/page.tsx
  admin/
    layout.tsx                  # guard admin
    page.tsx
    tempat/page.tsx
    komunitas/page.tsx
    penyelenggara/page.tsx
    laporan/page.tsx
  api/
    health/route.ts
    moderasi/route.ts

components/
  ui/                           # primitif desain, tanpa data
  layout/                       # header, footer, nav, container, skip link
  places/                       # komponen domain tempat
  communities/                  # komponen domain komunitas
  volunteer/                    # komponen domain kegiatan
  admin/                        # komponen moderasi & verifikasi
  map/                          # Leaflet, marker, routing, fallback
  auth/                         # form auth, role badge
  feedback/                     # empty state, error state, skeleton

lib/
  db/prisma.ts                  # singleton Prisma
  supabase/
    server.ts                   # createServerClient + cookies
    client.ts                   # browser client
    admin.ts                    # service role (server-only)
    storage.ts                  # helper upload & URL
  auth/
    session.ts                  # getCurrentUser
    guards.ts                   # requireUser/requireOrganizer/requireAdmin
  validation/                   # skema Zod per domain
  moderation/                   # client AI + policy
  map/                          # konfigurasi tile, OSRM
  constants/                    # site config, nav, kategori, fitur
  utils/                        # cn, format tanggal, slug, pagination
  env.ts                        # validasi environment

server/
  places/queries.ts             # "use cache" + cacheTag
  places/actions.ts             # "use server" + auth + Zod + revalidate
  communities/queries.ts
  communities/actions.ts
  volunteer/queries.ts
  volunteer/actions.ts
  admin/queries.ts
  admin/actions.ts
  moderation/actions.ts

hooks/                          # client hooks saja
types/                          # tipe domain bersama
prisma/
  schema.prisma
  seed.ts
public/
  images/
  icons/
  og/
docs/
  product.md
  architecture.md
proxy.ts                        # refresh sesi Supabase (Next 16)
```

Struktur di atas sudah dibuat sebagai direktori kosong (tanpa `.gitkeep`). Ingat: Git tidak melacak folder kosong, jadi folder baru hanya akan muncul di riwayat commit setelah ada file pertama di dalamnya. Folder route tanpa `page.tsx` tidak menghasilkan URL, aman dibuat sejak awal.

Gunakan daftar ini sebagai peta saat menambahkan file: letakkan file di folder yang sama dengan tanggung jawabnya, dan jangan membuat folder baru tanpa alasan di `architecture.md`.

---

## 6. Aturan Dependensi

Arah dependensi hanya boleh satu arah:

```text
app/  →  server/  →  lib/  →  types/
 ↓          ↓
components/ ┘
```

Aturan konkret:

1. **`app/**/page.tsx`** hanya menyusun UI dan memanggil `server/<domain>/queries.ts`. Tidak boleh mengimpor Prisma.
2. **`components/ui/*`** tidak boleh mengimpor domain, `server/`, Prisma, atau Supabase. Hanya props, Tailwind, Radix.
3. **`components/<domain>/*`** boleh mengimpor `ui`, `lib/utils`, `types`, dan server action dari `server/<domain>/actions.ts`. Tidak boleh mengimpor query atau Prisma.
4. **`server/*`** boleh mengimpor `lib`, Prisma, dan `types`. Tidak boleh mengimpor komponen React.
5. **`lib/*`** harus framework-agnostic. Pengecualian: `lib/supabase/server.ts`, `lib/supabase/admin.ts`, dan `lib/db/prisma.ts` hanya untuk server bundle.
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
Client form (React Hook Form + Zod)
  └─ server/<domain>/actions.ts  ("use server")
       ├─ requireUser / requireOrganizer / requireAdmin
       ├─ Zod parse (sumber kebenaran)
       ├─ moderasi AI (fail-closed → PENDING)
       ├─ Prisma write
       └─ updateTag / revalidatePath → redirect
```

Setiap action mengembalikan `ActionResult<T>`:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
```

Jangan melempar error mentah ke client. Pesan error harus ramah pengguna dan tidak membocorkan detail internal.

### 7.3 Contoh action

```ts
"use server";

export async function createPlace(input: unknown): Promise<ActionResult<{ slug: string }>> {
  const user = await requireUser();
  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Periksa kembali data tempat.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const moderation = await moderateContent({ type: "place", text: parsed.data.description });
  const status = moderation.decision === "APPROVED" ? "PUBLISHED" : "PENDING";

  const place = await prisma.place.create({
    data: { ...parsed.data, status, createdById: user.id },
  });

  updateTag("places");
  updateTag(`place:${place.slug}`);
  redirect(`/jelajahi/${place.slug}`);
}
```

---

## 8. Caching & Revalidasi

Karena `cacheComponents: true`:

| Kebutuhan | Pola |
|---|---|
| Katalog tempat/komunitas/kegiatan | `"use cache"` + `cacheTag("places")` + `cacheLife("hours")` |
| Detail tempat | `"use cache"` + `cacheTag(\`place:${slug}\`)` + `cacheLife("days")` |
| Hasil filter/pencarian | Query request-time di dalam `<Suspense>`; boleh `"use cache"` dengan tag + `cacheLife("minutes")` |
| Dashboard/admin | Tanpa cache; bungkus bagian dinamis dengan `<Suspense>` |
| Setelah create/update/delete | `updateTag(tag)` untuk read-your-own-writes, atau `revalidateTag(tag, "max")` untuk background |
| Setelah perubahan yang memengaruhi banyak halaman | `revalidatePath("/jelajahi")` |

Tag yang disepakati:

```text
places
place:{slug}
communities
community:{slug}
events
event:{slug}
reviews:{placeId}
admin:moderation
admin:verifications
```

Aturan:

- Jangan memakai `export const dynamic/revalidate/fetchCache`.
- Jangan memanggil `cookies()`/`headers()` di dalam fungsi `"use cache"`.
- Jangan menyimpan data sensitif di cache publik.
- Jika route authenticated memblokir render instan, gunakan `<Suspense>`; `instant = false` hanya opsi terakhir dan harus didokumentasikan.

---

## 9. Auth & Otorisasi

### 9.1 Alur

1. Login/registrasi lewat Supabase Auth.
2. Sesi disimpan di cookie HTTP-only oleh `@supabase/ssr`.
3. `proxy.ts` me-refresh sesi pada request yang cocok.
4. `lib/auth/session.ts` memanggil `supabase.auth.getUser()` di server.
5. Profil aplikasi disimpan di tabel `Profile` dengan `id` = UUID Supabase Auth.
6. `ensureProfile()` membuat profil jika belum ada (dipanggil di layout authenticated atau callback).

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
- Guard mengembalikan user atau `redirect("/masuk?next=...")`.

```ts
export async function requireUser() { /* ... */ }
export async function requireOrganizer() { /* ... */ }
export async function requireAdmin() { /* ... */ }
```

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
| `Profile` | `id` (UUID auth), `name`, `role`, `avatarUrl`, `createdAt` |
| `Place` | `slug`, `name`, `category`, `description`, `address`, `city`, `province`, `lat`, `lng`, `status`, `createdById`, `ratingAvg`, `reviewCount` |
| `Entrance` | `placeId`, `label`, `lat`, `lng`, `photoUrl`, `isMain`, `notes` |
| `AccessibilityFeature` | `key`, `label`, `category`, `icon` |
| `EntranceFeature` | `entranceId`, `featureId`, `value` (`AVAILABLE/NOT_AVAILABLE/UNKNOWN`), `notes` |
| `PlacePhoto` | `placeId`, `url`, `alt`, `order` |
| `Review` | `placeId`, `authorId`, `rating` (1–5), `body`, `status` |
| `Community` | `slug`, `name`, `description`, `province`, `city`, `focus[]`, `contact`, `socials`, `joinUrl`, `logoUrl`, `status`, `ownerId`, `verifiedAt` |
| `VolunteerEvent` | `slug`, `organizerId`, `communityId?`, `title`, `description`, `category`, `location`, `lat`, `lng`, `startsAt`, `endsAt`, `requirements`, `slots`, `status` |
| `EventRegistration` | `eventId`, `userId`, `name`, `email`, `phone`, `accessibilityNeeds`, `status`; unik `(eventId, userId)` |
| `VerificationRequest` | `type` (`COMMUNITY/ORGANIZER`), `payload`, `status`, `reviewedById`, `reviewedAt` |
| `Report` | `reporterId`, `targetType`, `targetId`, `reason`, `status` |
| `ModerationLog` | `contentType`, `contentId`, `provider`, `score`, `labels`, `decision`, `reviewedById`, `createdAt` |

### 10.2 Relasi

```text
Profile 1─* Place
Place   1─* Entrance 1─* EntranceFeature *─1 AccessibilityFeature
Place   1─* PlacePhoto
Place   1─* Review *─1 Profile
Profile 1─* Community (owner)
Community 1─* VolunteerEvent
Profile 1─* VolunteerEvent (organizer)
VolunteerEvent 1─* EventRegistration *─1 Profile
Profile 1─* VerificationRequest
Profile 1─* Report
```

### 10.3 Status konten

| Entitas | Status |
|---|---|
| `Place` | `PENDING`, `PUBLISHED`, `REJECTED`, `ARCHIVED` |
| `Review` | `PENDING`, `PUBLISHED`, `REJECTED` |
| `Community` | `PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED` |
| `VolunteerEvent` | `DRAFT`, `PENDING`, `PUBLISHED`, `CLOSED`, `REJECTED` |
| `EventRegistration` | `PENDING`, `CONFIRMED`, `CANCELLED` |
| `Report` | `OPEN`, `REVIEWING`, `RESOLVED`, `DISMISSED` |

### 10.4 Aturan data

- Semua ID memakai `uuid` atau `cuid`; jangan auto-increment yang bisa ditebak.
- `slug` unik dan stabil; jangan berubah setelah publikasi tanpa redirect.
- Simpan waktu dalam UTC (`timestamptz`).
- Rating agregat dihitung ulang setelah review dipublikasikan.
- `EntranceFeature` adalah sumber kebenaran untuk filter fasilitas. Jangan menyimpan duplikasi daftar fasilitas di `Place` kecuali sebagai cache agregat yang punya mekanisme sinkronisasi.
- Hapus data memakai soft delete (`archivedAt`) untuk konten publik.

---

## 11. Upload & Storage

Bucket Supabase Storage:

| Bucket | Isi | Akses |
|---|---|---|
| `place-photos` | foto tempat & pintu masuk | public read, authenticated write |
| `community-logos` | logo komunitas | public read, authenticated write |
| `event-covers` | cover kegiatan | public read, authenticated write |

Alur upload (menghindari limit body server action):

```text
1. Client minta signed upload URL → server action (guard + validasi tipe/ukuran)
2. Client upload langsung ke Supabase Storage
3. Client kirim URL + alt text → server action simpan record
4. Server action revalidate cache terkait
```

Aturan:

- Format: JPEG, PNG, WebP. **Tidak menerima SVG.**
- Ukuran maksimal 5MB per file.
- Nama file acak: `{userId}/{uuid}.{ext}`.
- Alt text wajib untuk foto konten; foto dekoratif `alt=""`.
- Validasi MIME di server, bukan hanya `accept` di input.
- Jangan pernah mengekspos service role key ke client.
- Bersihkan file yatim secara berkala (cron/edge function).

---

## 12. Moderasi AI

### 12.1 Tujuan

Menyaring konten pengguna (tempat, ulasan, komunitas, kegiatan) dari spam, konten tidak senonoh, ujaran kebencian, dan potensi pelanggaran hukum. Proses berjalan di belakang layar dan tidak ditampilkan ke pengguna.

### 12.2 Kontrak

```ts
type ModerationInput = {
  type: "place" | "review" | "community" | "event";
  text: string;
  images?: string[];
};

type ModerationResult = {
  decision: "APPROVED" | "PENDING" | "REJECTED";
  score: number;
  labels: string[];
  reason?: string;
  provider: string;
};
```

Implementasi di `lib/moderation/client.ts` dengan antarmuka provider-agnostic. Provider dipilih lewat env.

### 12.3 Aturan

- **Fail-closed:** timeout, error jaringan, atau respons tidak valid → `PENDING`.
- Moderasi berjalan **sebelum** konten dipublikasikan.
- `APPROVED` → status publikasi; `PENDING`/`REJECTED` → masuk antrean admin.
- Admin bisa override keputusan; semua override dicatat di `ModerationLog`.
- Jangan menampilkan alasan moderasi mentah ke pengguna.
- Rate limit submission untuk mencegah spam (lihat risiko terbuka).
- Moderasi bukan pengganti verifikasi admin untuk komunitas/penyelenggara.

---

## 13. Peta & Routing

### 13.1 Stack

- **Leaflet** + **react-leaflet** untuk peta.
- **OpenStreetMap** sebagai tile sumber.
- **OSRM** + **Leaflet Routing Machine** untuk rute.
- Semua komponen peta adalah client component dan di-`dynamic import` dengan `ssr: false` jika perlu.

### 13.2 Aturan

- Peta tidak boleh menjadi satu-satunya cara mengakses informasi. Selalu sediakan:
  - daftar lokasi di samping/bawah peta,
  - petunjuk arah dalam teks,
  - koordinat yang bisa dibaca screen reader.
- Marker harus punya label aksesibel dan bisa difokuskan keyboard.
- `aria-label` pada container peta, mis. “Peta lokasi tempat, gunakan daftar lokasi di bawah untuk alternatif”.
- Jangan memakai `role="application"` kecuali benar-benar perlu.
- Tampilkan legenda: rute aksesibel (teal), rute tidak aksesibel (merah), titik masuk (ikon).
- Jika tile gagal dimuat, tampilkan fallback daftar + tautan ke OSM.
- Simpan `lat`/`lng` sebagai `Decimal` atau `Float` dengan presisi 6 desimal.

### 13.3 Produksi

- Tile OSM publik hanya untuk pengembangan. Untuk produksi, gunakan tile provider yang sesuai kebijakan penggunaan.
- OSRM demo publik punya rate limit. Untuk produksi, self-host OSRM atau gunakan provider berbayar.
- Simpan URL tile/OSRM di env agar mudah diganti.

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

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Prisma)
# Runtime: pooled connection (port 6543, pgbouncer)
DATABASE_URL=
# Migrasi: direct connection (port 5432)
DIRECT_URL=

# Moderasi AI
MODERATION_PROVIDER=
MODERATION_API_KEY=

# Peta & routing
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_OSRM_URL=https://router.project-osrm.org
```

Aturan:

- Hanya variabel `NEXT_PUBLIC_*` yang boleh dipakai di client.
- `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, dan `MODERATION_API_KEY` hanya di server.
- `lib/env.ts` memvalidasi env dengan Zod saat boot; jangan membaca `process.env` langsung di banyak tempat.
- Jangan commit `.env.local`.

---

## 16. Setup & Perintah

### 16.1 Prasyarat

- Node.js 20.9+ (sesuaikan dengan requirement Next 16)
- npm
- Akun Supabase + project
- PostgreSQL via Supabase

### 16.2 Perintah yang direncanakan

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

Script `typecheck`, `db:*` belum ada dan akan ditambahkan saat implementasi data layer.

### 16.3 Urutan setup lokal

1. `npm install`
2. Salin `.env.example` → `.env.local`, isi kredensial Supabase.
3. `npx prisma generate`
4. `npx prisma migrate dev`
5. `npm run db:seed`
6. `npm run dev`
7. Buka `http://localhost:3000`

---

## 17. Rencana Implementasi

### Status fondasi saat ini

| Item | Status |
|---|---|
| `docs/architecture.md` | ✅ selesai |
| Token desain di `app/globals.css` | ✅ selesai |
| Font & metadata di `app/layout.tsx` | ✅ selesai |
| Skip link + landmark dasar | ✅ selesai |
| Kerangka folder | ✅ selesai (direktori kosong, tanpa `.gitkeep`) |
| Dependency (Prisma, Supabase, Leaflet, dll.) | ⏳ belum |
| `lib/env.ts` + `.env.example` | ⏳ belum |
| Skema Prisma + seed | ⏳ belum |
| Komponen UI inti | ⏳ belum |
| Halaman fitur | ⏳ belum |
| Moderasi AI | ⏳ belum |

### Fase 0 — Fondasi desain & arsitektur (sekarang)

**Deliverable:**

- Dokumen arsitektur.
- Token warna, font, spacing, radius, shadow, motion.
- Root layout dengan font, metadata, `lang="id"`, skip link.
- Kerangka folder.

**Selesai jika:** `npm run dev` menampilkan halaman placeholder dengan font dan warna yang benar; `npm run lint` lolos.

### Fase 1 — Tooling & data layer

**Deliverable:**

- Install dependency inti.
- `lib/env.ts` + `.env.example`.
- `prisma/schema.prisma` (semua entitas MVP).
- `lib/db/prisma.ts`, `lib/supabase/{server,client,admin}.ts`.
- `proxy.ts` untuk refresh sesi.
- `lib/auth/{session,guards}.ts`.
- Seed data: fitur aksesibilitas, kategori, contoh tempat/komunitas/kegiatan, admin.
- Script `typecheck`, `db:*`.

**Selesai jika:** migrasi berhasil, seed berjalan, login Supabase menghasilkan `Profile`, guard menolak akses tanpa role.

### Fase 2 — UI kit & layout

**Deliverable:**

- `cn()` + varian `cva`.
- Primitif: Button, Input, Textarea, Select, Checkbox, RadioGroup, Field, Badge, Card, Dialog, Sheet, Alert, Skeleton, EmptyState, Pagination, Rating.
- `SiteHeader`, `SiteFooter`, `MobileNav`, `Container`, `PageHeader`, `DashboardShell`.
- Halaman error/not-found/loading.
- Audit keyboard + kontras.

**Selesai jika:** semua primitif punya state focus/hover/disabled/error; lolos audit keyboard; tidak ada hex langsung di komponen.

### Fase 3 — Tempat & peta

**Deliverable:**

- `/jelajahi`: grid + filter kategori/fasilitas/wilayah + peta + daftar alternatif.
- `/jelajahi/[slug]`: detail, galeri, fasilitas per pintu, ulasan.
- `/tambah-info`: form bertahap, location picker, upload foto, rating opsional.
- Map shell Leaflet + marker + popup.
- Routing OSRM + Leaflet Routing Machine + instruksi teks.
- Query `use cache` + tag `places`.

**Selesai jika:** pengguna bisa mencari tempat, melihat pintu ber-ramp, menambah tempat, dan mendapatkan rute; peta punya fallback daftar.

### Fase 4 — Komunitas

**Deliverable:**

- `/komunitas`: direktori + filter wilayah/fokus.
- `/komunitas/[slug]`: profil + kontak + sosial + kegiatan terkait.
- `/komunitas/daftar`: form + upload logo.
- Admin verifikasi komunitas.
- Tag `communities`.

**Selesai jika:** komunitas baru berstatus `PENDING`, admin bisa verifikasi, dan hanya komunitas `VERIFIED` yang tampil publik.

### Fase 5 — Volunteer & dashboard

**Deliverable:**

- `/volunteer`: daftar + filter kategori/wilayah/waktu.
- `/volunteer/[slug]`: detail + form daftar.
- `/dashboard`: ringkasan kegiatan.
- CRUD kegiatan untuk organizer.
- Tabel pendaftar + export Excel.
- Guard organizer.

**Selesai jika:** organizer hanya bisa mengelola kegiatannya sendiri; pendaftar unik per kegiatan; export berisi kolom yang benar.

### Fase 6 — Admin & moderasi AI

**Deliverable:**

- `/admin`: antrean moderasi.
- Verifikasi komunitas/penyelenggara.
- Laporan konten.
- Integrasi provider moderasi + fallback `PENDING`.
- `ModerationLog` + audit override.
- Rate limit submission.

**Selesai jika:** konten berisiko tidak tayang otomatis; admin bisa approve/reject dengan catatan; semua keputusan tercatat.

### Fase 7 — Polish & peluncuran

**Deliverable:**

- Audit WCAG 2.2 AA (axe + manual keyboard + screen reader).
- Optimasi gambar & font.
- Metadata/OG image per halaman.
- `sitemap.ts`, `robots.ts`.
- Uji responsif 360px–1440px.
- Uji performa (Lighthouse).
- Dokumentasi operasional (deploy, backup, env).

**Selesai jika:** Lighthouse accessibility ≥ 95, tidak ada pelanggaran kontras, build production bersih, dan alur utama bisa diselesaikan dengan keyboard saja.

---

## 18. Definition of Done

Setiap PR/fitur dianggap selesai jika:

- [ ] `npm run lint` lolos.
- [ ] `npm run typecheck` lolos.
- [ ] `npm run build` lolos.
- [ ] Tidak ada `any` baru.
- [ ] Otorisasi dicek di server, bukan hanya UI.
- [ ] Input divalidasi dengan Zod di server.
- [ ] Ada state loading, empty, error, dan success.
- [ ] Bisa dipakai dengan keyboard saja.
- [ ] Kontras teks dan UI lolos WCAG AA.
- [ ] Target sentuh ≥ 44px.
- [ ] Responsif di 360px dan 1440px.
- [ ] Cache tag diinvalidasi setelah mutasi.
- [ ] Tidak ada secret di client bundle.
- [ ] Dokumentasi diperbarui jika mengubah arsitektur/token.

---

## 19. Risiko & Keputusan Terbuka

| Topik | Status | Catatan |
|---|---|---|
| Provider moderasi AI | Terbuka | Antarmuka disiapkan; provider dipilih saat implementasi |
| Tile peta produksi | Terbuka | OSM publik hanya untuk dev; perlu provider/self-host |
| OSRM produksi | Terbuka | Demo publik punya rate limit |
| Rate limiting | Terbuka | Perlu Upstash/Redis atau edge function |
| Notifikasi email | Terbuka | Supabase Auth email vs Resend |
| Export Excel | Diputuskan | ExcelJS di server |
| Dark mode | Ditunda | Light-first; high contrast + forced-colors didukung |
| Login untuk daftar komunitas | Diputuskan | Wajib login agar kepemilikan bisa diverifikasi |
| Login untuk tambah tempat | Diputuskan | Wajib login untuk mencegah spam |
| Pencarian teks | Terbuka | Postgres `ILIKE` dulu; pertimbangkan full-text/trigram |
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
