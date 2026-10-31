export type PlaceCategory =
  | "wisata"
  | "kuliner"
  | "transportasi"
  | "ibadah"
  | "fasilitas-umum"
  | "kesehatan"
  | "lainnya";

export type AccessibilityKey =
  | "ramp"
  | "lift"
  | "accessible-toilet"
  | "guiding-block"
  | "accessible-parking"
  | "automatic-door"
  | "wide-entrance";

export type FeatureStatus = "available" | "unavailable" | "unknown";

export type AccessibilityFeature = {
  key: AccessibilityKey;
  label: string;
  shortLabel: string;
  description: string;
};

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type EntranceRoute = {
  distance: string;
  duration: string;
  condition: string;
  steps: string[];
};

export type Entrance = LatLng & {
  id: string;
  label: string;
  isMain: boolean;
  notes: string;
  route: EntranceRoute;
  features: Record<AccessibilityKey, FeatureStatus>;
};

export type PlacePhotoItem = {
  id: string;
  url: string;
  alt: string;
};

export type Place = LatLng & {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  city: string | null;
  province: string | null;
  address: string | null;
  description: string;
  contributor: string;
  authorAvatarUrl: string | null;
  createdAt: string;
  rating: number;
  likeCount: number;
  viewerHasLiked: boolean;
  photos: PlacePhotoItem[];
  entrances: Entrance[];
};

export type PlaceSummary = Omit<Place, "entrances" | "photos"> & {
  availableFeatures: AccessibilityKey[];
  coverPhotoUrl: string | null;
  photoCount: number;
};

export type PlaceDetail = Place & {
  availableFeatures: AccessibilityKey[];
};
