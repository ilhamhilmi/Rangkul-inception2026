import type { Metadata } from "next";

import { EventReviewActions } from "@/components/admin/event-review-actions";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { EVENT_CATEGORY_LABELS } from "@/lib/volunteer/categories";
import { coverUrlFor } from "@/lib/volunteer/data";
import { formatEventSchedule } from "@/lib/volunteer/format";
import { getPendingVolunteerEvents } from "@/server/admin/queries";

export const metadata: Metadata = {
  title: "Approval Kegiatan Volunteer",
  robots: { index: false, follow: false },
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminEventsPage() {
  const events = await getPendingVolunteerEvents();

  return (
    <div className="container-page py-8 lg:py-10">
      <ButtonLink href="/admin" variant="ghost" size="sm" className="-ml-4">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke ringkasan
      </ButtonLink>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">
            Antrean verifikasi
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Kegiatan volunteer
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-ink-muted">
            Periksa detail pengadaan kegiatan, jadwal, lokasi, dan informasi
            aksesibilitas sebelum menerbitkannya ke halaman publik.
          </p>
        </div>
        <Badge tone={events.length > 0 ? "info" : "success"}>
          {events.length} menunggu
        </Badge>
      </div>

      {events.length === 0 ? (
        <div className="mt-8 rounded-card border border-line bg-surface p-8 text-center shadow-xs">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-50 text-success-700">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-ink">
            Tidak ada kegiatan menunggu
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            Semua pengajuan kegiatan volunteer sudah diproses. Antrean baru akan
            muncul di sini setelah penyelenggara mengajukan penerbitan.
          </p>
          <ButtonLink href="/volunteer" className="mt-5" variant="secondary">
            Lihat halaman Volunteer
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {events.map((event) => {
            const coverUrl = coverUrlFor(event.coverUrl);

            return (
              <article
                key={event.id}
                className="overflow-hidden rounded-card border border-line bg-surface shadow-xs"
              >
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
                  <div
                    role="img"
                    aria-label={event.coverAlt ?? `Cover ${event.title}`}
                    className="h-40 w-full shrink-0 rounded-input bg-primary-50 bg-cover bg-center sm:h-28 sm:w-44"
                    style={{ backgroundImage: `url(${coverUrl})` }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="info">PENDING</Badge>
                      <Badge tone="primary">
                        {EVENT_CATEGORY_LABELS[event.category]}
                      </Badge>
                    </div>

                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                      {event.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPinIcon className="h-4 w-4 text-primary-700" />
                        {event.locationName}, {event.city}, {event.province}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarIcon className="h-4 w-4 text-primary-700" />
                        {formatEventSchedule(
                          event.startsAt.toISOString(),
                          event.endsAt.toISOString(),
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <UsersIcon className="h-4 w-4 text-primary-700" />
                        {event._count.registrations}/{event.slots} peserta
                        terdaftar
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                      {event.description}
                    </p>

                    <dl className="mt-4 grid gap-3 rounded-card border border-line bg-surface-muted/40 p-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Penyelenggara
                        </dt>
                        <dd className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium text-ink">
                          <span className="inline-flex items-center gap-1.5">
                            <UserIcon className="h-3.5 w-3.5" />
                            {event.organizer.name}
                          </span>
                          <span className="break-all text-ink-muted">
                            {event.organizer.email}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Terakhir diperbarui
                        </dt>
                        <dd className="mt-1 inline-flex items-center gap-1.5 text-ink">
                          <ClockIcon className="h-3.5 w-3.5 text-primary-700" />
                          {formatDate(event.updatedAt)}
                        </dd>
                      </div>
                    </dl>

                    {event.requirements ? (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-ink">
                          Persyaratan peserta
                        </h3>
                        <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                          {event.requirements}
                        </p>
                      </div>
                    ) : null}

                    {event.accessibilityNotes ? (
                      <div className="mt-3">
                        <h3 className="text-sm font-semibold text-ink">
                          Catatan aksesibilitas
                        </h3>
                        <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                          {event.accessibilityNotes}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="border-t border-line bg-surface-muted/30 px-5 pb-5 sm:px-6">
                  <EventReviewActions eventId={event.id} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
