"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  AccessibilityIcon,
  CalendarIcon,
  CheckIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { XIcon } from "@/components/volunteer/volunteer-icons";
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

const subscribe = () => () => {};

export function VolunteerDetailDialog({
  event,
  onClose,
}: VolunteerDetailDialogProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!event) return;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function handleKeyDown(keyEvent: KeyboardEvent) {
      if (keyEvent.key === "Escape") {
        keyEvent.preventDefault();
        onClose();
        return;
      }

      if (keyEvent.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (keyEvent.shiftKey && document.activeElement === first) {
        keyEvent.preventDefault();
        last.focus();
      } else if (!keyEvent.shiftKey && document.activeElement === last) {
        keyEvent.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [event, onClose]);

  if (!mounted || !event) return null;

  const quota = getQuotaStatus(event);

  function handleBackdropClick(clickEvent: MouseEvent<HTMLDivElement>) {
    if (clickEvent.target === clickEvent.currentTarget) {
      onClose();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="volunteer-detail-title"
        aria-describedby="volunteer-detail-description"
        tabIndex={-1}
        className="relative flex max-h-[100dvh] w-full flex-col overflow-hidden bg-surface text-ink shadow-lifted outline-none sm:max-h-[min(90dvh,48rem)] sm:max-w-3xl sm:rounded-sheet"
      >
        <div className="relative h-40 shrink-0 overflow-hidden bg-primary-50 sm:h-52">
          <div
            role="img"
            aria-label={event.coverAlt}
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${event.coverImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail kegiatan"
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-ink/55 text-white backdrop-blur-sm transition-colors hover:bg-ink/75 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <XIcon className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end gap-2 p-4 sm:p-5">
            <span className="rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {event.category}
            </span>
            <span className="rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {event.city}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
          <div>
            <h2
              id="volunteer-detail-title"
              className="text-xl font-bold tracking-tight text-ink sm:text-2xl"
            >
              {event.title}
            </h2>
            <p
              id="volunteer-detail-description"
              className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base"
            >
              {event.description}
            </p>
          </div>

          <dl className="grid gap-x-5 gap-y-4 rounded-card border border-line bg-surface-muted/60 p-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
              <div className="min-w-0">
                <dt className="text-xs text-ink-muted">Lokasi</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">
                  {event.location}, {event.city}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
              <div className="min-w-0">
                <dt className="text-xs text-ink-muted">Tanggal & waktu</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">
                  {formatEventSchedule(event.startsAt, event.endsAt)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
              <div className="min-w-0">
                <dt className="text-xs text-ink-muted">Penyelenggara</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">
                  {event.organizer}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
              <div className="min-w-0">
                <dt className="text-xs text-ink-muted">Kuota peserta</dt>
                <dd className="mt-0.5 font-mono text-sm font-medium text-ink">
                  {event.registeredCount}/{event.slots} peserta
                </dd>
              </div>
            </div>
          </dl>

          <div>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Yang perlu disiapkan
              </h3>
              <ul className="mt-2 space-y-2">
                {event.requirements
                  .split("\n")
                  .map((requirement) => requirement.trim())
                  .filter(Boolean)
                  .map((requirement, index) => (
                    <li
                      key={`${index}-${requirement}`}
                      className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted"
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
        </div>

        <div className="shrink-0 border-t border-line bg-surface px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-ink-muted">
              Pendaftaran memerlukan akun Rangkul. Kamu akan diarahkan untuk
              masuk terlebih dahulu.
            </p>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <ButtonLink
                href={`/volunteer/${event.slug}`}
                size="md"
                onClick={onClose}
              >
                Lihat detail & daftar
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
    </div>,
    document.body,
  );
}
