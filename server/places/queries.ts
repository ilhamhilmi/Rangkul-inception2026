import type { Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import { getPrisma } from "@/lib/db/prisma";
import { isAccessibilityKey, isPlaceCategory } from "@/lib/constants/places";
import {
  placeDetailInclude,
  placeSummaryInclude,
  toPlaceDetail,
  toPlaceSummary,
} from "@/server/places/mappers";

export type PlaceFilters = {
  q?: string;
  kategori?: string;
  fasilitas?: string;
};

export async function getPlaceSummaries(filters: PlaceFilters = {}) {
  "use cache";
  cacheLife("minutes");
  cacheTag("places");

  const query = filters.q?.trim() ?? "";
  const category = filters.kategori?.trim() ?? "";
  const facility = filters.fasilitas?.trim() ?? "";

  const where: Prisma.PlaceWhereInput = {
    status: "PUBLISHED",
    archivedAt: null,
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { province: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (category && isPlaceCategory(category)) {
    where.category = category.toUpperCase() as Prisma.PlaceWhereInput["category"];
  }

  if (facility && isAccessibilityKey(facility)) {
    where.entrances = {
      some: {
        features: {
          some: {
            value: "AVAILABLE",
            feature: { key: facility },
          },
        },
      },
    };
  }

  const places = await getPrisma().place.findMany({
    where,
    include: placeSummaryInclude,
    orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }, { name: "asc" }],
  });

  return places.map(toPlaceSummary);
}

export async function getPlaceCount() {
  "use cache";
  cacheLife("minutes");
  cacheTag("places");

  return getPrisma().place.count({
    where: { status: "PUBLISHED", archivedAt: null },
  });
}

export async function getPlaceBySlug(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag("places");
  cacheTag(`place:${slug}`);

  const place = await getPrisma().place.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      archivedAt: null,
    },
    include: placeDetailInclude,
  });

  return place ? toPlaceDetail(place) : null;
}

export async function getPlaceForNavigation(slug: string) {
  return getPlaceBySlug(slug);
}
