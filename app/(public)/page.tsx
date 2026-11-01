import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import {
  AccessibilityIcon,
  ArrowRightIcon,
  CheckIcon,
  HeartHandshakeIcon,
  MapPinIcon,
  NavigationIcon,
  RouteIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/ui/icons";

const features = [
  {
    id: "jelajahi",
    icon: MapPinIcon,
    eyebrow: "Informasi & navigasi",
    title: "Tahu medan sebelum berangkat",
    description:
      "Cari tempat yang benar-benar bisa dipakai penyandang disabilitas, bukan sekadar label “ramah disabilitas” di brosur.",
    points: [
      "Filter ramp, lift, toilet aksesibel, dan guiding block",
      "Satu postingan mewakili satu lokasi dengan titik peta yang jelas",
    ],
    action: { href: "/jelajahi", label: "Mulai jelajahi" },
  },
  {
    id: "komunitas",
    icon: UsersIcon,
    eyebrow: "Direktori komunitas",
    title: "Temukan orang yang satu frekuensi",
    description:
      "Jelajahi komunitas disabilitas dan inklusif dari berbagai daerah, lengkap dengan fokus kegiatan dan kontak.",
    points: [
      "Filter berdasarkan wilayah dan fokus kegiatan",
      "Profil komunitas dengan tautan gabung yang jelas",
    ],
    action: { href: "/komunitas", label: "Jelajahi komunitas" },
  },
  {
    id: "volunteer",
    icon: HeartHandshakeIcon,
    eyebrow: "Volunteer inklusif",
    title: "Aksi nyata untuk inklusi disabilitas",
    description:
      "Temukan kegiatan yang benar-benar membutuhkan tenaga dan keahlianmu — termasuk mendampingi penyandang disabilitas — lalu daftar langsung di platform.",
    points: [
      "Pendampingan acara, pendataan aksesibilitas, dan kegiatan sosial",
      "Penyandang disabilitas didorong ikut sebagai peserta maupun relawan",
    ],
    action: { href: "/daftar", label: "Jadi relawan" },
  },
];

const trust = [
  {
    icon: SparklesIcon,
    title: "Kontribusi komunitas",
    description:
      "Informasi tempat berasal dari pengalaman pengguna dan bisa diperbarui.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Verifikasi admin",
    description:
      "Komunitas dan penyelenggara kegiatan diverifikasi sebelum tampil.",
  },
  {
    icon: AccessibilityIcon,
    title: "Aksesibel sejak awal",
    description:
      "Kontras, navigasi keyboard, label jelas, dan target sentuh yang nyaman.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-100/80 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-secondary-100/60 blur-3xl"
        />

        <div className="container-page relative grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1.5 text-sm font-medium text-primary-800">
              <AccessibilityIcon className="h-4 w-4" />
              Platform aksesibilitas untuk penyandang disabilitas
            </p>

            <h1 className="mt-6 max-w-3xl text-display-sm font-bold tracking-tight text-ink sm:text-display">
              Aksesibilitas nyata,
              <br />
              <span className="text-primary-700">
                untuk penyandang disabilitas.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              Rangkul membantu penyandang disabilitas — termasuk pengguna kursi
              roda serta disabilitas netra, rungu, dan intelektual — bersama
              keluarga dan pendampingnya untuk menemukan tempat yang benar-benar
              bisa dipakai, komunitas yang tepat, dan kegiatan volunteer
              inklusif. Semuanya dalam satu platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/jelajahi" size="lg">
                Jelajahi tempat
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/volunteer" variant="secondary" size="lg">
                Jadi relawan
              </ButtonLink>
            </div>

            <ul className="mt-10 grid max-w-xl gap-4 border-t border-line pt-6 text-sm sm:grid-cols-3">
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <span>
                  <strong className="block font-semibold text-ink">
                    Satu lokasi
                  </strong>
                  <span className="text-ink-muted">Satu titik peta</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <span>
                  <strong className="block font-semibold text-ink">
                    Data komunitas
                  </strong>
                  <span className="text-ink-muted">Dikurasi bersama</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <span>
                  <strong className="block font-semibold text-ink">
                    Gratis
                  </strong>
                  <span className="text-ink-muted">Untuk semua orang</span>
                </span>
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[2rem] bg-primary-100/60 blur-2xl"
            />

            <figure className="relative overflow-hidden rounded-sheet border border-line bg-surface p-6 shadow-lifted sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800">
                <NavigationIcon className="h-3.5 w-3.5" />
                Navigasi live
              </span>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink">
                Dari lokasi kamu, langsung ke tujuan.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Titik awal diambil otomatis dari GPS perangkat, jadi tidak ada
                titik contoh yang perlu diisi manual.
              </p>

              <ol className="mt-6 space-y-4">
                {[
                  {
                    icon: MapPinIcon,
                    title: "Izinkan lokasi",
                    description:
                      "Rute dihitung dari posisi kamu saat halaman navigasi dibuka.",
                  },
                  {
                    icon: RouteIcon,
                    title: "Ikuti garis biru",
                    description:
                      "Peta mengikuti pergerakan dan menghitung ulang bila kamu keluar jalur.",
                  },
                  {
                    icon: NavigationIcon,
                    title: "Sampai tujuan",
                    description:
                      "Jarak, estimasi waktu, dan petunjuk arah diperbarui selama perjalanan.",
                  },
                ].map((step) => {
                  const Icon = step.icon;
                  return (
                    <li key={step.title} className="flex gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {step.title}
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <p className="mt-6 rounded-card bg-primary-50 p-4 text-sm leading-relaxed text-primary-900">
                Buka halaman detail tempat mana pun, lalu pilih{" "}
                <strong className="font-semibold">
                  Navigasi ke lokasi ini
                </strong>
                .
              </p>
            </figure>
          </div>
        </div>
      </section>

      <section
        id="fitur"
        className="container-page scroll-mt-24 py-16 lg:py-24"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
            Tiga hal dalam satu tempat
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Mulai dari kebutuhanmu, bukan dari daftar fitur.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            Dibuat untuk penyandang disabilitas dan orang-orang yang
            mendukungnya. Informasi, komunitas, dan aksi sosial saling
            terhubung, jadi kamu bisa mulai dari mana saja.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.id}
                id={feature.id}
                className="group flex scroll-mt-24 flex-col rounded-card border border-line bg-surface p-6 shadow-xs transition-shadow hover:shadow-card"
              >
                <span className="grid h-11 w-11 place-items-center rounded-button bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  {feature.eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {feature.description}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-ink-muted"
                    >
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={feature.action.href}
                  className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline"
                >
                  {feature.action.label}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="detail"
        className="scroll-mt-24 border-y border-line bg-surface-muted/60"
      >
        <div className="container-page grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
              Detail yang membuat perbedaan
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Bukan sekadar label “aksesibel”.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              Satu postingan mewakili satu lokasi. Rangkul menyimpan foto,
              fasilitas, dan titik peta yang bisa langsung dipakai penyandang
              disabilitas untuk navigasi, supaya kamu tahu kondisi tempat
              sebelum berangkat.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Lihat foto dan fasilitas yang tersedia di lokasi.",
                "Buka navigasi langsung dari halaman detail tempat.",
                "Ikuti rute live dari lokasi perangkatmu, tanpa titik awal manual.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-primary-800">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-ink-muted">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 flex items-start gap-2.5 rounded-card border border-line bg-surface p-4 text-sm text-ink-muted">
              <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
              Informasi berasal dari kontributor. Kondisi lokasi bisa berubah,
              jadi tetap periksa situasi terkini saat tiba.
            </p>
          </div>

          <div className="rounded-sheet border border-line bg-surface p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="text-xs text-ink-muted">Isi satu postingan</p>
                <h3 className="mt-0.5 text-lg font-semibold text-ink">
                  Informasi yang bisa kamu pakai
                </h3>
              </div>
              <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
                1 lokasi
              </span>
            </div>

            <ul className="divide-y divide-line">
              {[
                "Foto lokasi dan catatan kondisi dari kontributor.",
                "Fasilitas seperti ramp, lift, toilet aksesibel, dan guiding block.",
                "Titik peta yang langsung terhubung ke navigasi live.",
              ].map((item) => (
                <li key={item} className="flex gap-3 py-4">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success-50 text-success-700">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    {item}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-card bg-primary-50 p-4 text-sm text-primary-900">
              <p className="flex items-start gap-2">
                <RouteIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong className="font-semibold">Rute live:</strong> buka
                  navigasi dan biarkan aplikasi menghitung jalur dari lokasimu.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="tentang"
        className="container-page scroll-mt-24 py-16 lg:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
              Kepercayaan & keamanan
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Data dari komunitas, diperbarui bersama.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              Karena kontennya berasal dari pengguna, setiap detail bisa
              dilengkapi dan diperbarui oleh orang yang benar-benar datang ke
              lokasi.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {trust.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-card border border-line bg-surface p-5 shadow-xs"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-button bg-secondary-50 text-secondary-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page pb-16 lg:pb-24">
        <div className="relative overflow-hidden rounded-sheet bg-primary-900 px-6 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[24px] border-white/5"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-24 h-52 w-52 rounded-full border-[20px] border-white/5"
          />

          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ruang yang lebih ramah disabilitas dimulai dari satu kontribusi.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-100">
              Tambahkan info tempat aksesibel, perkenalkan komunitas
              disabilitasmu, atau ikut kegiatan volunteer inklusif. Setiap
              detail membantu penyandang disabilitas berangkat dengan lebih
              percaya diri.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/daftar" variant="inverse" size="lg">
                Buat akun
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/masuk" variant="outline-inverse" size="lg">
                Sudah punya akun? Masuk
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
