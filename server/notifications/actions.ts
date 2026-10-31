"use server";

import { z } from "zod";

import { getAuthorizedProfile } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

const idSchema = z.string().uuid();

export type NotificationActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionResult> {
  const auth = await getAuthorizedProfile([]);

  if (!auth.allowed) {
    return { ok: false, message: "Sesi berakhir. Masuk kembali." };
  }

  const parsed = idSchema.safeParse(notificationId);

  if (!parsed.success) {
    return { ok: false, message: "Notifikasi tidak valid." };
  }

  await prisma.notification.updateMany({
    where: {
      id: parsed.data,
      userId: auth.profile.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return { ok: true };
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionResult> {
  const auth = await getAuthorizedProfile([]);

  if (!auth.allowed) {
    return { ok: false, message: "Sesi berakhir. Masuk kembali." };
  }

  await prisma.notification.updateMany({
    where: { userId: auth.profile.id, readAt: null },
    data: { readAt: new Date() },
  });

  return { ok: true };
}
