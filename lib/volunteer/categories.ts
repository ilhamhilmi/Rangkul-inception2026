import type { EventCategory } from "@prisma/client";

import type { VolunteerCategory } from "@/types/volunteer";

export const EVENT_CATEGORY_LABELS: Record<EventCategory, VolunteerCategory> = {
  EVENT_SUPPORT: "Bantuan Acara",
  ACCESSIBILITY_AUDIT: "Pendataan Aksesibilitas",
  SOCIAL_ACTIVITY: "Kegiatan Sosial",
  INCLUSIVE_PROGRAM: "Program Inklusif",
  OTHER: "Lainnya",
};

export const EVENT_CATEGORY_VALUES = Object.keys(
  EVENT_CATEGORY_LABELS,
) as EventCategory[];

export function categoryLabel(category: EventCategory): VolunteerCategory {
  return EVENT_CATEGORY_LABELS[category];
}

export function categoryValue(
  label: string,
): EventCategory | undefined {
  return EVENT_CATEGORY_VALUES.find(
    (value) => EVENT_CATEGORY_LABELS[value] === label,
  );
}
