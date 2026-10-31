import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";

export async function requireUser(nextPath = "/"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/masuk?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function requireOrganizer(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}
