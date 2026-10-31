import type {
  AccessibilityFeature,
  AccessibilityKey,
  PlaceCategory,
} from "@/types/place";

export const PLACE_CATEGORIES: {
  value: PlaceCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "wisata",
    label: "Wisata",
    description: "Taman, museum, pantai, dan ruang publik",
  },
  {
    value: "kuliner",
    label: "Kuliner",
    description: "Kafe, restoran, dan tempat makan",
  },
  {
    value: "transportasi",
    label: "Transportasi",
    description: "Stasiun, terminal, dan halte",
  },
  {
    value: "ibadah",
    label: "Ibadah",
    description: "Masjid, gereja, pura, dan vihara",
  },
  {
    value: "fasilitas-umum",
    label: "Fasilitas Umum",
    description: "Kantor layanan publik, perpustakaan, dan ruang komunitas",
  },
  {
    value: "kesehatan",
    label: "Fasilitas Kesehatan",
    description: "Rumah sakit, puskesmas, dan klinik",
  },
  {
    value: "lainnya",
    label: "Lainnya",
    description: "Tempat lain yang belum masuk kategori di atas",
  },
];

/** Pemetaan nilai URL/kategori aplikasi ke enum Prisma. */
export const PLACE_CATEGORY_TO_PRISMA = {
  wisata: "WISATA",
  kuliner: "KULINER",
  transportasi: "TRANSPORTASI",
  ibadah: "IBADAH",
  "fasilitas-umum": "FASILITAS_UMUM",
  kesehatan: "KESEHATAN",
  lainnya: "LAINNYA",
} as const satisfies Record<PlaceCategory, string>;

export const ACCESSIBILITY_FEATURES: AccessibilityFeature[] = [
  {
    key: "ramp",
    label: "Ramp landai",
    shortLabel: "Ramp",
    description: "Ada jalur landai untuk kursi roda di pintu ini.",
  },
  {
    key: "lift",
    label: "Lift aksesibel",
    shortLabel: "Lift",
    description: "Lift dengan tombol rendah dan ruang manuver cukup.",
  },
  {
    key: "accessible-toilet",
    label: "Toilet aksesibel",
    shortLabel: "Toilet",
    description: "Toilet dengan pegangan, ruang luas, dan pintu lebar.",
  },
  {
    key: "guiding-block",
    label: "Guiding block",
    shortLabel: "Guiding block",
    description: "Ubin pemandu taktil menuju pintu dan area utama.",
  },
  {
    key: "accessible-parking",
    label: "Parkir aksesibel",
    shortLabel: "Parkir",
    description: "Slot parkir lebar yang dekat dengan pintu aksesibel.",
  },
  {
    key: "automatic-door",
    label: "Pintu otomatis",
    shortLabel: "Pintu otomatis",
    description: "Pintu terbuka otomatis tanpa perlu menarik gagang.",
  },
  {
    key: "wide-entrance",
    label: "Pintu lebar",
    shortLabel: "Pintu lebar",
    description: "Lebar bukaan minimal 90 cm untuk kursi roda.",
  },
];

export const FEATURE_MAP: Record<AccessibilityKey, AccessibilityFeature> =
  Object.fromEntries(
    ACCESSIBILITY_FEATURES.map((feature) => [feature.key, feature]),
  ) as Record<AccessibilityKey, AccessibilityFeature>;

export const ACCESSIBILITY_KEYS = ACCESSIBILITY_FEATURES.map(
  (feature) => feature.key,
) as [AccessibilityKey, ...AccessibilityKey[]];

export function getCategoryMeta(category: PlaceCategory) {
  return (
    PLACE_CATEGORIES.find((item) => item.value === category) ??
    PLACE_CATEGORIES[0]
  );
}

export function isPlaceCategory(value: string): value is PlaceCategory {
  return PLACE_CATEGORIES.some((item) => item.value === value);
}

export function isAccessibilityKey(value: string): value is AccessibilityKey {
  return ACCESSIBILITY_FEATURES.some((item) => item.key === value);
}
