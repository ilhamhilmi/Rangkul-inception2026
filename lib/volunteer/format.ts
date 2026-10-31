import type { VolunteerEvent, VolunteerQuotaStatus } from "@/types/volunteer";

const longDateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

export function formatEventDate(startsAt: string) {
  return longDateFormatter.format(new Date(startsAt));
}

export function formatEventShortDate(startsAt: string) {
  return shortDateFormatter.format(new Date(startsAt));
}

export function formatEventSchedule(startsAt: string, endsAt: string) {
  return `${formatEventDate(startsAt)} · ${timeFormatter.format(
    new Date(startsAt),
  )}–${timeFormatter.format(new Date(endsAt))} WIB`;
}

export function getQuotaStatus(
  event: Pick<VolunteerEvent, "registeredCount" | "slots">,
): VolunteerQuotaStatus {
  const remaining = Math.max(0, event.slots - event.registeredCount);
  const percentage =
    event.slots > 0
      ? Math.min(
          100,
          Math.round((event.registeredCount / event.slots) * 100),
        )
      : 100;

  if (remaining === 0) {
    return {
      tone: "danger",
      label: "Kuota penuh",
      percentage,
      remaining,
    };
  }

  if (remaining <= Math.ceil(event.slots * 0.2)) {
    return {
      tone: "warning",
      label: "Hampir penuh",
      percentage,
      remaining,
    };
  }

  return {
    tone: "success",
    label: "Kuota tersedia",
    percentage,
    remaining,
  };
}
