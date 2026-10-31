import "server-only";

import { PrismaClient } from "@prisma/client";

import { getDatabaseEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Validasi env database hanya saat Prisma benar-benar dipakai di server,
  // bukan saat proses build/import.
  getDatabaseEnv();

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

/**
 * Singleton Prisma untuk server. Jangan impor dari client component.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
