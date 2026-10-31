import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Membaca user Supabase Auth yang sedang login. Hasil di-cache per request
 * agar tidak memanggil Supabase berkali-kali dalam satu render.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
});

/**
 * Profil aplikasi milik user yang sedang login, atau null jika belum ada.
 */
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return prisma.profile.findUnique({ where: { id: user.id } });
});

function resolveProfileName(input: {
  name?: string;
  email: string;
  metadata: Record<string, unknown> | undefined;
}) {
  const candidates = [
    input.name,
    input.metadata?.full_name,
    input.metadata?.name,
    input.email.split("@")[0],
    "Pengguna Rangkul",
  ];

  const name = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );

  return (name ?? "Pengguna Rangkul").trim().slice(0, 80);
}

/**
 * Membuat profil aplikasi bila belum ada. Dipanggil setelah login/registrasi
 * atau di layout yang membutuhkan profil. Tidak pernah mengubah role.
 */
export async function ensureProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  if (!user.email) {
    throw new Error(
      "User Supabase Auth tidak memiliki email; profil tidak dapat dibuat.",
    );
  }

  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const avatarUrl =
    typeof metadata?.avatar_url === "string" ? metadata.avatar_url : null;

  return prisma.profile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email,
      name: resolveProfileName({
        name:
          typeof metadata?.full_name === "string"
            ? metadata.full_name
            : undefined,
        email: user.email,
        metadata,
      }),
      avatarUrl,
    },
    // Jangan menimpa nama/avatar yang sudah diedit pengguna. Email auth
    // tetap disinkronkan.
    update: { email: user.email },
  });
}
