import "server-only";

import type { Prisma } from "@prisma/client";
import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";

function readPayloadString(payload: Prisma.JsonValue, key: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

export async function getAdminOverview() {
  await connection();

  const [
    pendingCommunities,
    pendingOrganizers,
    verifiedCommunities,
    totalProfiles,
  ] = await Promise.all([
    prisma.community.count({
      where: { status: "PENDING", archivedAt: null },
    }),
    prisma.verificationRequest.count({
      where: { type: "ORGANIZER", status: "PENDING" },
    }),
    prisma.community.count({
      where: { status: "VERIFIED", archivedAt: null },
    }),
    prisma.profile.count(),
  ]);

  return {
    pendingCommunities,
    pendingOrganizers,
    verifiedCommunities,
    totalProfiles,
  };
}

/**
 * Komunitas PENDING beserta request verifikasi yang cocok. Request lama dari
 * seed mungkin tidak punya payload communityId, jadi fallback ke ownerId.
 */
export async function getPendingCommunityApplications() {
  await connection();

  const [communities, requests] = await Promise.all([
    prisma.community.findMany({
      where: { status: "PENDING", archivedAt: null },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.verificationRequest.findMany({
      where: { type: "COMMUNITY", status: "PENDING" },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  return communities.map((community) => {
    const request =
      requests.find(
        (item) => readPayloadString(item.payload, "communityId") === community.id,
      ) ??
      requests.find((item) => item.userId === community.ownerId) ??
      null;

    return { community, request };
  });
}

export async function getPendingOrganizerApplications() {
  await connection();

  return prisma.verificationRequest.findMany({
    where: { type: "ORGANIZER", status: "PENDING" },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { submittedAt: "asc" },
  });
}
