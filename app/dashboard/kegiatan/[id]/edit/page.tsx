import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { AlertIcon, ArrowLeftIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EventForm,
  type EventFormValues,
} from "@/components/volunteer/event-form";
import { requireOrganizer } from "@/lib/auth/guards";
import { coverUrlFor, getManagedEvent } from "@/lib/volunteer/data";
import { EVENT_STATUS_META } from "@/lib/volunteer/status";

export const metadata: Metadata = {
  title: "Edit Kegiatan",
  description: "Perbarui informasi kegiatan volunteer milikmu di Rangkul.",
};

function EditEventSkeleton() {
  return (
    <div className="container-page pb-16" aria-busy="true">
      <span className="sr-only">Memuat formulir kegiatan…</span>
      <Skeleton className="h-5 w-44" />
      <Skeleton className="mt-4 h-6 w-28 rounded-full" />
      <Skeleton className="mt-3 h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      <Skeleton className="mt-6 h-[32rem] w-full rounded-card" />
    </div>
  );
}

async function EditEventContent({
  params,
}: PageProps<"/dashboard/kegiatan/[id]/edit">) {
  const { id } = await params;
  await connection();

  const profile = await requireOrganizer();
  const event = await getManagedEvent(id, profile);

  if (!event) notFound();

  const statusMeta = EVENT_STATUS_META[event.status];

  const values: EventFormValues = {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    locationName: event.locationName,
    address: event.address,
    city: event.city,
    province: event.province,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    requirements: event.requirements ?? "",
    accessibilityNotes: event.accessibilityNotes ?? "",
    slots: String(event.slots),
    coverUrl: event.coverUrl ?? "",
    coverAlt: event.coverAlt ?? "",
    status: event.status,
    coverPreviewUrl: coverUrlFor(event.coverUrl),
  };

  return (
    <div className="container-page pb-16">
      <ButtonLink href="/dashboard/kegiatan" variant="ghost" size="sm">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke daftar kegiatan
      </ButtonLink>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
            {event.archivedAt ? (
              <Badge tone="neutral">Diarsipkan</Badge>
            ) : null}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Edit kegiatan
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {statusMeta.description}
          </p>
        </div>

        <div className="flex gap-2">
          <ButtonLink
            href={`/dashboard/kegiatan/${event.id}/pendaftar`}
            variant="secondary"
            size="sm"
          >
            Lihat pendaftar
          </ButtonLink>
          {event.status === "PUBLISHED" ? (
            <ButtonLink
              href={`/volunteer/${event.slug}`}
              variant="ghost"
              size="sm"
            >
              Lihat halaman publik
            </ButtonLink>
          ) : null}
        </div>
      </div>

      {event.archivedAt ? (
        <div className="mt-6 rounded-card border border-line bg-surface-muted/60 p-5">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning-700" />
            Kegiatan ini sudah diarsipkan sehingga tidak dapat diubah. Data
            pendaftar tetap dapat dilihat dan diekspor.
          </p>
        </div>
      ) : (
        <>
          {event.status === "REJECTED" && event.moderationNote ? (
            <div className="mt-6 rounded-card border border-danger-600/30 bg-danger-50 p-5">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-danger-700">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <span className="font-semibold">Catatan admin:</span>{" "}
                  {event.moderationNote} Setelah diperbaiki, ajukan penerbitan
                  kembali dari halaman ini.
                </span>
              </p>
            </div>
          ) : null}

          <div className="mt-6">
            <EventForm event={values} />
          </div>
        </>
      )}
    </div>
  );
}

export default function EditEventPage(
  props: PageProps<"/dashboard/kegiatan/[id]/edit">,
) {
  return (
    <Suspense fallback={<EditEventSkeleton />}>
      <EditEventContent {...props} />
    </Suspense>
  );
}
