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

export interface CommunitySocials {
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  province: string;
  city: string;
  focus: CommunityFocus[];
  contact: string;
  socials: CommunitySocials;
  joinUrl: string;
  logoUrl: string | null;
  status: CommunityStatus;
  verifiedAt: string | null;
}

export interface CommunityDirectoryResult {
  items: Community[];
  filteredTotal: number;
  totalVerified: number;
}

export type CommunityFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  submittedName?: string;
};
