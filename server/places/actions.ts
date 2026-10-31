"use server";

import { updateTag, revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getAuthorizedProfile, requireUser } from "@/lib/auth/guards";
import { moderatePlacePost } from "@/lib/ai/moderation";
import { isModerationEnabled } from "@/lib/env";
import { PLACE_CATEGORY_TO_PRISMA } from "@/lib/constants/places";
import type { PlacePostFormState } from "@/lib/validation/post";
import { placePostSchema } from "@/lib/validation/post";
import { buildUniqueSlug, slugify } from "@/lib/utils/slug";
import {
  PLACE_PHOTO_MAX_BYTES,
  PLACE_PHOTO_MAX_COUNT,
  PLACE_PHOTO_TYPES,
  removePlacePhotos,
  uploadPlacePhotos,
} from "@/lib/storage/place-photos";

const PHOTO_TYPES: readonly string[] = PLACE_PHOTO_TYPES;

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

function collectPhotos(formData: FormData) {
  return formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0);
}

function validatePhotos(files: File[]): string | null {
  if (files.length === 0) {
    return "Lampirkan minimal satu foto tempat.";
  }

  if (files.length > PLACE_PHOTO_MAX_COUNT) {
    return `Maksimal ${PLACE_PHOTO_MAX_COUNT} foto per postingan.`;
  }

  for (const file of files) {
    if (!PHOTO_TYPES.includes(file.type)) {
      return "Format foto harus JPG, PNG, atau WebP.";
    }

    if (file.size > PLACE_PHOTO_MAX_BYTES) {
      return "Ukuran setiap foto maksimal 5 MB.";
    }
  }

  return null;
}

export async function createPlacePostAction(
  _previousState: PlacePostFormState,
  formData: FormData,
): Promise<PlacePostFormState> {
  const user = await requireUser("/tambah-info");

  const parsed = placePostSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    rating: formData.get("rating"),
    facilities: formData.getAll("facilities"),
    latitude: formData.get("lat"),
    longitude: formData.get("lng"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali isian postinganmu.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const files = collectPhotos(formData);
  const photoError = validatePhotos(files);

  if (photoError) {
    return {
      status: "error",
      message: "Periksa kembali isian postinganmu.",
      fieldErrors: { photos: [photoError] },
    };
  }

  const moderationEnabled = isModerationEnabled();
  const moderation = moderationEnabled
    ? await moderatePlacePost({
        name: parsed.data.name,
        category: parsed.data.category,
        description: parsed.data.description,
      })
    : null;

  const status = moderation
    ? moderation.verdict === "SAFE"
      ? "PUBLISHED"
      : moderation.verdict === "BLOCK"
        ? "REJECTED"
        : "PENDING"
    : "PUBLISHED";

  const publishedAt = status === "PUBLISHED" ? new Date() : null;
  const existingSlugs = await prisma.place.findMany({ select: { slug: true } });
  const baseSlug = slugify(parsed.data.name) || "tempat";
  const slug = buildUniqueSlug(baseSlug, new Set(existingSlugs.map((row) => row.slug)));

  const upload = await uploadPlacePhotos(user.id, files);

  if (upload.error) {
    return {
      status: "error",
      message: upload.error,
      fieldErrors: { photos: [upload.error] },
    };
  }

  try {
    await prisma.place.create({
      data: {
        slug,
        name: parsed.data.name,
        category: PLACE_CATEGORY_TO_PRISMA[parsed.data.category],
        description: parsed.data.description,
        posterRating: parsed.data.rating,
        facilities: parsed.data.facilities,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        status,
        createdById: user.id,
        moderatedAt: moderation ? new Date() : null,
        moderationNote: moderation
          ? moderation.reason
          : "Moderasi AI dinonaktifkan sementara.",
        publishedAt,
        photos: {
          create: upload.photos.map((photo, index) => ({
            url: photo.url,
            alt: `Foto ${index + 1} untuk ${parsed.data.name}`,
            sortOrder: index,
            createdById: user.id,
          })),
        },
      },
      select: { id: true },
    });
  } catch (error) {
    await removePlacePhotos(upload.photos.map((photo) => photo.path));

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        status: "error",
        message:
          "Postingan bentrok dengan data lain yang baru masuk. Coba kirim lagi.",
      };
    }

    return {
      status: "error",
      message:
        "Postingan belum bisa disimpan. Coba lagi beberapa saat atau hubungi admin Rangkul.",
    };
  }

  updateTag("places");
  updateTag(`place:${slug}`);

  if (status === "PUBLISHED") {
    return {
      status: "success",
      message: "Postinganmu sudah tayang di Jelajahi.",
      result: { name: parsed.data.name, slug, tayang: true },
    };
  }

  if (status === "PENDING") {
    return {
      status: "success",
      message:
        "Postinganmu tersimpan dan sedang menunggu review. Belum tampil ke publik sampai lolos moderasi.",
      result: { name: parsed.data.name, slug, tayang: false },
    };
  }

  return {
    status: "success",
    message:
      "Postingan tidak bisa tayang karena dinilai melanggar pedoman komunitas. Perbaiki isinya lalu kirim ulang.",
    result: { name: parsed.data.name, slug, tayang: false },
  };
}

export type TogglePlaceLikeResult = {
  ok: boolean;
  liked: boolean;
  likeCount: number;
  message?: string;
};

export async function togglePlaceLikeAction(
  placeId: string,
): Promise<TogglePlaceLikeResult> {
  const user = await requireUser("/jelajahi");

  const place = await prisma.place.findFirst({
    where: { id: placeId, status: "PUBLISHED", archivedAt: null },
    select: { id: true, slug: true },
  });

  if (!place) {
    return {
      ok: false,
      liked: false,
      likeCount: 0,
      message: "Postingan ini tidak tersedia.",
    };
  }

  const key = { placeId_userId: { placeId: place.id, userId: user.id } };
  const existing = await prisma.placeLike.findUnique({ where: key });

  let liked: boolean;

  if (existing) {
    await prisma.placeLike.delete({ where: key }).catch(() => undefined);
    liked = false;
  } else {
    try {
      await prisma.placeLike.create({
        data: { placeId: place.id, userId: user.id },
      });
    } catch (error) {
      if (
        !(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        )
      ) {
        return {
          ok: false,
          liked: false,
          likeCount: 0,
          message: "Belum bisa menyimpan tanda bantuan. Coba lagi.",
        };
      }
    }
    liked = true;
  }

  const likeCount = await prisma.placeLike.count({
    where: { placeId: place.id },
  });

  updateTag("places");
  updateTag(`place:${place.slug}`);

  return { ok: true, liked, likeCount };
}

export type PlaceActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function revalidatePlace(slug: string) {
  updateTag("places");
  updateTag(`place:${slug}`);
  revalidatePath("/jelajahi");
  revalidatePath(`/jelajahi/${slug}`);
  revalidatePath("/profil");
  revalidatePath("/admin/tempat");
}

/** Pemilik postingan atau admin dapat menghapus postingan. */
export async function deletePlacePostAction(
  placeId: string,
): Promise<PlaceActionResult> {
  const user = await requireUser("/jelajahi");

  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: { id: true, slug: true, createdById: true },
  });

  if (!place) {
    return { ok: false, message: "Postingan tidak ditemukan." };
  }

  if (place.createdById !== user.id && user.role !== "ADMIN") {
    return {
      ok: false,
      message: "Kamu hanya dapat menghapus postinganmu sendiri.",
    };
  }

  // shortcut: foto di Supabase Storage tidak ikut dihapus, bersihkan manual bila perlu.
  await prisma.place.delete({ where: { id: place.id } });

  revalidatePlace(place.slug);
  return { ok: true, message: "Postingan dihapus." };
}

/** Keputusan admin atas postingan yang ditahan moderasi otomatis. */
export async function moderatePlaceAction(
  placeId: string,
  status: "PUBLISHED" | "REJECTED",
  note = "",
): Promise<PlaceActionResult> {
  const auth = await getAuthorizedProfile(["ADMIN"]);

  if (!auth.allowed) {
    return { ok: false, message: "Akun ini tidak memiliki akses admin." };
  }

  const reason = note.trim();

  if (status === "REJECTED" && reason.length < 3) {
    return {
      ok: false,
      message: "Tulis alasan penolakan minimal 3 karakter.",
    };
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: {
      id: true,
      slug: true,
      status: true,
      publishedAt: true,
      moderationNote: true,
    },
  });

  if (!place) {
    return { ok: false, message: "Postingan tidak ditemukan." };
  }

  if (place.status !== "PENDING" && place.status !== "REJECTED") {
    return {
      ok: false,
      message: "Postingan ini sudah tidak dalam antrean moderasi.",
    };
  }

  await prisma.place.update({
    where: { id: place.id },
    data: {
      status,
      moderatedAt: new Date(),
      moderationNote: reason || place.moderationNote,
      publishedAt:
        status === "PUBLISHED" ? (place.publishedAt ?? new Date()) : null,
    },
  });

  revalidatePlace(place.slug);
  return {
    ok: true,
    message:
      status === "PUBLISHED"
        ? "Postingan diterbitkan."
        : "Postingan ditolak dan catatan disimpan.",
  };
}
