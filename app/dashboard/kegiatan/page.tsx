import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CalendarIcon,
  MapPinIcon,
  PlusIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { EventManageActions } from "@/components/volunteer/event-manage-actions";
import { requireOrganizer } from "@/lib/auth/guards";
import { coverUrlFor, listManagedEvents } from "@/lib/volunteer/data";
import { formatEventSchedule } from "@/lib/volunteer/format";
import { EVENT_STATUS_META } from "@/lib/volunteer/status";

export const metadata: Metadata = {
  title: "Dashboard Kegiatan",
  description:
    "Kelola kegiatan volunteer yang kamu selenggarakan di Rangkul.",
};

function ManagedEventsSkeleton() {
  return (
    <div className="container-page pb-16" aria-busy="true">
      <span className="sr-only">Memuat daftar kegiatan…</span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-11 w-36 rounded-button" />
      </div>
      <div className="mt-6 space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-44 rounded-card" />
        ))}
      </div>
    </div>
  );
}

async function ManagedEventsContent() {
  await connection();
  const profile = await requireOrganizer();
  const events = await listManagedEvents(profile);

  return (
    <div className="container-page pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Kegiatan volunteer
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Kelola kegiatan, ajukan penerbitan, dan pantau peserta.
          </p>
        </div>
        <ButtonLink href="/dashboard/kegiatan/baru" size="md">
          <PlusIcon className="h-4 w-4" />
          Buat kegiatan
        </ButtonLink>
      </div>

      {events.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={CalendarIcon}
            title="Belum ada kegiatan"
            description="Buat kegiatan volunteer pertamamu, lengkapi informasi aksesibilitas, lalu ajukan ke admin untuk diterbitkan."
            action={
              <ButtonLink href="/dashboard/kegiatan/baru">
                Buat kegiatan
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {events.map((event) => {
            const meta = EVENT_STATUS_META[event.status];
            return (
              <li
                key={event.id}
                className="overflow-hidden rounded-card border border-line bg-surface shadow-xs"
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <div
                    role="img"
                    aria-label={event.coverAlt ?? `Cover ${event.title}`}
                    className="h-28 w-full shrink-0 rounded-input bg-primary-50 bg-cover bg-center sm:h-24 sm:w-36"
                    style={{
                      backgroundImage: `url(${coverUrlFor(event.coverUrl)})`,
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      {event.archivedAt ? (
                        <Badge tone="neutral">Diarsipkan</Badge>
                      ) : null}
                    </div>

                    <h2 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-ink">
                      <ButtonLink
                        href={`/dashboard/kegiatan/${event.id}/edit`}
                        variant="ghost"
                        size="sm"
                        className="-ml-2 px-2 text-left text-base font-semibold"
                      >
                        {event.title}
                      </ButtonLink>
                    </h2>

                    <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-muted">
                      <div className="inline-flex items-center gap-1.5">
                        <CalendarIcon className="h-4 w-4 text-primary-700" />
                        <dt className="sr-only">Jadwal</dt>
                        <dd>
                          {formatEventSchedule(
                            event.startsAt.toISOString(),
                            event.endsAt.toISOString(),
                          )}
                        </dd>
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <MapPinIcon className="h-4 w-4 text-primary-700" />
                        <dt className="sr-only">Lokasi</dt>
                        <dd>
                          {event.city}, {event.province}
                        </dd>
                      </div>
                      <div className="inline-flex items-center gap-1.5">
                        <UsersIcon className="h-4 w-4 text-primary-700" />
                        <dt className="sr-only">Peserta terkonfirmasi</dt>
                        <dd>
                          {event._count.registrations}/{event.slots} peserta
                          terkonfirmasi
                        </dd>
                      </div>
                    </dl>

                    <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                      {meta.description}
                    </p>

                    {event.status === "REJECTED" && event.moderationNote ? (
                      <p className="mt-3 rounded-input border border-danger-600/30 bg-danger-50 px-3.5 py-2.5 text-sm leading-relaxed text-danger-700">
                        <span className="font-semibold">Catatan admin:</span>{" "}
                        {event.moderationNote}
                      </p>
                    ) : null}

                    <div className="mt-4">
                      <EventManageActions
                        eventId={event.id}
                        status={event.status}
                        archived={Boolean(event.archivedAt)}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 rounded-card border border-line bg-surface-muted/60 p-4 text-xs leading-relaxed text-ink-muted">
        Penerbitan kegiatan dilakukan admin melalui dashboard verifikasi global.
        Setelah diajukan, status kegiatan berubah menjadi menunggu tinjauan.
      </p>
    </div>
  );
}

export default function ManagedEventsPage() {
  return (
    <Suspense fallback={<ManagedEventsSkeleton />}>
      <ManagedEventsContent />
    </Suspense>
  );
}
