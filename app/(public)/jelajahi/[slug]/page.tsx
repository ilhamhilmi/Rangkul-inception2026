import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PlaceMap } from "@/components/map/place-map";
import { CategoryBadge } from "@/components/places/category-badge";
import { FeatureChip } from "@/components/places/feature-chip";
import { HelpfulButton } from "@/components/places/helpful-button";
import { PhotoCarousel } from "@/components/places/photo-carousel";
import { placeLocationLabel } from "@/components/places/post-card";
import { RatingDisplay } from "@/components/places/rating-display";
import { ReviewSection } from "@/components/places/review-section";
import { ButtonLink } from "@/components/ui/button";
import {
  CalendarIcon,
  CameraIcon,
  ChevronRightIcon,
  InfoIcon,
  MapPinIcon,
  NavigationIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@/components/ui/icons";
import { ACCESSIBILITY_FEATURES } from "@/lib/constants/places";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getPlaceBySlug,
  getViewerLikedPlace,
} from "@/server/places/queries";
import { formatDate } from "@/lib/utils/format";
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
    description: `Info aksesibilitas ${place.name} di ${placeLocationLabel(place)}: ${place.photos.length} foto lokasi dan rute navigasi pejalan kaki.`,
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
  const [place, user] = await Promise.all([getPlaceBySlug(slug), getCurrentUser()]);

  if (!place) notFound();

  const viewerHasLiked = user
    ? await getViewerLikedPlace(user.id, place.id)
    : false;

  return (
    <PlaceDetailView
      place={{ ...place, viewerHasLiked }}
      isAuthenticated={Boolean(user)}
    />
  );
}

function PlaceDetailView({
  place,
  isAuthenticated,
}: {
  place: PlaceDetail;
  isAuthenticated: boolean;
}) {
  const navigationHref = `/jelajahi/${place.slug}/navigasi`;
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
                  <CameraIcon className="h-3.5 w-3.5 text-primary-700" />
                  {place.photos.length} foto
                </span>
              </div>

              <h1 className="mt-3 text-display-sm font-bold tracking-tight text-ink">
                {place.name}
              </h1>

              <p className="mt-3 flex items-start gap-1.5 text-sm text-ink-muted">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                {placeLocationLabel(place)}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                {place.reviewCount > 0 ? (
                  <RatingDisplay
                    rating={place.rating}
                    reviewCount={place.reviewCount}
                    showLabel
                  />
                ) : (
                  <span className="text-xs text-ink-muted">
                    Belum ada rating aksesibilitas
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                  <UserIcon className="h-3.5 w-3.5" />
                  Diposting oleh {place.contributor}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <time dateTime={place.createdAt}>
                    {formatDate(place.createdAt)}
                  </time>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <HelpfulButton
                placeId={place.id}
                initialCount={place.likeCount}
                initialLiked={place.viewerHasLiked}
                isAuthenticated={isAuthenticated}
                nextPath={`/jelajahi/${place.slug}`}
                size="md"
              />
              <ButtonLink href={navigationHref} size="lg">
                <NavigationIcon className="h-4 w-4" />
                Buka navigasi
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8 lg:py-10">
        <PhotoCarousel
          photos={place.photos}
          name={place.name}
          category={place.category}
        />

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
            </section>

            <section aria-labelledby="fasilitas-heading">
              <h2
                id="fasilitas-heading"
                className="text-2xl font-bold tracking-tight text-ink"
              >
                Fasilitas yang tercatat
              </h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                Berdasarkan catatan kontributor untuk lokasi ini.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {availableFeatureList.map((feature) => (
                  <li key={feature.key}>
                    <FeatureChip feature={feature.key} />
                  </li>
                ))}
              </ul>
              {availableFeatureList.length === 0 ? (
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                  <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Kontributor belum mencatat fasilitas aksesibilitas di lokasi
                  ini.
                </p>
              ) : null}
              {missingFeatureList.length > 0 &&
              availableFeatureList.length > 0 ? (
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                  <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Belum tercatat tersedia:{" "}
                    {missingFeatureList
                      .map((feature) => feature.label)
                      .join(", ")}
                    .
                  </span>
                </p>
              ) : null}
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
              />

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                  Lokasi
                </p>
                <p className="mt-1 flex items-start gap-1.5 text-sm font-medium text-ink">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                  {placeLocationLabel(place)}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
                </p>
              </div>

              <ButtonLink href={navigationHref} size="md" className="mt-4 w-full">
                <NavigationIcon className="h-4 w-4" />
                Navigasi ke lokasi ini
              </ButtonLink>
            </div>

            <div className="rounded-card border border-line bg-surface-muted/60 p-4 text-xs leading-relaxed text-ink-muted">
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                <ShieldCheckIcon className="h-4 w-4 text-primary-700" />
                Dari kontributor
              </p>
              <p className="mt-1.5">
                Informasi ini berasal dari pengalaman pengguna. Kondisi lokasi
                bisa berubah, jadi tetap periksa situasi terkini saat tiba.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
