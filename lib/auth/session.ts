import "server-only";

import type { User } from "@supabase/supabase-js";
import { Prisma, type Profile, type UserRole } from "@prisma/client";
import { connection } from "next/server";
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

type ProfileInput = {
  id: string;
  email: string;
  name: string;
};

export async function ensureProfile(input: ProfileInput): Promise<CurrentUser> {
  const existing = await prisma.profile.findUnique({ where: { id: input.id } });
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      name: existing.name,
      role: existing.role,
    };
  }

  try {
    const created = await prisma.profile.create({
      data: {
        id: input.id,
        email: input.email,
        name: input.name.slice(0, 80) || input.email.split("@")[0] || "Pengguna Rangkul",
      },
    });

    return {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const byEmail = await prisma.profile.findFirst({
        where: { email: { equals: input.email, mode: "insensitive" } },
      });

      if (byEmail) {
        return {
          id: byEmail.id,
          email: byEmail.email,
          name: byEmail.name,
          role: byEmail.role,
        };
      }
    }

    throw error;
  }
}

function profileFromAuthUser(user: User): ProfileInput {
  const metadataName =
    typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";
  const fallbackName = user.email?.split("@")[0] ?? "Pengguna Rangkul";

  return {
    id: user.id,
    email: user.email ?? `${user.id}@rangkul.local`,
    name: metadataName || fallbackName,
  };
}

/**
 * User Supabase Auth yang sedang login. Hasil di-cache per request agar tidak
 * memanggil Supabase berkali-kali dalam satu render.
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  // Supabase memakai waktu saat memvalidasi sesi. Tunggu request masuk dulu
  // agar nilainya tidak dihitung saat prerender (Cache Components).
  await connection();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return null;

  return user;
});

/**
 * Profil aplikasi milik user yang sedang login (dibuat bila belum ada).
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const user = await getAuthUser();

  if (!user) return null;

  return ensureProfile(profileFromAuthUser(user));
});

/**
 * Profil Prisma lengkap (seluruh kolom) untuk halaman volunteer/dashboard.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getAuthUser();

  if (!user) return null;

  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  if (existing) return existing;

  const created = await ensureProfile(profileFromAuthUser(user));

  return prisma.profile.findUnique({ where: { id: created.id } });
});

export async function ensureProfileForAuthUser(user: User) {
  return ensureProfile(profileFromAuthUser(user));
}
