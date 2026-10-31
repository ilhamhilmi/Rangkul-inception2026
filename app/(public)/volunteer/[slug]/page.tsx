import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AccessibilityIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  HeartHandshakeIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { RegistrationPanel } from "@/components/volunteer/registration-panel";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  countActiveRegistrations,
  coverUrlFor,
  getPublishedEventBySlug,
  getRegistrationForUser,
  isEventOpen,
  toVolunteerEvent,
} from "@/lib/volunteer/data";
import { formatEventSchedule, getQuotaStatus } from "@/lib/volunteer/format";

type VolunteerDetailPageProps = Pick<
  PageProps<"/volunteer/[slug]">,
  "params"
>;

const quotaBarClasses = {
  success: "bg-success-600",
  warning: "bg-warning-600",
  danger: "bg-danger-600",
} as const;

function DetailSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Memuat detail kegiatan…</span>
      <Skeleton className="h-5 w-64" />
      <Skeleton className="mt-4 h-80 w-full rounded-sheet" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-card" />
          <Skeleton className="h-52 w-full rounded-card" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      </div>
    </div>
  );
}

async function VolunteerDetail({ params }: VolunteerDetailPageProps) {
  const { slug } = await params;
  await connection();

  let event: Awaited<ReturnType<typeof getPublishedEventBySlug>>;

  try {
    event = await getPublishedEventBySlug(slug);
  } catch {
    // Tabel Volunteer belum diterapkan pada database (mis. migration belum
    // dijalankan). Tampilkan keadaan kosong, bukan error 500.
    return (
      <EmptyState
        icon={CalendarIcon}
        title="Kegiatan belum bisa ditampilkan"
        description="Data kegiatan Volunteer belum tersedia di database. Migration modul Volunteer perlu dijalankan oleh pengelola database sebelum halaman ini dapat digunakan."
        action={<ButtonLink href="/volunteer">Kembali ke daftar kegiatan</ButtonLink>}
      />
    );
  }

  if (!event) notFound();

  const profile = await getCurrentProfile();

  let registration: Awaited<ReturnType<typeof getRegistrationForUser>> = null;
  let activeCount = event.registeredCount;

  try {
    if (profile) {
      registration = await getRegistrationForUser(event.id, profile.id);
    }
    activeCount = await countActiveRegistrations(event.id);
  } catch {
    // Sebagian tabel (mis. event_registrations) belum tersedia. Tetap
    // tampilkan detail kegiatan dengan data yang ada.
    registration = null;
  }

  const isFull = activeCount >= event.slots;
  const isOpen = isEventOpen(event);
  const view = toVolunteerEvent(event);
  const quota = getQuotaStatus(view);
  const requirements = (event.requirements ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Volunteer", href: "/volunteer" },
          { label: event.title },
        ]}
      />

      <div className="relative mt-4 overflow-hidden rounded-sheet border border-line bg-primary-50">
        <div
          role="img"
          aria-label={view.coverAlt}
          className="h-64 w-full bg-cover bg-center sm:h-80 lg:h-96"
          style={{ backgroundImage: `url(${coverUrlFor(event.coverUrl)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <Badge tone="primary">{view.category}</Badge>
            <Badge tone="neutral">{event.city}</Badge>
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {event.title}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              {formatEventSchedule(
                event.startsAt.toISOString(),
                event.endsAt.toISOString(),
              )}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4" />
              {event.city}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          <section
            aria-labelledby="tentang-kegiatan"
            className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6"
          >
            <h2
              id="tentang-kegiatan"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Tentang kegiatan
            </h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-muted">
              {event.description}
            </p>

            <dl className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <div>
                  <dt className="text-xs text-ink-muted">Lokasi</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">
                    {event.locationName}
                  </dd>
                  <dd className="mt-0.5 text-sm text-ink-muted">
                    {event.address}, {event.city}, {event.province}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <div>
                  <dt className="text-xs text-ink-muted">Tanggal & waktu</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">
                    {formatEventSchedule(
                      event.startsAt.toISOString(),
                      event.endsAt.toISOString(),
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <div>
                  <dt className="text-xs text-ink-muted">Penyelenggara</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-ink">
                    {event.organizer.name}
                    {event.organizer.role === "ORGANIZER" ||
                    event.organizer.role === "ADMIN" ? (
                      <VerifiedBadge />
                    ) : null}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <div>
                  <dt className="text-xs text-ink-muted">Kapasitas peserta</dt>
                  <dd className="mt-0.5 font-mono text-sm font-medium text-ink">
                    {event.registeredCount}/{event.slots} peserta terkonfirmasi
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-5">
              <div
                className="h-2 overflow-hidden rounded-full bg-surface-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={event.slots}
                aria-valuenow={event.registeredCount}
                aria-label={`Kuota terisi ${event.registeredCount} dari ${event.slots} peserta`}
              >
                <div
                  className={`h-full rounded-full ${quotaBarClasses[quota.tone]}`}
                  style={{ width: `${quota.percentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                {quota.label} · sisa {quota.remaining} kuota terkonfirmasi
              </p>
            </div>
          </section>

          <section
            aria-labelledby="persyaratan-kegiatan"
            className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6"
          >
            <h2
              id="persyaratan-kegiatan"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Yang perlu disiapkan
            </h2>
            {requirements.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {requirements.map((requirement, index) => (
                  <li
                    key={`${index}-${requirement}`}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted"
                  >
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Penyelenggara belum mencantumkan persyaratan khusus. Ikuti
                arahan koordinator saat kegiatan berlangsung.
              </p>
            )}
          </section>

          <section
            aria-labelledby="aksesibilitas-kegiatan"
            className="rounded-card border border-primary-200 bg-primary-50 p-5 sm:p-6"
          >
            <h2
              id="aksesibilitas-kegiatan"
              className="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary-900"
            >
              <AccessibilityIcon className="h-5 w-5" />
              Informasi aksesibilitas
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-primary-900">
              {event.accessibilityNotes ||
                "Penyelenggara belum menambahkan catatan aksesibilitas. Hubungi penyelenggara untuk menanyakan kebutuhan spesifikmu."}
            </p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <RegistrationPanel
            eventId={event.id}
            slug={event.slug}
            eventTitle={event.title}
            isAuthenticated={Boolean(profile)}
            registrationStatus={registration?.status ?? null}
            isOpen={isOpen}
            isFull={isFull}
            defaults={{
              name: profile?.name ?? "",
              email: profile?.email ?? "",
            }}
          />

          <section
            aria-labelledby="penyelenggara-kegiatan"
            className="rounded-card border border-line bg-surface p-5 shadow-xs"
          >
            <h2
              id="penyelenggara-kegiatan"
              className="text-base font-semibold tracking-tight text-ink"
            >
              Diselenggarakan oleh
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-50 text-primary-700">
                <HeartHandshakeIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="flex items-center gap-1.5 font-medium text-ink">
                  {event.organizer.name}
                  {event.organizer.role === "ORGANIZER" ||
                  event.organizer.role === "ADMIN" ? (
                    <VerifiedBadge />
                  ) : null}
                </p>
                <p className="text-xs text-ink-muted">Penyelenggara Rangkul</p>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-xs leading-relaxed text-ink-muted">
              <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-700" />
              Penyelenggara telah diverifikasi admin Rangkul sebelum kegiatan
              diterbitkan.
            </p>
          </section>

          <ButtonLink
            href="/volunteer"
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Lihat kegiatan lain
          </ButtonLink>
        </aside>
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: VolunteerDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const event = await getPublishedEventBySlug(slug);
    if (!event) return { title: "Kegiatan tidak ditemukan" };

    return {
      title: event.title,
      description: event.description.slice(0, 160),
      openGraph: {
        title: `${event.title} — Volunteer Rangkul`,
        description: event.description.slice(0, 160),
        type: "website",
      },
    };
  } catch {
    return { title: "Kegiatan Volunteer" };
  }
}

export default function VolunteerDetailPage({
  params,
}: VolunteerDetailPageProps) {
  return (
    <div className="container-page py-6 lg:py-10">
      <Suspense fallback={<DetailSkeleton />}>
        <VolunteerDetail params={params} />
      </Suspense>
    </div>
  );
}
