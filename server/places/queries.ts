import type { Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import { getPrisma } from "@/lib/db/prisma";
import { isPlaceCategory, PLACE_CATEGORY_TO_PRISMA } from "@/lib/constants/places";
import {
  placeDetailInclude,
  placeSummaryInclude,
  toPlaceDetail,
  toPlaceSummary,
} from "@/server/places/mappers";

export type PlaceFilters = {
  q?: string;
  kategori?: string;
};

export async function getPlaceSummaries(filters: PlaceFilters = {}) {
  "use cache";
  cacheLife("minutes");
  cacheTag("places");

  const query = filters.q?.trim().slice(0, 120) ?? "";
  const category = filters.kategori?.trim() ?? "";

  const where: Prisma.PlaceWhereInput = {
    status: "PUBLISHED",
    archivedAt: null,
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
    ];
  }

  if (category && isPlaceCategory(category)) {
    where.category = PLACE_CATEGORY_TO_PRISMA[category];
  }

  const places = await getPrisma().place.findMany({
    where,
    include: placeSummaryInclude,
    orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
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

/**
 * Status "Paling membantu" milik pengguna aktif. Sengaja tidak memakai cache
 * karena berbeda per pengguna dan berubah setelah tombol ditekan.
 */
export async function getViewerLikedPlace(userId: string, placeId: string) {
  const like = await getPrisma().placeLike.findUnique({
    where: { placeId_userId: { placeId, userId } },
    select: { id: true },
  });

  return Boolean(like);
}

/**
 * Ambil like milik pengguna untuk sekumpulan postingan sekaligus, dipakai feed
 * agar tidak perlu satu query per kartu.
 */
export async function getViewerLikedPlaceIds(
  userId: string,
  placeIds: string[],
) {
  if (placeIds.length === 0) return new Set<string>();

  const rows = await getPrisma().placeLike.findMany({
    where: { userId, placeId: { in: placeIds } },
    select: { placeId: true },
  });

  return new Set(rows.map((row) => row.placeId));
}

export async function getPlaceForNavigation(slug: string) {
  return getPlaceBySlug(slug);
}
