import { ButtonLink } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CheckIcon,
  HeartHandshakeIcon,
} from "@/components/ui/icons";

const benefits = [
  "Publikasikan kegiatan inklusif",
  "Kelola pendaftar dalam satu tempat",
  "Jangkau relawan dari berbagai kota",
];

export function VolunteerOrganizerCta() {
  return (
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

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary-200">
              <HeartHandshakeIcon className="h-4 w-4" />
              Untuk komunitas & penyelenggara
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Punya kegiatan inklusif? Ajak lebih banyak orang ikut serta.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-primary-100">
              Daftarkan diri sebagai penyelenggara, publikasikan kegiatan, dan
              kelola pendaftar dalam satu tempat. Proses verifikasi membantu
              menjaga kualitas dan keamanan kegiatan.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            <ButtonLink
              href="/volunteer/jadi-penyelenggara"
              variant="inverse"
              size="lg"
            >
              Jadi Penyelenggara
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="#kegiatan" variant="outline-inverse" size="lg">
              Lihat kegiatan
            </ButtonLink>
          </div>
        </div>

        <ul className="relative mt-8 grid gap-3 border-t border-white/15 pt-6 text-sm text-primary-100 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-200" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
