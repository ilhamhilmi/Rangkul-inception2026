import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import {
  CameraIcon,
  ChevronRightIcon,
  MapPinIcon,
  NavigationIcon,
} from "@/components/ui/icons";
import { formatShortDate } from "@/lib/utils/format";
import type { PlaceSummary } from "@/types/place";
import { CategoryBadge } from "./category-badge";
import { FeatureChip } from "./feature-chip";
import { HelpfulButton } from "./helpful-button";
import { PlaceMedia } from "./place-media";

export function placeLocationLabel(place: {
  city: string | null;
  province: string | null;
  address: string | null;
}) {
  const region = [place.city, place.province].filter(Boolean).join(", ");
  return region || place.address || "Lokasi ditandai di peta";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const value = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return value || "R";
}

export function PostCard({
  place,
  isAuthenticated,
}: {
  place: PlaceSummary;
  isAuthenticated: boolean;
}) {
  const shownFeatures = place.availableFeatures.slice(0, 2);
  const remaining = place.availableFeatures.length - shownFeatures.length;
  const detailHref = `/jelajahi/${place.slug}`;

  return (
    <article className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-sheet border border-line bg-surface shadow-xs transition-shadow focus-within:shadow-card hover:shadow-card">
      <Link
        href={detailHref}
        aria-hidden="true"
        tabIndex={-1}
        className="relative block shrink-0 overflow-hidden bg-surface-muted"
      >
        {place.coverPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.coverPhotoUrl}
            alt=""
            className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <PlaceMedia
            category={place.category}
            className="aspect-[16/10] w-full"
          />
        )}

        {place.photoCount > 1 ? (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <CameraIcon className="h-3.5 w-3.5" />
            {place.photoCount}
          </span>
        ) : null}
      </Link>

      <header className="flex items-start gap-3 px-4 pt-4 sm:px-5">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-100 text-sm font-bold text-primary-800"
        >
          {place.authorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={place.authorAvatarUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            initials(place.contributor)
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {place.contributor}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
            <time dateTime={place.createdAt}>
              {formatShortDate(place.createdAt)}
            </time>
            <span aria-hidden="true">·</span>
            <CategoryBadge category={place.category} />
          </p>
        </div>
      </header>

      <div className="min-w-0 flex-1 px-4 pb-4 pt-3 sm:px-5">
        <h2 className="break-words text-lg font-semibold leading-snug tracking-tight text-ink">
          <Link
            href={detailHref}
            className="underline-offset-4 hover:text-primary-800 hover:underline"
          >
            {place.name}
          </Link>
        </h2>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPinIcon className="h-4 w-4 shrink-0 text-primary-700" />
          <span className="truncate">{placeLocationLabel(place)}</span>
        </p>

        <p className="mt-3 line-clamp-4 whitespace-pre-line break-words text-sm leading-relaxed text-ink">
          {place.description}
        </p>

        {shownFeatures.length > 0 ? (
          <ul
            className="mt-3 flex flex-wrap gap-1.5"
            aria-label={`Fasilitas tercatat di ${place.name}`}
          >
            {shownFeatures.map((feature) => (
              <li key={feature}>
                <FeatureChip feature={feature} />
              </li>
            ))}
            {remaining > 0 ? (
              <li className="inline-flex items-center rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
                +{remaining}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>

      <footer className="mt-auto border-t border-line bg-surface-muted/30 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <HelpfulButton
            placeId={place.id}
            initialCount={place.likeCount}
            initialLiked={place.viewerHasLiked}
            isAuthenticated={isAuthenticated}
            nextPath={detailHref}
          />
          <Link
            href={detailHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-800 underline-offset-4 hover:underline"
          >
            Detail
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <ButtonLink
          href={`/jelajahi/${place.slug}/navigasi`}
          variant="secondary"
          size="sm"
          className="mt-2.5 w-full"
        >
          <NavigationIcon className="h-4 w-4" />
          Navigasi
        </ButtonLink>
      </footer>
    </article>
  );
}
