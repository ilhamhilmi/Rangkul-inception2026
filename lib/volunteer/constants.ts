import type {
  VolunteerCategory,
  VolunteerTimeFilter,
} from "@/types/volunteer";

export const VOLUNTEER_CATEGORIES: VolunteerCategory[] = [
  "Bantuan Acara",
  "Pendataan Aksesibilitas",
  "Kegiatan Sosial",
  "Program Inklusif",
];

export const VOLUNTEER_TIME_FILTERS: {
  value: VolunteerTimeFilter;
  label: string;
}[] = [
  { value: "all", label: "Semua waktu" },
  { value: "2026-11", label: "November 2026" },
  { value: "2026-12", label: "Desember 2026" },
  { value: "2027-01", label: "Januari 2027" },
];
