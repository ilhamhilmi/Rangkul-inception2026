import type {
  AccessibilityKey,
  Entrance,
  FeatureStatus,
  Place,
  PlaceCategory,
  PlaceDetail,
  PlaceSummary,
} from "@/types/place";
import { ACCESSIBILITY_FEATURES, isAccessibilityKey } from "@/lib/constants/places";
import type { Prisma } from "@prisma/client";

export const placeDetailInclude = {
  createdBy: { select: { name: true, avatarUrl: true } },
  _count: { select: { likes: true, photos: true } },
  photos: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, url: true, alt: true },
  },
  entrances: {
    orderBy: [{ isMain: "desc" }, { label: "asc" }],
    include: {
      features: {
        include: { feature: { select: { key: true } } },
      },
    },
  },
} satisfies Prisma.PlaceInclude;

export const placeSummaryInclude = {
  createdBy: { select: { name: true, avatarUrl: true } },
  _count: { select: { likes: true, photos: true } },
  photos: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 1,
    select: { id: true, url: true, alt: true },
  },
  entrances: {
    select: {
      features: {
        select: { value: true, feature: { select: { key: true } } },
      },
    },
  },
} satisfies Prisma.PlaceInclude;

export type PlaceWithDetail = Prisma.PlaceGetPayload<{
  include: typeof placeDetailInclude;
}>;

export type PlaceWithSummary = Prisma.PlaceGetPayload<{
  include: typeof placeSummaryInclude;
}>;

const CATEGORY_MAP: Record<Prisma.PlaceGetPayload<object>["category"], PlaceCategory> =
  {
    WISATA: "wisata",
    KULINER: "kuliner",
    TRANSPORTASI: "transportasi",
    IBADAH: "ibadah",
    KESEHATAN: "kesehatan",
    FASILITAS_UMUM: "fasilitas-umum",
    LAINNYA: "lainnya",
  };

const FEATURE_VALUE_MAP = {
  AVAILABLE: "available",
  NOT_AVAILABLE: "unavailable",
  UNKNOWN: "unknown",
} as const satisfies Record<string, FeatureStatus>;

function emptyFeatures(): Record<AccessibilityKey, FeatureStatus> {
  return Object.fromEntries(
    ACCESSIBILITY_FEATURES.map((feature) => [feature.key, "unknown"]),
  ) as Record<AccessibilityKey, FeatureStatus>;
}

function formatDistance(meters: number | null) {
  if (meters === null) return "—";
  if (meters >= 1000) {
    return `${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 1,
    }).format(meters / 1000)} km`;
  }

  return `${meters} m`;
}

function formatDuration(minutes: number | null) {
  if (minutes === null) return "—";
  return `${minutes} menit`;
}

function mapEntrance(
  entrance: PlaceWithDetail["entrances"][number],
): Entrance {
  const features = emptyFeatures();

  for (const item of entrance.features) {
    if (!isAccessibilityKey(item.feature.key)) continue;
    features[item.feature.key] = FEATURE_VALUE_MAP[item.value];
  }

  return {
    id: entrance.id,
    label: entrance.label,
    isMain: entrance.isMain,
    notes: entrance.notes ?? "",
    latitude: Number(entrance.latitude ?? 0),
    longitude: Number(entrance.longitude ?? 0),
    features,
    route: {
      distance: formatDistance(entrance.routeDistanceM),
      duration: formatDuration(entrance.routeDurationMin),
      condition: entrance.routeCondition ?? "",
      steps: entrance.routeSteps,
    },
  };
}

type PlaceFeatureSource = {
  facilities: string[];
  entrances: {
    features: { value: string; feature: { key: string } }[];
  }[];
};

function availableFeatureKeys(place: PlaceFeatureSource): AccessibilityKey[] {
  const available = new Set<AccessibilityKey>();

  for (const key of place.facilities) {
    if (isAccessibilityKey(key)) available.add(key);
  }

  for (const entrance of place.entrances) {
    for (const item of entrance.features) {
      if (item.value !== "AVAILABLE") continue;
      if (isAccessibilityKey(item.feature.key)) {
        available.add(item.feature.key);
      }
    }
  }

  return ACCESSIBILITY_FEATURES.filter((feature) =>
    available.has(feature.key),
  ).map((feature) => feature.key);
}

export function toPlaceDetail(place: PlaceWithDetail): PlaceDetail {
  const entrances = place.entrances.map(mapEntrance);

  const detail: Place = {
    id: place.id,
    slug: place.slug,
    name: place.name,
    category: CATEGORY_MAP[place.category],
    city: place.city,
    province: place.province,
    address: place.address,
    description: place.description,
    contributor: place.createdBy?.name ?? "Kontributor Rangkul",
    authorAvatarUrl: place.createdBy?.avatarUrl ?? null,
    createdAt: place.createdAt.toISOString(),
    rating: place.posterRating ?? 0,
    likeCount: place._count.likes,
    viewerHasLiked: false,
    photos: place.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      alt: photo.alt,
    })),
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    entrances,
  };

  return {
    ...detail,
    availableFeatures: availableFeatureKeys(place),
  };
}

export function toPlaceSummary(place: PlaceWithSummary): PlaceSummary {
  return {
    id: place.id,
    slug: place.slug,
    name: place.name,
    category: CATEGORY_MAP[place.category],
    city: place.city,
    province: place.province,
    address: place.address,
    description: place.description,
    contributor: place.createdBy?.name ?? "Kontributor Rangkul",
    authorAvatarUrl: place.createdBy?.avatarUrl ?? null,
    createdAt: place.createdAt.toISOString(),
    rating: place.posterRating ?? 0,
    likeCount: place._count.likes,
    viewerHasLiked: false,
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    coverPhotoUrl: place.photos[0]?.url ?? null,
    photoCount: place._count.photos,
    availableFeatures: availableFeatureKeys(place),
  };
}
