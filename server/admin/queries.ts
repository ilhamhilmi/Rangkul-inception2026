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
    pendingEvents,
    verifiedCommunities,
    totalProfiles,
  ] = await Promise.all([
    prisma.community.count({
      where: { status: "PENDING", archivedAt: null },
    }),
    prisma.verificationRequest.count({
      where: { type: "ORGANIZER", status: "PENDING" },
    }),
    prisma.volunteerEvent.count({
      where: { status: "PENDING", archivedAt: null },
    }),
    prisma.community.count({
      where: { status: "VERIFIED", archivedAt: null },
    }),
    prisma.profile.count(),
  ]);

  return {
    pendingCommunities,
    pendingOrganizers,
    pendingEvents,
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

/** Komunitas terverifikasi yang sudah tampil di direktori publik. */
export async function getVerifiedCommunities() {
  await connection();

  return prisma.community.findMany({
    where: { status: "VERIFIED", archivedAt: null },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { verifiedAt: "desc" },
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

/** Penyelenggara terverifikasi (role ORGANIZER) yang bisa dicabut admin. */
export async function getVerifiedOrganizers() {
  await connection();

  return prisma.profile.findMany({
    where: { role: "ORGANIZER" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { organizedEvents: true } },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Kegiatan Volunteer yang diajukan penyelenggara dan menunggu keputusan admin.
 * Kegiatan berstatus PENDING belum tampil di halaman publik.
 */
export async function getPendingVolunteerEvents() {
  await connection();

  return prisma.volunteerEvent.findMany({
    where: { status: "PENDING", archivedAt: null },
    include: {
      organizer: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: {
          registrations: {
            where: { status: { in: ["PENDING", "CONFIRMED"] } },
          },
        },
      },
    },
    orderBy: [{ updatedAt: "asc" }, { createdAt: "asc" }],
  });
}

/**
 * Postingan tempat yang ditahan moderasi otomatis (`PENDING`) atau ditolak
 * (`REJECTED`). Admin memutuskan terbit atau tolak dari antrean ini.
 */
export async function getPlaceModerationQueue() {
  await connection();

  return prisma.place.findMany({
    where: { status: { in: ["PENDING", "REJECTED"] }, archivedAt: null },
    include: {
      createdBy: { select: { name: true, email: true } },
      _count: { select: { likes: true } },
    },
    orderBy: [{ createdAt: "asc" }],
  });
}

/** Postingan tayang terbaru, dipakai admin untuk menurunkan konten bermasalah. */
export async function getRecentPublishedPlaces(limit = 12) {
  await connection();

  return prisma.place.findMany({
    where: { status: "PUBLISHED", archivedAt: null },
    include: {
      createdBy: { select: { name: true, email: true } },
      _count: { select: { likes: true } },
    },
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
}
