export type SeedFeature = {
  key: string;
  label: string;
  shortLabel: string;
  category: string;
  icon: string;
  description: string;
  sortOrder: number;
};

export const SEED_FEATURES: SeedFeature[] = [
  {
    key: "ramp",
    label: "Ramp landai",
    shortLabel: "Ramp",
    category: "entrance",
    icon: "RampIcon",
    description: "Ada jalur landai untuk kursi roda di pintu ini.",
    sortOrder: 1,
  },
  {
    key: "lift",
    label: "Lift aksesibel",
    shortLabel: "Lift",
    category: "building",
    icon: "LiftIcon",
    description: "Lift dengan tombol rendah dan ruang manuver cukup.",
    sortOrder: 2,
  },
  {
    key: "accessible-toilet",
    label: "Toilet aksesibel",
    shortLabel: "Toilet",
    category: "building",
    icon: "ToiletIcon",
    description: "Toilet dengan pegangan, ruang luas, dan pintu lebar.",
    sortOrder: 3,
  },
  {
    key: "guiding-block",
    label: "Guiding block",
    shortLabel: "Guiding block",
    category: "entrance",
    icon: "GuidingBlockIcon",
    description: "Ubin pemandu taktil menuju pintu dan area utama.",
    sortOrder: 4,
  },
  {
    key: "accessible-parking",
    label: "Parkir aksesibel",
    shortLabel: "Parkir",
    category: "service",
    icon: "ParkingIcon",
    description: "Slot parkir lebar yang dekat dengan pintu aksesibel.",
    sortOrder: 5,
  },
  {
    key: "automatic-door",
    label: "Pintu otomatis",
    shortLabel: "Pintu otomatis",
    category: "entrance",
    icon: "DoorIcon",
    description: "Pintu terbuka otomatis tanpa perlu menarik gagang.",
    sortOrder: 6,
  },
  {
    key: "wide-entrance",
    label: "Pintu lebar",
    shortLabel: "Pintu lebar",
    category: "entrance",
    icon: "AccessibilityIcon",
    description: "Lebar bukaan minimal 90 cm untuk kursi roda.",
    sortOrder: 7,
  },
];
