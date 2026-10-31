"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { getAuthorizedProfile } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import type { AdminActionResult } from "@/types/admin";

const idSchema = z.string().uuid("ID tidak valid.");
const noteSchema = z
  .string()
  .trim()
  .min(3, "Tulis alasan penolakan minimal 3 karakter.")
  .max(500, "Alasan penolakan maksimal 500 karakter.");

class ActionFailure extends Error {}

async function requireAdmin() {
  const result = await getAuthorizedProfile(["ADMIN"]);

  if (!result.allowed) {
    return {
      profile: null,
      error: {
        ok: false,
        message:
          result.reason === "UNAUTHENTICATED"
            ? "Sesi admin sudah berakhir. Masuk kembali."
            : "Akun ini tidak memiliki akses admin.",
      } satisfies AdminActionResult,
    } as const;
  }

  return { profile: result.profile, error: null } as const;
}

function revalidateCommunity(communitySlug: string) {
  updateTag("communities");
  updateTag(`community:${communitySlug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/komunitas");
  revalidatePath("/komunitas");
  revalidatePath(`/komunitas/${communitySlug}`);
}

function revalidateOrganizer() {
  revalidatePath("/admin");
  revalidatePath("/admin/penyelenggara");
  revalidatePath("/volunteer");
  revalidatePath("/volunteer/jadi-penyelenggara");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/kegiatan");
}

export async function approveCommunityAction(
  communityId: string,
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.profile) return auth.error;

  const parsedId = idSchema.safeParse(communityId);
  if (!parsedId.success) {
    return { ok: false, message: "ID komunitas tidak valid." };
  }

  try {
    const community = await prisma.$transaction(async (tx) => {
      const current = await tx.community.findUnique({
        where: { id: parsedId.data },
        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
          ownerId: true,
        },
      });

      if (!current) throw new ActionFailure("Komunitas tidak ditemukan.");
      if (current.status !== "PENDING") {
        throw new ActionFailure(
          "Komunitas ini sudah diproses. Muat ulang halaman.",
        );
      }

      const now = new Date();

      await tx.community.update({
        where: { id: current.id },
        data: {
          status: "VERIFIED",
          verifiedAt: now,
          verifiedBy: auth.profile.id,
        },
      });

      const request = await tx.verificationRequest.findFirst({
        where: {
          userId: current.ownerId,
          type: "COMMUNITY",
          status: "PENDING",
        },
        select: { id: true, payload: true },
      });

      if (request) {
        await tx.verificationRequest.update({
          where: { id: request.id },
          data: {
            status: "APPROVED",
            reviewerId: auth.profile.id,
            reviewedAt: now,
            reviewNote: null,
          },
        });
      } else {
        await tx.verificationRequest.create({
          data: {
            userId: current.ownerId,
            type: "COMMUNITY",
            status: "APPROVED",
            reviewerId: auth.profile.id,
            reviewedAt: now,
            payload: {
              communityId: current.id,
              communityName: current.name,
              source: "admin_backfill",
            },
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: current.ownerId,
          type: "COMMUNITY_APPROVED",
          title: "Komunitas disetujui",
          body: `Komunitas "${current.name}" sudah terverifikasi dan tampil di direktori publik Rangkul.`,
          href: `/komunitas/${current.slug}`,
        },
      });

      return current;
    });

    revalidateCommunity(community.slug);

    return { ok: true, message: "Komunitas berhasil diverifikasi." };
  } catch (error) {
    if (error instanceof ActionFailure) {
      return { ok: false, message: error.message };
    }

    return {
      ok: false,
      message: "Komunitas belum bisa disetujui. Coba lagi beberapa saat.",
    };
  }
}

export async function rejectCommunityAction(
  communityId: string,
  note: string,
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.profile) return auth.error;

  const parsedId = idSchema.safeParse(communityId);
  const parsedNote = noteSchema.safeParse(note);

  if (!parsedId.success) {
    return { ok: false, message: "ID komunitas tidak valid." };
  }

  if (!parsedNote.success) {
    return {
      ok: false,
      message: parsedNote.error.issues[0]?.message ?? "Alasan tidak valid.",
    };
  }

  try {
    const community = await prisma.$transaction(async (tx) => {
      const current = await tx.community.findUnique({
        where: { id: parsedId.data },
        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
          ownerId: true,
        },
      });

      if (!current) throw new ActionFailure("Komunitas tidak ditemukan.");
      if (current.status !== "PENDING") {
        throw new ActionFailure(
          "Komunitas ini sudah diproses. Muat ulang halaman.",
        );
      }

      const now = new Date();

      await tx.community.update({
        where: { id: current.id },
        data: { status: "REJECTED" },
      });

      const request = await tx.verificationRequest.findFirst({
        where: {
          userId: current.ownerId,
          type: "COMMUNITY",
          status: "PENDING",
        },
        select: { id: true },
      });

      if (request) {
        await tx.verificationRequest.update({
          where: { id: request.id },
          data: {
            status: "REJECTED",
            reviewerId: auth.profile.id,
            reviewedAt: now,
            reviewNote: parsedNote.data,
          },
        });
      } else {
        await tx.verificationRequest.create({
          data: {
            userId: current.ownerId,
            type: "COMMUNITY",
            status: "REJECTED",
            reviewerId: auth.profile.id,
            reviewedAt: now,
            reviewNote: parsedNote.data,
            payload: {
              communityId: current.id,
              communityName: current.name,
              source: "admin_backfill",
            },
          },
        });
      }

      return current;
    });

    revalidateCommunity(community.slug);

    return { ok: true, message: "Komunitas ditolak dan catatan disimpan." };
  } catch (error) {
    if (error instanceof ActionFailure) {
      return { ok: false, message: error.message };
    }

    return {
      ok: false,
      message: "Komunitas belum bisa ditolak. Coba lagi beberapa saat.",
    };
  }
}

export async function deleteCommunityAction(
  communityId: string,
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.profile) return auth.error;

  const parsedId = idSchema.safeParse(communityId);
  if (!parsedId.success) {
    return { ok: false, message: "ID komunitas tidak valid." };
  }

  try {
    const community = await prisma.$transaction(async (tx) => {
      const current = await tx.community.findUnique({
        where: { id: parsedId.data },
        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
          ownerId: true,
        },
      });

      if (!current) throw new ActionFailure("Komunitas tidak ditemukan.");
      if (current.status !== "VERIFIED") {
        throw new ActionFailure(
          "Hanya komunitas terverifikasi yang bisa dihapus.",
        );
      }

      await tx.notification.create({
        data: {
          userId: current.ownerId,
          type: "COMMUNITY_DELETED",
          title: "Komunitas dihapus admin",
          body: `Komunitas "${current.name}" telah dihapus dari direktori publik oleh admin. Hubungi admin bila kamu membutuhkan informasi lanjutan.`,
          href: "/komunitas",
        },
      });

      await tx.community.delete({ where: { id: current.id } });

      return current;
    });

    revalidateCommunity(community.slug);

    return { ok: true, message: "Komunitas dihapus." };
  } catch (error) {
    if (error instanceof ActionFailure) {
      return { ok: false, message: error.message };
    }

    return {
      ok: false,
      message: "Komunitas belum bisa dihapus. Coba lagi beberapa saat.",
    };
  }
}

export async function approveOrganizerAction(
  requestId: string,
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.profile) return auth.error;

  const parsedId = idSchema.safeParse(requestId);
  if (!parsedId.success) {
    return { ok: false, message: "ID pengajuan tidak valid." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const request = await tx.verificationRequest.findUnique({
        where: { id: parsedId.data },
        include: {
          user: { select: { id: true, role: true } },
        },
      });

      if (!request) throw new ActionFailure("Pengajuan tidak ditemukan.");
      if (request.type !== "ORGANIZER") {
        throw new ActionFailure("Pengajuan ini bukan pengajuan penyelenggara.");
      }
      if (request.status !== "PENDING") {
        throw new ActionFailure(
          "Pengajuan ini sudah diproses. Muat ulang halaman.",
        );
      }

      const now = new Date();

      if (request.user.role !== "ADMIN" && request.user.role !== "ORGANIZER") {
        await tx.profile.update({
          where: { id: request.user.id },
          data: { role: "ORGANIZER" },
        });
      }

      await tx.verificationRequest.update({
        where: { id: request.id },
        data: {
          status: "APPROVED",
          reviewerId: auth.profile.id,
          reviewedAt: now,
          reviewNote: null,
        },
      });
    });

    revalidateOrganizer();

    return {
      ok: true,
      message: "Penyelenggara berhasil diverifikasi.",
    };
  } catch (error) {
    if (error instanceof ActionFailure) {
      return { ok: false, message: error.message };
    }

    return {
      ok: false,
      message: "Pengajuan belum bisa disetujui. Coba lagi beberapa saat.",
    };
  }
}

export async function rejectOrganizerAction(
  requestId: string,
  note: string,
): Promise<AdminActionResult> {
  const auth = await requireAdmin();
  if (!auth.profile) return auth.error;

  const parsedId = idSchema.safeParse(requestId);
  const parsedNote = noteSchema.safeParse(note);

  if (!parsedId.success) {
    return { ok: false, message: "ID pengajuan tidak valid." };
  }

  if (!parsedNote.success) {
    return {
      ok: false,
      message: parsedNote.error.issues[0]?.message ?? "Alasan tidak valid.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const request = await tx.verificationRequest.findUnique({
        where: { id: parsedId.data },
        select: { id: true, type: true, status: true },
      });

      if (!request) throw new ActionFailure("Pengajuan tidak ditemukan.");
      if (request.type !== "ORGANIZER") {
        throw new ActionFailure("Pengajuan ini bukan pengajuan penyelenggara.");
      }
      if (request.status !== "PENDING") {
        throw new ActionFailure(
          "Pengajuan ini sudah diproses. Muat ulang halaman.",
        );
      }

      await tx.verificationRequest.update({
        where: { id: request.id },
        data: {
          status: "REJECTED",
          reviewerId: auth.profile.id,
          reviewedAt: new Date(),
          reviewNote: parsedNote.data,
        },
      });
    });

    revalidateOrganizer();

    return { ok: true, message: "Pengajuan ditolak dan catatan disimpan." };
  } catch (error) {
    if (error instanceof ActionFailure) {
      return { ok: false, message: error.message };
    }

    return {
      ok: false,
      message: "Pengajuan belum bisa ditolak. Coba lagi beberapa saat.",
    };
  }
}
