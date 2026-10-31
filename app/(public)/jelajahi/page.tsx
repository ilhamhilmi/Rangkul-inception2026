import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  PlaceFeedEmpty,
  PlaceFeedSkeleton,
} from "@/components/places/place-feed-states";
import { PlaceCard } from "@/components/places/place-card";
import { PlaceFilters } from "@/components/places/place-filters";
import { ButtonLink } from "@/components/ui/button";
import {
  ChevronRightIcon,
  InfoIcon,
  PlusIcon,
  SparklesIcon,
} from "@/components/ui/icons";
import {
  getPlaceCount,
  getPlaceSummaries,
} from "@/server/places/queries";
import { isAccessibilityKey, isPlaceCategory } from "@/lib/constants/places";

export const metadata: Metadata = {
  title: "Jelajahi tempat",
  description:
    "Cari tempat umum yang aksesibel berdasarkan kategori dan fasilitas, lalu lihat rute menuju pintu masuk yang paling sesuai.",
};

type ExploreSearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

async function ExploreResults({
  searchParams,
}: {
  searchParams: Promise<ExploreSearchParams>;
}) {
  const params = await searchParams;

  const query = firstValue(params.q).trim();
  const rawCategory = firstValue(params.kategori);
  const rawFacility = firstValue(params.fasilitas);

  const kategori = isPlaceCategory(rawCategory) ? rawCategory : "semua";
  const fasilitas = isAccessibilityKey(rawFacility) ? rawFacility : "semua";

  const results = await getPlaceSummaries({
    q: query,
    kategori,
    fasilitas,
  });

  const total = await getPlaceCount();

  return (
    <>
      <PlaceFilters
        values={{ q: query, kategori, fasilitas }}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-sm text-ink-muted">
          Menampilkan{" "}
          <strong className="font-semibold text-ink">{results.length}</strong>{" "}
          dari {total} tempat
          {query ? (
            <>
              {" "}
              untuk kata kunci{" "}
              <strong className="font-semibold text-ink">“{query}”</strong>
            </>
          ) : null}
          .
        </p>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-muted">
          <InfoIcon className="h-3.5 w-3.5" />
          Data langsung dari database
        </p>
      </div>

      {results.length > 0 ? (
        <ol className="mt-5 space-y-5">
          {results.map((place) => (
            <li key={place.slug}>
              <PlaceCard place={place} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-5">
          <PlaceFeedEmpty query={query} />
        </div>
      )}

      <aside className="mt-8 rounded-sheet border border-primary-200 bg-primary-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary-900">
              <SparklesIcon className="h-4 w-4" />
              Punya info tempat yang belum ada?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-primary-800">
              Tambahkan detail pintu masuk, fasilitas, dan foto. Kontribusimu
              membantu orang lain berangkat dengan lebih percaya diri.
            </p>
          </div>
          <ButtonLink href="/tambah-info" size="sm" className="shrink-0">
            <PlusIcon className="h-4 w-4" />
            Tambah info tempat
          </ButtonLink>
        </div>
      </aside>
    </>
  );
}

export default function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreSearchParams>;
}) {
  return (
    <>
      <section className="border-b border-line bg-surface-muted/50">
        <div className="container-page py-9 sm:py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
              <li>
                <Link
                  href="/"
                  className="underline-offset-4 hover:text-ink hover:underline"
                >
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </li>
              <li>
                <span aria-current="page" className="font-medium text-ink">
                  Jelajahi
                </span>
              </li>
            </ol>
          </nav>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                Informasi & navigasi
              </p>
              <h1 className="mt-2 text-display-sm font-bold tracking-tight text-ink">
                Jelajahi tempat
              </h1>
              <p className="mt-3 text-lg leading-relaxed text-ink-muted">
                Temukan tempat berdasarkan fasilitas yang benar-benar kamu
                butuhkan, lalu cek pintu masuk mana yang paling mudah dijangkau.
              </p>
            </div>

            <ButtonLink href="/tambah-info" size="lg" className="self-start lg:self-auto">
              <PlusIcon className="h-4 w-4" />
              Tambah info
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-page py-8 lg:py-10">
        <Suspense fallback={<PlaceFeedSkeleton />}>
          <ExploreResults searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}
