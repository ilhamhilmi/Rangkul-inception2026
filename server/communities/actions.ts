"use server";

import { updateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import type { CommunityFormState } from "@/types/community";
import { communitySchema } from "@/lib/validation/community";
import { buildUniqueSlug } from "@/lib/utils/slug";

function fieldErrorsFrom(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}) {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }

  return fieldErrors;
}

export async function createCommunityAction(
  _previousState: CommunityFormState,
  formData: FormData,
): Promise<CommunityFormState> {
  const user = await requireUser("/komunitas/daftar");

  const parsed = communitySchema.safeParse({
    picName: formData.get("picName"),
    picPhone: formData.get("picPhone"),
    picEmail: formData.get("picEmail"),
    name: formData.get("name"),
    description: formData.get("description"),
    province: formData.get("province"),
    city: formData.get("city"),
    focus: formData.getAll("focus"),
    channel: formData.get("channel"),
    instagram: formData.get("instagram"),
    website: formData.get("website"),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali data komunitas.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const pending = await prisma.verificationRequest.findFirst({
    where: {
      userId: user.id,
      type: "COMMUNITY",
      status: "PENDING",
    },
    select: { id: true },
  });

  if (pending) {
    return {
      status: "error",
      message:
        "Pengajuan komunitasmu masih menunggu verifikasi admin. Selesaikan atau tunggu prosesnya sebelum mengirim lagi.",
    };
  }

  const existingSlugs = await prisma.community.findMany({
    select: { slug: true },
  });

  const slug = buildUniqueSlug(
    parsed.data.name,
    new Set(existingSlugs.map((row) => row.slug)),
  );

  try {
    await prisma.$transaction(async (tx) => {
      const community = await tx.community.create({
        data: {
          slug,
          name: parsed.data.name,
          description: parsed.data.description,
          province: parsed.data.province,
          city: parsed.data.city,
          focus: parsed.data.focus,
          contact: parsed.data.picEmail,
          socials: {
            ...(parsed.data.instagram
              ? { instagram: parsed.data.instagram }
              : {}),
            ...(parsed.data.website ? { website: parsed.data.website } : {}),
          },
          joinUrl: parsed.data.channel,
          status: "PENDING",
          ownerId: user.id,
        },
      });

      await tx.verificationRequest.create({
        data: {
          userId: user.id,
          type: "COMMUNITY",
          status: "PENDING",
          payload: {
            communityId: community.id,
            communityName: community.name,
            picName: parsed.data.picName,
            picPhone: parsed.data.picPhone,
            picEmail: parsed.data.picEmail,
          },
        },
      });
    });
  } catch {
    return {
      status: "error",
      message:
        "Pengajuan belum bisa disimpan. Coba lagi beberapa saat atau hubungi admin Rangkul.",
    };
  }

  updateTag("communities");

  return {
    status: "success",
    message:
      "Pendaftaran diterima. Admin akan memeriksa data komunitasmu sebelum tampil di direktori.",
    submittedName: parsed.data.name,
  };
}
