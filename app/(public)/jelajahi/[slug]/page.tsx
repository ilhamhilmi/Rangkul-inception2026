import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlaceMap } from "@/components/map/place-map";
import { CategoryBadge } from "@/components/places/category-badge";
import { EntranceCard } from "@/components/places/entrance-card";
import { FeatureChip } from "@/components/places/feature-chip";
import { PlaceGallery } from "@/components/places/place-gallery";
import { RatingDisplay } from "@/components/places/rating-display";
import { ReviewSection } from "@/components/places/review-section";
import { ButtonLink } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  DoorIcon,
  InfoIcon,
  MapPinIcon,
  NavigationIcon,
  ShieldCheckIcon,
  UserIcon,
  WalkIcon,
} from "@/components/ui/icons";
import {
  ACCESSIBILITY_FEATURES,
  getMainEntrance,
} from "@/lib/constants/places";
import { getPlaceBySlug } from "@/server/places/queries";
import { formatDate, pluralize } from "@/lib/utils/format";
import type { PlaceDetail } from "@/types/place";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) {
    return { title: "Tempat tidak ditemukan" };
  }

  return {
    title: place.name,
    description: `Info aksesibilitas ${place.name} di ${place.city}: ${place.entranceCount} pintu masuk, fasilitas per pintu, dan rute navigasi.`,
  };
}

function PlaceDetailSkeleton() {
  return (
    <div role="status" aria-live="polite" className="container-page py-10">
      <span className="sr-only">Memuat detail tempat…</span>
      <div aria-hidden="true" className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded-full bg-surface-muted" />
        <div className="h-10 w-2/3 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-64 animate-pulse rounded-sheet border border-line bg-surface-muted" />
      </div>
    </div>
  );
}

export default function PlaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<PlaceDetailSkeleton />}>
      <PlaceDetailContent params={params} />
    </Suspense>
  );
}

async function PlaceDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);

  if (!place) notFound();

  return <PlaceDetailView place={place} />;
}

function PlaceDetailView({ place }: { place: PlaceDetail }) {
  const mainEntrance = getMainEntrance(place);
  const availableFeatureList = ACCESSIBILITY_FEATURES.filter((feature) =>
    place.availableFeatures.includes(feature.key),
  );
  const missingFeatureList = ACCESSIBILITY_FEATURES.filter(
    (feature) => !place.availableFeatures.includes(feature.key),
  );

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
                <span
                  aria-current="page"
                  className="block max-w-[16rem] truncate font-medium text-ink sm:max-w-xs"
                >
                  {place.name}
                </span>
              </li>
            </ol>
          </nav>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={place.category} />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-muted">
                  <DoorIcon className="h-3.5 w-3.5 text-primary-700" />
                  {place.entranceCount} pintu masuk
                </span>
              </div>

              <h1 className="mt-3 text-display-sm font-bold tracking-tight text-ink">
                {place.name}
              </h1>

              <p className="mt-3 flex items-start gap-1.5 text-sm text-ink-muted">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                {place.address}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <RatingDisplay
                  rating={place.rating}
                  reviewCount={place.reviewCount}
                  showLabel
                />
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                  <UserIcon className="h-3.5 w-3.5" />
                  Dikontribusikan oleh {place.contributor}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <time dateTime={place.createdAt}>
                    {formatDate(place.createdAt)}
                  </time>
                </span>
              </div>
            </div>

            <ButtonLink
              href={`/jelajahi/${place.slug}/navigasi?pintu=${mainEntrance.id}`}
              size="lg"
              className="self-start lg:self-auto"
            >
              <NavigationIcon className="h-4 w-4" />
              Navigasi ke pintu utama
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="container-page py-8 lg:py-10">
        <PlaceGallery category={place.category} name={place.name} />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="order-2 space-y-10 lg:order-1">
            <section aria-labelledby="tentang-heading">
              <h2
                id="tentang-heading"
                className="text-2xl font-bold tracking-tight text-ink"
              >
                Tentang tempat ini
              </h2>
              <p className="prose-rangkul mt-3 text-ink-muted">
                {place.description}
              </p>

              <p className="mt-5 flex items-start gap-2.5 rounded-card border border-primary-200 bg-primary-50 p-4 text-sm leading-relaxed text-primary-900">
                <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                <span>
                  <strong className="font-semibold">
                    Utamakan pintu yang sesuai kebutuhanmu.
                  </strong>{" "}
                  Fasilitas dicatat per pintu masuk, jadi kondisi di satu pintu
                  bisa berbeda dengan pintu lainnya.
                </span>
              </p>
            </section>

            <section aria-labelledby="fasilitas-heading">
              <h2
                id="fasilitas-heading"
                className="text-2xl font-bold tracking-tight text-ink"
              >
                Fasilitas di tempat ini
              </h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                Tersedia di setidaknya satu pintu masuk.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {availableFeatureList.map((feature) => (
                  <li key={feature.key}>
                    <FeatureChip feature={feature.key} />
                  </li>
                ))}
              </ul>
              {missingFeatureList.length > 0 ? (
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                  <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Belum tercatat tersedia di pintu mana pun:{" "}
                    {missingFeatureList
                      .map((feature) => feature.label)
                      .join(", ")}
                    .
                  </span>
                </p>
              ) : null}
            </section>

            <section aria-labelledby="pintu-heading">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2
                    id="pintu-heading"
                    className="text-2xl font-bold tracking-tight text-ink"
                  >
                    Pintu masuk
                  </h2>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    {place.entranceCount}{" "}
                    {pluralize(place.entranceCount, "pintu")} terdata. Pilih
                    yang paling sesuai sebelum berangkat.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700">
                  <CheckIcon className="h-3.5 w-3.5" />
                  {mainEntrance.label} disarankan
                </span>
              </div>

              <ul
                id="pintu"
                className="mt-4 scroll-mt-24 space-y-4"
              >
                {place.entrances.map((entrance) => (
                  <EntranceCard
                    key={entrance.id}
                    entrance={entrance}
                    placeSlug={place.slug}
                  />
                ))}
              </ul>
            </section>

            <ReviewSection
              reviews={place.reviews}
              rating={place.rating}
              reviewCount={place.reviewCount}
              placeName={place.name}
            />
          </div>

          <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-24">
            <div className="rounded-sheet border border-line bg-surface p-4 shadow-xs sm:p-5">
              <PlaceMap
                slug={place.slug}
                name={place.name}
                latitude={place.latitude}
                longitude={place.longitude}
                entrances={place.entrances}
              />

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                  Pintu disarankan
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-ink">
                  <DoorIcon className="h-4 w-4 text-primary-700" />
                  {mainEntrance.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {mainEntrance.notes}
                </p>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3 text-sm">
                <div>
                  <dt className="text-xs text-ink-muted">Jarak contoh</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-ink">
                    <WalkIcon className="h-4 w-4 text-primary-700" />
                    {mainEntrance.route.distance}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Estimasi</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-ink">
                    <ClockIcon className="h-4 w-4 text-primary-700" />
                    {mainEntrance.route.duration}
                  </dd>
                </div>
              </dl>

              <ButtonLink
                href={`/jelajahi/${place.slug}/navigasi?pintu=${mainEntrance.id}`}
                size="md"
                className="mt-4 w-full"
              >
                <NavigationIcon className="h-4 w-4" />
                Buka navigasi
              </ButtonLink>

              <a
                href="#pintu"
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-button px-3 py-2 text-sm font-medium text-primary-800 underline-offset-4 hover:underline"
              >
                Bandingkan {place.entranceCount} pintu masuk
                <ChevronRightIcon className="h-4 w-4 rotate-90" />
              </a>
            </div>

            <div className="rounded-card border border-line bg-surface-muted/60 p-4 text-xs leading-relaxed text-ink-muted">
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                <ShieldCheckIcon className="h-4 w-4 text-primary-700" />
                Data dari komunitas
              </p>
              <p className="mt-1.5">
                Informasi ini adalah data contoh. Setelah backend tersambung,
                setiap kontribusi akan melewati moderasi sebelum tayang.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
