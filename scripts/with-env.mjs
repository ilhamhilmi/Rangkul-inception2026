import { spawnSync } from "node:child_process";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

// Pastikan binary lokal (prisma, tsx, dll.) tetap ditemukan meski script
// dijalankan di luar konteks npm yang biasanya menambahkan folder ini ke PATH.
const pathKey =
  Object.keys(process.env).find((key) => key.toUpperCase() === "PATH") ??
  "PATH";
const binDir = path.resolve("node_modules", ".bin");
process.env[pathKey] = `${binDir}${path.delimiter}${process.env[pathKey] ?? ""}`;

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Usage: node scripts/with-env.mjs <command> [...args]");
  process.exit(1);
}

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
