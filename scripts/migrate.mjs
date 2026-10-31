import { spawnSync } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

// Supabase pooler membatasi advisory lock Prisma. Migrasi Rangkul aman
// dijalankan tanpa lock karena hanya satu proses deploy yang aktif.
process.env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "1";

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
