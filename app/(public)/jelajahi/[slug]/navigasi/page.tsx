import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { NavigationExperience } from "@/components/map/navigation-experience";
import { placeLocationLabel } from "@/components/places/post-card";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
} from "@/components/ui/icons";
import { getPlaceBySlug } from "@/server/places/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    return { title: "Navigasi tidak ditemukan" };
  }

  return {
    title: `Navigasi ke ${place.name}`,
    description: `Rute pejalan kaki live dan petunjuk arah menuju ${place.name} dari lokasi perangkatmu.`,
  };
}

function NavigationSkeleton() {
  return (
    <div role="status" aria-live="polite" className="container-page py-10">
      <span className="sr-only">Memuat navigasi…</span>
      <div aria-hidden="true" className="space-y-4">
        <div className="h-6 w-52 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-10 w-2/3 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-[320px] animate-pulse rounded-sheet border border-line bg-surface-muted sm:h-[380px]" />
      </div>
    </div>
  );
}

export default function NavigationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<NavigationSkeleton />}>
      <NavigationContent params={params} />
    </Suspense>
  );
}

async function NavigationContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) notFound();

  return (
    <>
      <section className="border-b border-line bg-surface-muted/40">
        <div className="container-page py-8 lg:py-10">
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
                <Link
                  href="/jelajahi"
                  className="underline-offset-4 hover:text-ink hover:underline"
                >
                  Jelajahi
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </li>
              <li className="min-w-0">
                <Link
                  href={`/jelajahi/${place.slug}`}
                  className="block max-w-[12rem] truncate underline-offset-4 hover:text-ink hover:underline sm:max-w-xs"
                >
                  {place.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </li>
              <li>
                <span aria-current="page" className="font-medium text-ink">
                  Navigasi
                </span>
              </li>
            </ol>
          </nav>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Link
                href={`/jelajahi/${place.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-800 underline-offset-4 hover:underline"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Kembali ke detail tempat
              </Link>

              <h1 className="mt-3 text-display-sm font-bold tracking-tight text-ink">
                Navigasi ke {place.name}
              </h1>

              <p className="mt-3 flex items-start gap-1.5 text-sm text-ink-muted">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                {placeLocationLabel(place)}
              </p>
            </div>

            <p className="max-w-xs rounded-card border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted shadow-xs">
              Navigasi memakai lokasi perangkatmu saat ini. Garis biru mengikuti
              pergerakan dan rute dihitung ulang otomatis bila keluar jalur.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page py-8 lg:py-10">
        <NavigationExperience place={place} />
      </div>
    </>
  );
}
