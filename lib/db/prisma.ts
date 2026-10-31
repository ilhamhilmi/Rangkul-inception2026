import "server-only";

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

/**
 * Alias `prisma` untuk modul yang memakai pola query langsung. Proxy ini
 * meneruskan setiap akses ke client lazy di atas sehingga `import` tetap aman
 * saat build tanpa koneksi database.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrisma();
    const value = Reflect.get(client, property, client);

    return typeof value === "function" ? value.bind(client) : value;
  },
});
