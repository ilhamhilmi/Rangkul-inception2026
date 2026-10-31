import "server-only";

import type { NotificationType } from "@prisma/client";
import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationSummary = {
  items: NotificationItem[];
  unreadCount: number;
};

const RECENT_NOTIFICATION_LIMIT = 20;

export async function getNotificationsForUser(
  userId: string,
): Promise<NotificationSummary> {
  await connection();

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: RECENT_NOTIFICATION_LIMIT,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        href: true,
        readAt: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({
      where: { userId, readAt: null },
    }),
  ]);

  return {
    items: notifications.map((notification) => ({
      ...notification,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    })),
    unreadCount,
  };
}
