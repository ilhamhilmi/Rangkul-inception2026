export type PlaceCategory =
  | "wisata"
  | "kuliner"
  | "transportasi"
  | "ibadah"
  | "kesehatan";

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

export type EntranceRoute = {
  distance: string;
  duration: string;
  condition: string;
  steps: string[];
};

export type Entrance = {
  id: string;
  label: string;
  isMain: boolean;
  notes: string;
  route: EntranceRoute;
  features: Record<AccessibilityKey, FeatureStatus>;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  body: string;
  accessibilityNote?: string;
};

export type Place = {
  slug: string;
  name: string;
  category: PlaceCategory;
  city: string;
  province: string;
  address: string;
  description: string;
  contributor: string;
  createdAt: string;
  rating: number;
  reviewCount: number;
  entrances: Entrance[];
  reviews: Review[];
};

export type PlaceSummary = Omit<Place, "entrances" | "reviews"> & {
  entranceCount: number;
  availableFeatures: AccessibilityKey[];
};

export type PlaceDetail = Place & {
  entranceCount: number;
  availableFeatures: AccessibilityKey[];
};
