import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  MapPinIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import type { Community } from "@/types/community";
import { CommunityCover } from "@/components/communities/community-cover";
import { JoinCommunityButton } from "@/components/communities/join-community-button";

function contactLabel(contact: string) {
  if (contact.startsWith("@")) return contact;
  return contact;
}

export function CommunityCard({ community }: { community: Community }) {
  const visibleFocus = community.focus.slice(0, 3);
  const remainingFocus = community.focus.length - visibleFocus.length;

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-xs transition-shadow duration-150 hover:shadow-card">
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

        <h3 className="mt-1.5 break-words text-xl font-semibold tracking-tight text-ink">
          <Link
            href={`/komunitas/${community.slug}`}
            className="rounded underline-offset-4 transition-colors hover:text-primary-800 hover:underline"
          >
            {community.name}
          </Link>
        </h3>

        <p className="mt-1 break-words text-sm text-ink-muted">
          Kontak: {contactLabel(community.contact)}
        </p>

        <p className="mt-3 line-clamp-3 break-words text-sm leading-relaxed text-ink-muted">
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
          <p className="text-xs text-ink-muted">Komunitas terverifikasi</p>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <ButtonLink
              href={`/komunitas/${community.slug}`}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Lihat profil
            </ButtonLink>
            <JoinCommunityButton
              communityName={community.name}
              joinUrl={community.joinUrl}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
