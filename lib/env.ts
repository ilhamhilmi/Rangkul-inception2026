import { z } from "zod";

const DEFAULT_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const DEFAULT_OSRM_URL = "https://routing.openstreetmap.de/routed-foot";

const mapEnvSchema = z.object({
  tileUrl: z.string().min(1),
  attribution: z.string().min(1),
  osrmUrl: z.string().min(1),
});

/**
 * Konfigurasi peta yang aman dipakai di client. Variabel `NEXT_PUBLIC_*`
 * harus dibaca langsung agar bisa di-inline oleh Next.js saat build.
 */
export const mapEnv = mapEnvSchema.parse({
  tileUrl: process.env.NEXT_PUBLIC_MAP_TILE_URL || DEFAULT_TILE_URL,
  attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || DEFAULT_ATTRIBUTION,
  osrmUrl: process.env.NEXT_PUBLIC_OSRM_URL || DEFAULT_OSRM_URL,
});

const databaseEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL belum diisi. Salin .env.example ke .env.local."),
  DIRECT_URL: z.string().min(1).optional(),
});

/**
 * Validasi env database secara lazy supaya `next build` tetap bisa berjalan
 * tanpa koneksi database. Fungsi ini hanya boleh dipanggil di server.
 */
export function assertDatabaseEnv() {
  if (typeof window !== "undefined") {
    throw new Error("assertDatabaseEnv hanya boleh dipanggil di server.");
  }

  const parsed = databaseEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Konfigurasi database belum lengkap. Periksa .env.local.",
    );
  }

  return parsed.data;
}

const geminiEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODERATION_MODEL: z.string().min(1).optional(),
});

/**
 * Moderasi AI bisa dimatikan sementara agar postingan langsung tayang.
 * Default mati; aktifkan dengan `AI_MODERATION_ENABLED=true`.
 */
export function isModerationEnabled() {
  const value = process.env.AI_MODERATION_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1";
}

/**
 * Konfigurasi Gemini untuk moderasi postingan. Key dibuat opsional: bila belum
 * diisi, moderasi berjalan dalam mode fail-safe (postingan tidak otomatis tayang).
 */
export function getGeminiEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getGeminiEnv hanya boleh dipanggil di server.");
  }

  const parsed = geminiEnvSchema.safeParse(process.env);

  return {
    apiKey: parsed.success ? parsed.data.GEMINI_API_KEY : undefined,
    model:
      (parsed.success ? parsed.data.GEMINI_MODERATION_MODEL : undefined) ||
      "gemini-3.1-flash-lite",
  } as const;
}

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
});

/**
 * Env khusus server yang tidak boleh bocor ke bundle client. Dibaca lazy agar
 * `next build` tidak gagal saat variabel opsional belum diisi.
 */
export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv hanya boleh dipanggil di server.");
  }

  const database = assertDatabaseEnv();
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ") || "Konfigurasi environment server tidak valid.",
    );
  }

  return {
    ...database,
    supabaseSecretKey:
      parsed.data.SUPABASE_SERVICE_ROLE_KEY ?? parsed.data.SUPABASE_SECRET_KEY,
  } as const;
}
