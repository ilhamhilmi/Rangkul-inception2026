export type CommunityStatus = "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";

export type CommunityFocus =
  | "Disabilitas fisik"
  | "Tuli & tunarungu"
  | "Netra & tunanetra"
  | "Disabilitas intelektual"
  | "Autisme"
  | "Inklusi pendidikan"
  | "Kesehatan mental"
  | "Seni & budaya"
  | "Olahraga inklusif"
  | "Pendampingan keluarga"
  | "Advokasi & aksesibilitas";

export interface CommunityContact {
  personName: string;
  role: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export interface CommunitySocials {
  instagram?: string;
  website?: string;
}

export interface CommunityActivity {
  title: string;
  category: string;
  startsAt: string;
  location: string;
}

export interface Community {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  province: string;
  city: string;
  focus: CommunityFocus[];
  contact: CommunityContact;
  socials: CommunitySocials;
  joinUrl: string;
  status: CommunityStatus;
  ownerId: string;
  verifiedAt: string;
  foundedYear: number;
  activities: CommunityActivity[];
}
