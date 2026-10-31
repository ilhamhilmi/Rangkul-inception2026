import { PrismaClient } from "@prisma/client";
import { assertDatabaseEnv } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  rangkulPrisma?: PrismaClient;
};

function createPrismaClient() {
  assertDatabaseEnv();

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

/**
 * Client Prisma lazy supaya modul ini bisa diimpor tanpa memaksa koneksi
 * database saat build. Query pertama yang akan memvalidasi env dan membuka pool.
 */
export function getPrisma() {
  if (!globalForPrisma.rangkulPrisma) {
    globalForPrisma.rangkulPrisma = createPrismaClient();
  }

  return globalForPrisma.rangkulPrisma;
}
