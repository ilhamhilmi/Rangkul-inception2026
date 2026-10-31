import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertIcon } from "@/components/ui/icons";
import { CalendarIcon } from "@/components/volunteer/volunteer-icons";
import { VolunteerExplorer } from "@/components/volunteer/volunteer-explorer";
import { VolunteerHero } from "@/components/volunteer/volunteer-hero";
import { VolunteerOrganizerCta } from "@/components/volunteer/volunteer-organizer-cta";
import { listPublishedEvents } from "@/lib/volunteer/data";
import type { VolunteerEvent } from "@/types/volunteer";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Temukan kegiatan volunteer inklusif di Rangkul: pendampingan acara, pendataan aksesibilitas, kegiatan sosial, dan program inklusif di berbagai kota.",
};

function VolunteerSkeleton() {
  return (
    <div className="container-page py-14 lg:py-20" aria-busy="true">
      <span className="sr-only">Memuat kegiatan volunteer…</span>
      <Skeleton className="h-10 w-72" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-96 w-full rounded-card" />
        ))}
      </div>
    </div>
  );
}

async function VolunteerContent() {
  // Halaman publik membaca database saat request, bukan saat build.
  await connection();

  let events: VolunteerEvent[] = [];
  let state: "ready" | "unavailable" | "error" = "ready";

  try {
    const result = await listPublishedEvents();

    if (result.status === "ready") {
      events = result.events;
    } else {
      state = result.status;
    }
  } catch {
    state = "error";
  }

  const locations = Array.from(new Set(events.map((event) => event.city))).sort(
    (first, second) => first.localeCompare(second, "id"),
  );
  const categoryCount = new Set(events.map((event) => event.category)).size;

  return (
    <>
      <VolunteerHero
        eventCount={events.length}
        cityCount={locations.length}
        categoryCount={categoryCount}
        featuredEvent={events[0]}
        unavailable={state === "unavailable"}
      />

      <section
        id="kegiatan"
        aria-labelledby="kegiatan-title"
        className="container-page scroll-mt-24 py-14 lg:py-20"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
            Temukan kegiatanmu
          </p>
          <h2
            id="kegiatan-title"
            className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            Kegiatan yang bisa kamu ikuti
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            Cari berdasarkan nama, lokasi, kategori, atau waktu. Setiap kegiatan
            mencantumkan kuota dan informasi aksesibilitas agar kamu bisa
            memilih dengan percaya diri.
          </p>
        </div>

        <div className="mt-8">
          {state === "unavailable" ? (
            <EmptyState
              icon={AlertIcon}
              title="Data kegiatan belum tersedia"
              description="Tabel Volunteer belum ada di database. Migration modul Volunteer perlu diterapkan oleh pengelola database bersama sebelum kegiatan dapat ditampilkan."
              action={<ButtonLink href="/volunteer">Muat ulang</ButtonLink>}
            />
          ) : state === "error" ? (
            <EmptyState
              icon={AlertIcon}
              title="Kegiatan belum bisa dimuat"
              description="Terjadi kendala saat mengambil data kegiatan. Coba muat ulang halaman beberapa saat lagi."
              action={<ButtonLink href="/volunteer">Muat ulang</ButtonLink>}
            />
          ) : events.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="Belum ada kegiatan yang terbit"
              description="Saat ini belum ada kegiatan volunteer yang dipublikasikan. Kamu bisa menjadi penyelenggara pertama dan mengajukan kegiatan inklusif."
              action={
                <ButtonLink href="/volunteer/jadi-penyelenggara">
                  Jadi penyelenggara
                </ButtonLink>
              }
            />
          ) : (
            <VolunteerExplorer events={events} locations={locations} />
          )}
        </div>
      </section>

      <VolunteerOrganizerCta />
    </>
  );
}

export default function VolunteerPage() {
  return (
    <Suspense fallback={<VolunteerSkeleton />}>
      <VolunteerContent />
    </Suspense>
  );
}
