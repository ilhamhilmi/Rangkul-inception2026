import { Badge } from "@/components/ui/badge";
import {
  MailIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import type { Community } from "@/types/community";
import {
  CommunityCover,
  CommunityMark,
} from "@/components/communities/community-cover";
import { JoinCommunityButton } from "@/components/communities/join-community-button";

export function CommunityProfileHeader({
  community,
}: {
  community: Community;
}) {
  return (
    <section
      aria-labelledby="judul-komunitas"
      className="overflow-hidden rounded-sheet border border-line bg-surface shadow-xs"
    >
      <CommunityCover
        community={community}
        showMark={false}
        className="h-36 sm:h-48"
      />

      <div className="relative z-10 px-5 pb-6 sm:px-8">
        <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <CommunityMark community={community} size="lg" />

            <div className="min-w-0 pb-1">
              <Badge tone="success">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                Terverifikasi admin
              </Badge>
              <h1
                id="judul-komunitas"
                className="mt-2 break-words text-2xl font-bold tracking-tight text-ink sm:text-3xl"
              >
                {community.name}
              </h1>
            </div>
          </div>

          <JoinCommunityButton
            communityName={community.name}
            joinUrl={community.joinUrl}
            size="lg"
            className="w-full sm:mb-1 sm:w-auto sm:min-w-44"
          />
        </div>

        <p className="mt-4 line-clamp-3 max-w-2xl break-words text-lg leading-relaxed text-ink-muted">
          {community.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon className="h-4 w-4 shrink-0 text-primary-700" />
            {community.city}, {community.province}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MailIcon className="h-4 w-4 shrink-0 text-primary-700" />
            {community.contact}
          </span>
        </div>

        <ul
          className="mt-4 flex flex-wrap gap-1.5"
          aria-label={`Fokus ${community.name}`}
        >
          {community.focus.map((focus) => (
            <li key={focus}>
              <Badge tone="primary">{focus}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
