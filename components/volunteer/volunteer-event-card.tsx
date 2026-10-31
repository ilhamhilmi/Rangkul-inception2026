import { Button } from "@/components/ui/button";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { formatEventDate, getQuotaStatus } from "@/lib/volunteer/format";
import type { VolunteerEvent } from "@/types/volunteer";
import { CalendarIcon } from "@/components/volunteer/volunteer-icons";

type VolunteerEventCardProps = {
  event: VolunteerEvent;
  onViewDetail: () => void;
};

const quotaBarClasses = {
  success: "bg-success-600",
  warning: "bg-warning-600",
  danger: "bg-danger-600",
} as const;

const quotaTextClasses = {
  success: "text-success-700",
  warning: "text-warning-700",
  danger: "text-danger-700",
} as const;

export function VolunteerEventCard({
  event,
  onViewDetail,
}: VolunteerEventCardProps) {
  const quota = getQuotaStatus(event);
  const QuotaIcon = quota.tone === "success" ? CheckIcon : AlertIcon;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-xs transition-shadow duration-150 hover:shadow-card">
      <div className="relative aspect-[16/10] overflow-hidden bg-primary-50">
        <div
          role="img"
          aria-label={event.coverAlt}
          className="h-full w-full bg-cover bg-center transition-transform duration-300 motion-reduce:transform-none group-hover:scale-[1.02]"
          style={{ backgroundImage: `url(${event.coverImage})` }}
        />
        <span className="absolute left-4 top-4 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-primary-800 shadow-xs">
          {event.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">
          {event.title}
        </h3>

        <dl className="mt-3 space-y-2 text-sm text-ink-muted">
          <div className="flex items-start gap-2">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
            <div>
              <dt className="sr-only">Lokasi</dt>
              <dd>
                {event.location}, {event.city}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
            <div>
              <dt className="sr-only">Tanggal</dt>
              <dd>{formatEventDate(event.startsAt)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
            <div>
              <dt className="sr-only">Penyelenggara</dt>
              <dd>{event.organizer}</dd>
            </div>
          </div>
        </dl>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-ink-muted">Peserta terdaftar</span>
            <span className="font-mono font-semibold text-ink">
              {event.registeredCount}/{event.slots}
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={event.slots}
            aria-valuenow={event.registeredCount}
            aria-label={`Kuota terisi ${event.registeredCount} dari ${event.slots} peserta`}
          >
            <div
              className={`h-full rounded-full ${quotaBarClasses[quota.tone]}`}
              style={{ width: `${quota.percentage}%` }}
            />
          </div>
          <p
            className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium ${quotaTextClasses[quota.tone]}`}
          >
            <QuotaIcon className="h-3.5 w-3.5" />
            {quota.label}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-xs text-ink-muted">
            Sisa {quota.remaining} kuota
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onViewDetail}
            aria-label={`Lihat detail ${event.title}`}
            className="shrink-0"
          >
            Lihat Detail
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
