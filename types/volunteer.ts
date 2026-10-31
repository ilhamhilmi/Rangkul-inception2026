export type VolunteerCategory =
  | "Bantuan Acara"
  | "Pendataan Aksesibilitas"
  | "Kegiatan Sosial"
  | "Program Inklusif";

export type VolunteerCategoryFilter = "all" | VolunteerCategory;

export type VolunteerTimeFilter = "all" | "2026-11" | "2026-12" | "2027-01";

export type VolunteerEvent = {
  slug: string;
  title: string;
  category: VolunteerCategory;
  city: string;
  location: string;
  startsAt: string;
  endsAt: string;
  organizer: string;
  registeredCount: number;
  slots: number;
  description: string;
  requirements: string[];
  accessibilityNotes: string;
  coverImage: string;
  coverAlt: string;
};

export type VolunteerFilters = {
  query: string;
  category: VolunteerCategoryFilter;
  location: string;
  time: VolunteerTimeFilter;
};

export type VolunteerQuotaTone = "success" | "warning" | "danger";

export type VolunteerQuotaStatus = {
  tone: VolunteerQuotaTone;
  label: string;
  percentage: number;
  remaining: number;
};
