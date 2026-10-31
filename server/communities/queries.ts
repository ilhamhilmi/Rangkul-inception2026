import "server-only";

import type { Community as CommunityRecord, Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import type {
  Community,
  CommunityDirectoryResult,
  CommunityFocus,
  CommunitySocials,
} from "@/types/community";

const publicCommunityWhere = {
  status: "VERIFIED",
  archivedAt: null,
} satisfies Prisma.CommunityWhereInput;

function parseSocials(value: Prisma.JsonValue): CommunitySocials {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const record = value as Record<string, unknown>;
  const socials: CommunitySocials = {};

  if (typeof record.instagram === "string") socials.instagram = record.instagram;
  if (typeof record.facebook === "string") socials.facebook = record.facebook;
  if (typeof record.website === "string") socials.website = record.website;

  return socials;
}

function toCommunity(record: CommunityRecord): Community {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    province: record.province,
    city: record.city,
    focus: record.focus as CommunityFocus[],
    contact: record.contact,
    socials: parseSocials(record.socials),
    joinUrl: record.joinUrl,
    logoUrl: record.logoUrl,
    status: record.status,
    verifiedAt: record.verifiedAt?.toISOString() ?? null,
  };
}

export async function getCommunityDirectory(filters: {
  q?: string;
  province?: string;
  focus?: string;
}): Promise<CommunityDirectoryResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag("communities");

  const query = filters.q?.trim() ?? "";
  const province = filters.province?.trim() ?? "";
  const focus = filters.focus?.trim() ?? "";

  const where: Prisma.CommunityWhereInput = {
    ...publicCommunityWhere,
    ...(province ? { province } : {}),
    ...(focus ? { focus: { has: focus } } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { province: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, filteredTotal, totalVerified] = await prisma.$transaction([
    prisma.community.findMany({
      where,
      orderBy: [{ verifiedAt: "desc" }, { name: "asc" }],
      take: 100,
    }),
    prisma.community.count({ where }),
    prisma.community.count({ where: publicCommunityWhere }),
  ]);

  return {
    items: items.map(toCommunity),
    filteredTotal,
    totalVerified,
  };
}

export async function getCommunityBySlug(slug: string): Promise<Community | null> {
  "use cache";
  cacheLife("days");
  cacheTag(`community:${slug}`);

  const community = await prisma.community.findFirst({
    where: {
      ...publicCommunityWhere,
      slug,
    },
  });

  return community ? toCommunity(community) : null;
}

export async function getRelatedCommunities(
  community: Pick<Community, "id" | "province" | "focus">,
  limit = 3,
): Promise<Community[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("communities");

  const related = await prisma.community.findMany({
    where: {
      ...publicCommunityWhere,
      id: { not: community.id },
      OR: [
        { province: community.province },
        { focus: { hasSome: community.focus } },
      ],
    },
    orderBy: [{ province: "asc" }, { verifiedAt: "desc" }],
    take: Math.min(Math.max(limit, 1), 12),
  });

  return related.map(toCommunity);
}
