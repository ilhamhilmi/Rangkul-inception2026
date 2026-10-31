import type { Metadata } from "next";
import { VolunteerExplorer } from "@/components/volunteer/volunteer-explorer";
import { VolunteerHero } from "@/components/volunteer/volunteer-hero";
import { VolunteerOrganizerCta } from "@/components/volunteer/volunteer-organizer-cta";
import { volunteerEvents } from "@/lib/volunteer/mock-events";

export const metadata: Metadata = {
  title: "Volunteer",
  description:
    "Temukan kegiatan volunteer inklusif di Rangkul: pendampingan acara, pendataan aksesibilitas, kegiatan sosial, dan program inklusif di berbagai kota.",
};

export default function VolunteerPage() {
  const locations = Array.from(
    new Set(volunteerEvents.map((event) => event.city)),
  ).sort((first, second) => first.localeCompare(second, "id"));
  const categoryCount = new Set(
    volunteerEvents.map((event) => event.category),
  ).size;
  const featuredEvent = volunteerEvents[0];

  return (
    <>
      <VolunteerHero
        eventCount={volunteerEvents.length}
        cityCount={locations.length}
        categoryCount={categoryCount}
        featuredEvent={featuredEvent}
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
          <VolunteerExplorer
            events={volunteerEvents}
            locations={locations}
          />
        </div>
      </section>

      <VolunteerOrganizerCta />
    </>
  );
}
