import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  ExternalLinkIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import type { Community } from "@/types/community";
import { CommunityCover } from "@/components/communities/community-cover";
import { JoinCommunityButton } from "@/components/communities/join-community-button";

function getMapsHref(community: Community) {
  const query = encodeURIComponent(
    `${community.name}, ${community.city}, ${community.province}`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function CommunityCard({ community }: { community: Community }) {
  const visibleFocus = community.focus.slice(0, 3);
  const remainingFocus = community.focus.length - visibleFocus.length;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-xs transition-shadow duration-150 hover:shadow-card">
      <div className="relative">
        <CommunityCover community={community} className="h-36 sm:h-40" />
        <Badge
          tone="success"
          className="absolute left-4 top-4 shadow-xs"
        >
          <ShieldCheckIcon className="h-3.5 w-3.5" />
          Terverifikasi
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-start gap-1.5 text-sm text-ink-muted">
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
          <span>
            {community.city}, {community.province}
          </span>
        </p>

        <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">
          <Link
            href={`/komunitas/${community.slug}`}
            className="rounded underline-offset-4 transition-colors hover:text-primary-800 hover:underline"
          >
            {community.name}
          </Link>
        </h3>

        <p className="mt-1 text-sm text-ink-muted">
          Pengurus: {community.contact.personName}
        </p>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
          {community.description}
        </p>

        <ul
          className="mt-4 flex flex-wrap gap-1.5"
          aria-label={`Fokus ${community.name}`}
        >
          {visibleFocus.map((focus) => (
            <li key={focus}>
              <Badge tone="primary">{focus}</Badge>
            </li>
          ))}
          {remainingFocus > 0 ? (
            <li>
              <Badge tone="neutral">+{remainingFocus}</Badge>
            </li>
          ) : null}
        </ul>

        <div className="mt-auto border-t border-line pt-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-ink-muted">
            <span>Berdiri sejak {community.foundedYear}</span>
            <a
              href={getMapsHref(community)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded font-medium text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline"
            >
              <MapPinIcon className="h-3.5 w-3.5" />
              Peta lokasi
              <span className="sr-only">
                {" "}
                {community.name} (buka di tab baru)
              </span>
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <ButtonLink
              href={`/komunitas/${community.slug}`}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Lihat profil
            </ButtonLink>
            <JoinCommunityButton communityName={community.name} />
          </div>
        </div>
      </div>
    </article>
  );
}
