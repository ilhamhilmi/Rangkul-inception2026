import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import {
  ChevronRightIcon,
  MapPinIcon,
  NavigationIcon,
} from "@/components/ui/icons";
import { formatShortDate } from "@/lib/utils/format";
import type { PlaceSummary } from "@/types/place";
import { CategoryBadge } from "./category-badge";
import { FeatureChip } from "./feature-chip";
import { PlaceMedia } from "./place-media";
import { RatingDisplay } from "./rating-display";

export function PlaceCard({ place }: { place: PlaceSummary }) {
  const shownFeatures = place.availableFeatures.slice(0, 4);
  const remaining = place.availableFeatures.length - shownFeatures.length;

  return (
    <article className="group overflow-hidden rounded-sheet border border-line bg-surface shadow-xs transition-shadow focus-within:shadow-card hover:shadow-card">
      <div className="flex flex-col md:flex-row">
        <PlaceMedia
          category={place.category}
          className="h-44 w-full shrink-0 md:h-auto md:w-60 md:min-h-64"
        />

        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CategoryBadge category={place.category} />
            <span className="text-xs text-ink-muted">
              {formatShortDate(place.createdAt)}
            </span>
          </div>

          <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            <Link
              href={`/jelajahi/${place.slug}`}
              className="underline-offset-4 hover:text-primary-800 hover:underline"
            >
              {place.name}
            </Link>
          </h2>

          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPinIcon className="h-4 w-4 shrink-0 text-primary-700" />
            {place.city}, {place.province}
          </p>

          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {place.description}
          </p>

          <ul
            className="mt-4 flex flex-wrap gap-1.5"
            aria-label={`Fasilitas tersedia di ${place.name}`}
          >
            {shownFeatures.map((feature) => (
              <li key={feature}>
                <FeatureChip feature={feature} />
              </li>
            ))}
            {remaining > 0 ? (
              <li className="inline-flex items-center rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
                +{remaining} fasilitas
              </li>
            ) : null}
          </ul>

          <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <RatingDisplay
                rating={place.rating}
                reviewCount={place.reviewCount}
              />
              <p className="mt-1 truncate text-xs text-ink-muted">
                {place.entranceCount} pintu masuk · dikontribusikan oleh{" "}
                {place.contributor}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ButtonLink
                href={`/jelajahi/${place.slug}/navigasi`}
                size="sm"
              >
                <NavigationIcon className="h-4 w-4" />
                Navigasi
              </ButtonLink>
              <ButtonLink
                href={`/jelajahi/${place.slug}`}
                variant="secondary"
                size="sm"
              >
                Lihat detail
                <ChevronRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
