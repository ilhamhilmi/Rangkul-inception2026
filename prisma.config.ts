import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

import { defineConfig } from "prisma/config";

// Prisma CLI tidak memuat .env.local secara otomatis. Muat file tersebut di
// sini, tetapi jangan menimpa variabel yang sudah diberikan secara eksplisit
// lewat environment shell/CI.
const envPath = ".env.local";

if (existsSync(envPath)) {
  const parsed = parseEnv(
    readFileSync(envPath, "utf8").replace(/^\uFEFF/, ""),
  );

  for (const [key, value] of Object.entries(parsed)) {
    if (value !== undefined && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
