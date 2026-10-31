import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import {
  AccessibilityIcon,
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  DoorIcon,
  HeartHandshakeIcon,
  MapPinIcon,
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
      "Cari tempat berdasarkan fasilitas yang benar-benar kamu butuhkan, bukan sekadar label “ramah disabilitas”.",
    points: [
      "Filter ramp, lift, toilet aksesibel, dan guiding block",
      "Info sampai pintu masuk mana yang bisa dilewati",
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
    title: "Ubah niat baik jadi aksi nyata",
    description:
      "Temukan kegiatan yang benar-benar membutuhkan tenaga dan keahlianmu, lalu daftar langsung di platform.",
    points: [
      "Pendampingan acara, pendataan aksesibilitas, dan kegiatan sosial",
      "Penyandang disabilitas didorong ikut sebagai peserta maupun relawan",
    ],
    action: { href: "/daftar", label: "Jadi relawan" },
  },
];

const entrances = [
  {
    name: "Pintu Utara",
    detail: "Ramp landai, pintu otomatis, lebar 90 cm.",
    accessible: true,
    main: true,
  },
  {
    name: "Pintu Selatan",
    detail: "Tiga anak tangga, tanpa ramp. Alternatif terdekat 40 meter.",
    accessible: false,
    main: false,
  },
  {
    name: "Pintu Samping",
    detail: "Ramp tersedia, jalur ke lift utama sekitar 15 meter.",
    accessible: true,
    main: false,
  },
];

const trust = [
  {
    icon: SparklesIcon,
    title: "Moderasi berbantuan AI",
    description:
      "Konten yang berisiko ditahan untuk ditinjau admin sebelum tayang.",
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
              <SparklesIcon className="h-4 w-4" />
              Platform komunitas inklusif
            </p>

            <h1 className="mt-6 max-w-3xl text-display-sm font-bold tracking-tight text-ink sm:text-display">
              Membantu sesama,
              <br />
              <span className="text-primary-700">ruang untuk semua.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              Temukan tempat yang benar-benar bisa diakses, kenali komunitas di
              sekitarmu, dan ikut kegiatan volunteer yang inklusif. Semuanya
              dalam satu platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/jelajahi" size="lg">
                Jelajahi tempat
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/daftar" variant="secondary" size="lg">
                Jadi relawan
              </ButtonLink>
            </div>

            <ul className="mt-10 grid max-w-xl gap-4 border-t border-line pt-6 text-sm sm:grid-cols-3">
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <span>
                  <strong className="block font-semibold text-ink">
                    Level pintu
                  </strong>
                  <span className="text-ink-muted">Bukan cuma bangunan</span>
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

            <figure className="relative overflow-hidden rounded-sheet border border-line bg-surface shadow-lifted">
              <div className="relative h-44 overflow-hidden bg-primary-50">
                <svg
                  viewBox="0 0 480 220"
                  className="h-full w-full"
                  aria-hidden="true"
                >
                  <rect
                    width="480"
                    height="220"
                    fill="var(--color-primary-50)"
                  />
                  <path
                    d="M-20 170C80 150 120 90 220 100s150 70 280 40"
                    stroke="var(--color-primary-200)"
                    strokeWidth="26"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M60 -20c20 70 60 110 40 260"
                    stroke="var(--color-primary-100)"
                    strokeWidth="18"
                    fill="none"
                  />
                  <path
                    d="M300 -20c-20 80 60 120 40 260"
                    stroke="var(--color-primary-100)"
                    strokeWidth="14"
                    fill="none"
                  />
                  <path
                    d="M0 60h480M0 140h480"
                    stroke="var(--color-line)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />
                  <circle
                    cx="300"
                    cy="96"
                    r="34"
                    fill="var(--color-primary-600)"
                    opacity="0.12"
                  />
                  <circle
                    cx="300"
                    cy="96"
                    r="18"
                    fill="var(--color-primary-600)"
                    opacity="0.2"
                  />
                  <circle
                    cx="300"
                    cy="96"
                    r="7"
                    fill="var(--color-primary-600)"
                    stroke="var(--color-surface)"
                    strokeWidth="3"
                  />
                </svg>
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-primary-800 shadow-xs">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-primary-600"
                  />
                  Contoh tampilan
                </span>
              </div>

              <figcaption className="p-5 sm:p-6">
                <div className="flex items-center gap-1.5 text-sm text-ink-muted">
                  <MapPinIcon className="h-4 w-4 text-primary-700" />
                  Jakarta Pusat
                </div>

                <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xl font-semibold text-ink">Taman Kota</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700">
                    <CheckIcon className="h-3.5 w-3.5" />
                    Bisa diakses
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Pintu utara punya ramp landai dan pintu otomatis. Jalur ke
                  toilet aksesibel tersedia tanpa tangga.
                </p>

                <ul
                  className="mt-4 flex flex-wrap gap-2"
                  aria-label="Fasilitas contoh"
                >
                  {["Ramp", "Pintu otomatis", "Toilet aksesibel"].map(
                    (facility) => (
                      <li
                        key={facility}
                        className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800"
                      >
                        {facility}
                      </li>
                    ),
                  )}
                </ul>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                  <div>
                    <span className="block text-xs text-ink-muted">
                      Pintu terdekat
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 font-medium text-ink">
                      <DoorIcon className="h-4 w-4 text-primary-700" />
                      Utara
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-ink-muted">Jalur</span>
                    <span className="mt-0.5 flex items-center gap-1.5 font-medium text-ink">
                      <RouteIcon className="h-4 w-4 text-primary-700" />
                      Ramp landai
                    </span>
                  </div>
                </div>
              </figcaption>
            </figure>

            <div className="absolute -left-4 top-24 hidden rounded-card border border-line bg-surface p-3 shadow-card sm:block">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary-100 text-secondary-700">
                  <AccessibilityIcon className="h-4 w-4" />
                </span>
                <span>
                  <strong className="block text-sm font-semibold text-ink">
                    3 alternatif pintu
                  </strong>
                  <span className="text-xs text-ink-muted">
                    Pilih yang paling mudah
                  </span>
                </span>
              </div>
            </div>
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
            Informasi, komunitas, dan aksi sosial saling terhubung. Kamu bisa
            mulai dari mana saja.
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
              Satu bangunan bisa punya beberapa pintu dengan kondisi berbeda.
              Rangkul mencatat fasilitas sampai level pintu masuk, supaya kamu
              tidak perlu menebak atau baru tahu setelah sampai.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Tahu pintu mana yang ber-ramp dan pintu mana yang harus dihindari.",
                "Lihat kondisi jalur, lift, toilet, dan parkir sebelum berangkat.",
                "Dapatkan arahan ke pintu yang paling sesuai dengan kebutuhanmu.",
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
              Data berasal dari kontribusi pengguna dan melewati moderasi sebelum
              ditampilkan.
            </p>
          </div>

          <div className="rounded-sheet border border-line bg-surface p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="text-xs text-ink-muted">Contoh daftar pintu</p>
                <h3 className="mt-0.5 text-lg font-semibold text-ink">
                  Taman Kota
                </h3>
              </div>
              <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
                3 pintu
              </span>
            </div>

            <ul className="divide-y divide-line">
              {entrances.map((entrance) => (
                <li key={entrance.name} className="flex gap-3 py-4">
                  <span
                    className={[
                      "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full",
                      entrance.accessible
                        ? "bg-success-50 text-success-700"
                        : "bg-danger-50 text-danger-700",
                    ].join(" ")}
                  >
                    {entrance.accessible ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <AlertIcon className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">{entrance.name}</p>
                      {entrance.main ? (
                        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-800">
                          Utama
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {entrance.detail}
                    </p>
                    <p
                      className={[
                        "mt-1 text-xs font-medium",
                        entrance.accessible
                          ? "text-success-700"
                          : "text-danger-700",
                      ].join(" ")}
                    >
                      {entrance.accessible ? "Bisa diakses" : "Ada hambatan"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-card bg-primary-50 p-4 text-sm text-primary-900">
              <p className="flex items-start gap-2">
                <RouteIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong className="font-semibold">Rute disarankan:</strong>{" "}
                  gunakan Pintu Utara, lalu ikuti jalur ramp ke lift utama.
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
              Data dari komunitas, dijaga bersama.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              Karena kontennya berasal dari pengguna, kualitas dan keamanan
              dijaga lewat moderasi, verifikasi, dan mekanisme pelaporan.
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
              Ruang yang lebih ramah dimulai dari satu kontribusi.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-100">
              Tambahkan info tempat, perkenalkan komunitasmu, atau ikut kegiatan
              volunteer. Setiap detail membantu orang lain berangkat dengan
              lebih percaya diri.
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
