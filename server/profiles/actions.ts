"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthorizedProfile } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import type { ProfileFormState } from "@/types/profile";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(80, "Nama maksimal 80 karakter."),
  bio: z
    .string()
    .trim()
    .max(280, "Bio maksimal 280 karakter.")
    .optional()
    .default(""),
});

function toFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }

  return fieldErrors;
}

export async function updateProfileAction(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const auth = await getAuthorizedProfile([]);

  if (!auth.allowed) {
    return {
      status: "error",
      message: "Sesi kamu sudah berakhir. Masuk kembali untuk mengubah profil.",
    };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali isian profilmu.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  try {
    await prisma.profile.update({
      where: { id: auth.profile.id },
      data: {
        name: parsed.data.name,
        bio: parsed.data.bio ? parsed.data.bio : null,
      },
    });
  } catch {
    return {
      status: "error",
      message: "Profil belum bisa disimpan. Coba lagi beberapa saat lagi.",
    };
  }

  revalidatePath("/profil");

  return {
    status: "success",
    message: "Profil berhasil diperbarui.",
  };
}
