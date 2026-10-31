import "server-only";

import type { Profile, UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/session";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly reason: "UNAUTHENTICATED" | "FORBIDDEN",
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

const ORGANIZER_ROLES: UserRole[] = ["ORGANIZER", "ADMIN"];

async function requireProfile(
  roles: UserRole[],
  nextPath = "/masuk",
): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(`/masuk?next=${encodeURIComponent(nextPath)}`);
  }

  if (roles.length > 0 && !roles.includes(profile.role)) {
    throw new AuthorizationError(
      "Akun ini tidak memiliki akses ke tindakan tersebut.",
      "FORBIDDEN",
    );
  }

  return profile;
}

/**
 * Guard halaman/action yang hanya butuh login.
 * Melempar redirect ke /masuk jika belum login.
 */
export function requireUser(nextPath = "/") {
  return requireProfile([], nextPath);
}

/**
 * Guard untuk organizer dan admin.
 */
export function requireOrganizer() {
  return requireProfile(ORGANIZER_ROLES);
}

/**
 * Guard untuk admin.
 */
export function requireAdmin() {
  return requireProfile(["ADMIN"]);
}

/**
 * Cek role tanpa redirect. Dipakai di server action yang mengembalikan
 * ActionResult, atau untuk menampilkan/menyembunyikan UI.
 */
export async function getAuthorizedProfile(roles: UserRole[] = []) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return {
      profile: null,
      allowed: false as const,
      reason: "UNAUTHENTICATED" as const,
    };
  }

  if (roles.length > 0 && !roles.includes(profile.role)) {
    return { profile, allowed: false as const, reason: "FORBIDDEN" as const };
  }

  return { profile, allowed: true as const, reason: null };
}

export function isOrganizer(profile: Pick<Profile, "role"> | null | undefined) {
  return Boolean(profile && ORGANIZER_ROLES.includes(profile.role));
}

export function isAdmin(profile: Pick<Profile, "role"> | null | undefined) {
  return profile?.role === "ADMIN";
}
