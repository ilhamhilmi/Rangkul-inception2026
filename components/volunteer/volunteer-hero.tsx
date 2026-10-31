import { ButtonLink } from "@/components/ui/button";
import {
  AccessibilityIcon,
  ArrowRightIcon,
  HeartHandshakeIcon,
  MapPinIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { formatEventShortDate, getQuotaStatus } from "@/lib/volunteer/format";
import type { VolunteerEvent } from "@/types/volunteer";

type VolunteerHeroProps = {
  eventCount: number;
  cityCount: number;
  categoryCount: number;
  featuredEvent: VolunteerEvent;
};

export function VolunteerHero({
  eventCount,
  cityCount,
  categoryCount,
  featuredEvent,
}: VolunteerHeroProps) {
  const quota = getQuotaStatus(featuredEvent);

  return (
    <section
      aria-labelledby="volunteer-title"
      className="relative overflow-hidden border-b border-line bg-surface"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary-100/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 left-1/4 h-72 w-72 rounded-full bg-secondary-100/50 blur-3xl"
      />

      <div className="container-page relative grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1.5 text-sm font-medium text-primary-800">
            <HeartHandshakeIcon className="h-4 w-4" />
            Volunteer inklusif
          </p>

          <h1
            id="volunteer-title"
            className="mt-6 max-w-3xl text-display-sm font-bold tracking-tight text-ink sm:text-display"
          >
            Waktu dan tenagamu bisa membuka{" "}
            <span className="text-primary-700">ruang yang lebih ramah.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            Temukan kegiatan sosial, pendampingan acara, dan pendataan
            aksesibilitas yang sesuai dengan minatmu. Setiap kontribusi membantu
            lebih banyak orang berpartisipasi dengan percaya diri.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#kegiatan" size="lg">
              Jelajahi kegiatan
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="/volunteer/jadi-penyelenggara"
              variant="secondary"
              size="lg"
            >
              Jadi penyelenggara
            </ButtonLink>
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-6">
            <div>
              <dt className="text-xs text-ink-muted">Kegiatan aktif</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
                {eventCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Kota</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
                {cityCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">Kategori</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
                {categoryCount}
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-[2rem] bg-primary-100/60 blur-2xl"
          />

          <div className="relative overflow-hidden rounded-sheet border border-line bg-surface shadow-lifted">
            <div className="relative grid h-56 place-items-center overflow-hidden bg-primary-50">
              <div
                aria-hidden="true"
                className="absolute h-44 w-44 rounded-full border-[20px] border-primary-100"
              />
              <div
                aria-hidden="true"
                className="absolute h-32 w-32 rounded-full bg-primary-100"
              />
              <div
                aria-hidden="true"
                className="absolute left-8 top-9 h-3 w-3 rounded-full bg-secondary-300"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-10 right-10 h-4 w-4 rounded-full bg-primary-300"
              />
              <div
                aria-hidden="true"
                className="absolute right-16 top-12 h-2.5 w-2.5 rounded-full bg-secondary-400"
              />
              <HeartHandshakeIcon className="relative h-20 w-20 text-primary-700" />
              <span className="absolute bottom-5 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold text-primary-800 shadow-xs">
                Bersama, lebih bermakna
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                <SparklesIcon className="h-3.5 w-3.5" />
                Kegiatan mendatang
              </p>
              <p className="mt-2 text-xl font-semibold leading-snug text-ink">
                {featuredEvent.title}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">
                  {featuredEvent.category}
                </span>
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
                  {featuredEvent.city}
                </span>
              </div>

              <div className="mt-4 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                  <div>
                    <span className="block text-xs text-ink-muted">Lokasi</span>
                    <span className="font-medium text-ink">
                      {featuredEvent.city}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                  <div>
                    <span className="block text-xs text-ink-muted">Peserta</span>
                    <span className="font-mono font-medium text-ink">
                      {featuredEvent.registeredCount}/{featuredEvent.slots}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
                <span className="text-ink-muted">
                  {formatEventShortDate(featuredEvent.startsAt)}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-primary-700">
                  <AccessibilityIcon className="h-4 w-4" />
                  {quota.label}
                </span>
              </div>
            </div>
          </div>

          <div className="absolute -left-4 top-24 hidden rounded-card border border-line bg-surface p-3 shadow-card sm:block">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary-100 text-secondary-700">
                <AccessibilityIcon className="h-4 w-4" />
              </span>
              <span>
                <strong className="block text-sm font-semibold text-ink">
                  Ramah semua
                </strong>
                <span className="text-xs text-ink-muted">
                  Info aksesibilitas jelas
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
