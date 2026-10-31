"use client";

import { useEffect, useRef } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  AccessibilityIcon,
  CheckIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/ui/icons";
import {
  CalendarIcon,
  XIcon,
} from "@/components/volunteer/volunteer-icons";
import {
  formatEventSchedule,
  getQuotaStatus,
} from "@/lib/volunteer/format";
import type { VolunteerEvent } from "@/types/volunteer";

type VolunteerDetailDialogProps = {
  event: VolunteerEvent | null;
  onClose: () => void;
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

export function VolunteerDetailDialog({
  event,
  onClose,
}: VolunteerDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (event && !dialog.open) {
      dialog.showModal();
    } else if (!event && dialog.open) {
      dialog.close();
    }
  }, [event]);

  const quota = event ? getQuotaStatus(event) : null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="volunteer-detail-title"
      aria-describedby="volunteer-detail-description"
      aria-modal="true"
      onCancel={(cancelEvent) => {
        cancelEvent.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(clickEvent) => {
        if (clickEvent.target === dialogRef.current) {
          onClose();
        }
      }}
      className="m-auto max-h-[90dvh] w-[min(92vw,44rem)] overflow-y-auto rounded-sheet border border-line bg-surface p-0 text-ink shadow-lifted backdrop:bg-overlay"
    >
      {event && quota ? (
        <div>
          <div className="relative aspect-[16/9] overflow-hidden bg-primary-50">
            <div
              role="img"
              aria-label={event.coverAlt}
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${event.coverImage})` }}
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup detail kegiatan"
              className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/95 text-ink shadow-card transition-colors hover:bg-surface-muted"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
              {event.category}
            </p>
            <h2
              id="volunteer-detail-title"
              className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
            >
              {event.title}
            </h2>

            <p
              id="volunteer-detail-description"
              className="mt-3 leading-relaxed text-ink-muted"
            >
              {event.description}
            </p>

            <dl className="mt-6 grid gap-4 rounded-card border border-line bg-surface-muted/60 p-4 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <div>
                  <dt className="text-xs text-ink-muted">Lokasi</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">
                    {event.location}, {event.city}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <div>
                  <dt className="text-xs text-ink-muted">Tanggal & waktu</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">
                    {formatEventSchedule(event.startsAt, event.endsAt)}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <div>
                  <dt className="text-xs text-ink-muted">Penyelenggara</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">
                    {event.organizer}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                <div>
                  <dt className="text-xs text-ink-muted">Kuota peserta</dt>
                  <dd className="mt-0.5 font-mono text-sm font-medium text-ink">
                    {event.registeredCount}/{event.slots} peserta
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-5">
              <div
                className="h-2 overflow-hidden rounded-full bg-surface-muted"
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
                className={`mt-2 text-xs font-medium ${quotaTextClasses[quota.tone]}`}
              >
                {quota.label} · sisa {quota.remaining} kuota
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Yang perlu disiapkan
                </h3>
                <ul className="mt-2 space-y-2">
                  {event.requirements.map((requirement) => (
                    <li
                      key={requirement}
                      className="flex items-start gap-2 text-sm text-ink-muted"
                    >
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-card border border-primary-200 bg-primary-50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                  <AccessibilityIcon className="h-4 w-4" />
                  Info aksesibilitas
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-900">
                  {event.accessibilityNotes}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-ink-muted">
                Pendaftaran memerlukan akun Rangkul. Kamu akan diarahkan untuk
                masuk terlebih dahulu.
              </p>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <ButtonLink href="/masuk?next=/volunteer" size="md">
                  Daftar sebagai volunteer
                </ButtonLink>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
