"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getAuthorizedProfile, requireUser } from "@/lib/auth/guards";
import {
  createSignedUploadUrl,
  getPublicStorageUrl,
  STORAGE_BUCKETS,
} from "@/lib/supabase/storage";
import type { CommunityFormState } from "@/types/community";
import { communitySchema } from "@/lib/validation/community";
import { buildUniqueSlug } from "@/lib/utils/slug";

const LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const logoUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024, "Ukuran logo maksimal 5 MB."),
});

export type CommunityLogoUploadResult =
  | {
      ok: true;
      data: {
        bucket: typeof STORAGE_BUCKETS.communityLogos;
        path: string;
        token: string;
        signedUrl: string;
      };
    }
  | { ok: false; message: string };

function extensionFor(contentType: string) {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

function isCommunityLogoPath(path: string, userId: string) {
  return (
    path.startsWith(`community/${userId}/`) &&
    !path.includes("..") &&
    /^[a-zA-Z0-9._/-]+$/.test(path)
  );
}

export async function createCommunityLogoUploadAction(input: {
  fileName: string;
  contentType: string;
  size: number;
}): Promise<CommunityLogoUploadResult> {
  const auth = await getAuthorizedProfile([]);

  if (!auth.allowed) {
    return {
      ok: false,
      message:
        auth.reason === "UNAUTHENTICATED"
          ? "Silakan masuk terlebih dahulu untuk mengunggah logo."
          : "Akun ini tidak bisa mengunggah logo.",
    };
  }

  const parsed = logoUploadSchema.safeParse(input);

  if (!parsed.success || !LOGO_TYPES.has(parsed.data.contentType)) {
    return {
      ok: false,
      message: "Gunakan logo JPG, PNG, atau WebP maksimal 5 MB.",
    };
  }

  try {
    const path = `community/${auth.profile.id}/${crypto.randomUUID()}.${extensionFor(
      parsed.data.contentType,
    )}`;
    const data = await createSignedUploadUrl(
      STORAGE_BUCKETS.communityLogos,
      path,
    );

    return {
      ok: true,
      data: {
        bucket: STORAGE_BUCKETS.communityLogos,
        path,
        token: data.token,
        signedUrl: data.signedUrl,
      },
    };
  } catch {
    return {
      ok: false,
      message:
        "Logo belum bisa diunggah. Pastikan bucket community-logos sudah dibuat, lalu coba lagi.",
    };
  }
}

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
    logoPath: formData.get("logoPath"),
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

  const logoPath = parsed.data.logoPath;

  if (logoPath && !isCommunityLogoPath(logoPath, user.id)) {
    return {
      status: "error",
      message: "Logo komunitas tidak valid. Unggah ulang logo.",
      fieldErrors: { logo: ["Logo komunitas tidak valid."] },
    };
  }

  const logoUrl = logoPath
    ? getPublicStorageUrl(STORAGE_BUCKETS.communityLogos, logoPath)
    : null;

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
          logoUrl,
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
