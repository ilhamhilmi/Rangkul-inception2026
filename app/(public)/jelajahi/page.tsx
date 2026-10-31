import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  PlaceFeedEmpty,
  PlaceFeedSkeleton,
} from "@/components/places/place-feed-states";
import { PlaceFilters } from "@/components/places/place-filters";
import { PostCard } from "@/components/places/post-card";
import { ButtonLink } from "@/components/ui/button";
import {
  ChevronRightIcon,
  InfoIcon,
  PlusIcon,
  SparklesIcon,
  ThumbsUpIcon,
} from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { isPlaceCategory } from "@/lib/constants/places";
import {
  getPlaceCount,
  getPlaceSummaries,
  getViewerLikedPlaceIds,
} from "@/server/places/queries";

export const metadata: Metadata = {
  title: "Jelajahi tempat",
  description:
    "Baca postingan pengguna tentang aksesibilitas tempat umum, cari berdasarkan nama tempat, dan tandai yang paling membantu.",
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
  const kategori = isPlaceCategory(rawCategory) ? rawCategory : "semua";

  const [results, total, user] = await Promise.all([
    getPlaceSummaries({ q: query, kategori }),
    getPlaceCount(),
    getCurrentUser(),
  ]);

  const likedIds = user
    ? await getViewerLikedPlaceIds(
        user.id,
        results.map((place) => place.id),
      )
    : new Set<string>();

  const posts = results.map((place) => ({
    ...place,
    viewerHasLiked: likedIds.has(place.id),
  }));

  return (
    <>
      <PlaceFilters values={{ q: query, kategori }} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-sm text-ink-muted">
          Menampilkan{" "}
          <strong className="font-semibold text-ink">{posts.length}</strong> dari{" "}
          {total} postingan
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
          {query ? (
            <>
              <ThumbsUpIcon className="h-3.5 w-3.5" />
              Diurutkan dari yang paling membantu
            </>
          ) : (
            <>
              <InfoIcon className="h-3.5 w-3.5" />
              Postingan terbaru lebih dulu
            </>
          )}
        </p>
      </div>

      {posts.length > 0 ? (
        <ol className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((place) => (
            <li key={place.id} className="flex">
              <PostCard place={place} isAuthenticated={Boolean(user)} />
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
              Punya pengalaman di tempat lain?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-primary-800">
              Bagikan kondisi pintu masuk, jalur, dan fasilitas yang kamu temui.
              Postinganmu membantu orang lain berangkat dengan lebih percaya
              diri.
            </p>
          </div>
          <ButtonLink href="/tambah-info" size="sm" className="shrink-0">
            <PlusIcon className="h-4 w-4" />
            Bagikan pengalaman
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
                Cerita aksesibilitas
              </p>
              <h1 className="mt-2 text-display-sm font-bold tracking-tight text-ink">
                Jelajahi tempat
              </h1>
              <p className="mt-3 text-lg leading-relaxed text-ink-muted">
                Baca pengalaman pengguna lain, cari tempat berdasarkan namanya,
                lalu tandai postingan yang paling membantu.
              </p>
            </div>

            <ButtonLink href="/tambah-info" size="lg" className="self-start lg:self-auto">
              <PlusIcon className="h-4 w-4" />
              Bagikan pengalaman
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
