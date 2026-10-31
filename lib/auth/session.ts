import "server-only";

import type { User } from "@supabase/supabase-js";
import { Prisma } from "@prisma/client";
import { connection } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
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

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Supabase memakai waktu saat memvalidasi sesi. Tunggu request masuk dulu
  // agar nilainya tidak dihitung saat prerender (Cache Components).
  await connection();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return ensureProfile(profileFromAuthUser(user));
}

export async function ensureProfileForAuthUser(user: User) {
  return ensureProfile(profileFromAuthUser(user));
}
