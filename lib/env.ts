import { z } from "zod";

/**
 * Konfigurasi environment Rangkul.
 *
 * Dua kelompok dipakai bersama:
 * - env peta/moderasi dari fitur Jelajahi (dibaca langsung, aman untuk client)
 * - env Supabase/database dari fitur volunteer (dibaca lazy di server)
 *
 * `lib/env/public.ts` tetap dipakai untuk nilai yang harus di-inline Next.js
 * ke bundle client (mis. redirectTo auth).
 */

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

const publicEnvSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    // Supabase baru memakai nama "publishable key"; proyek lama memakai
    // "anon key". Keduanya diterima, lalu dinormalisasi ke nama lama agar
    // pemakaian di kode tetap satu.
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  })
  .refine(
    (env) =>
      Boolean(
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
          env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      ),
    {
      message:
        "Isi NEXT_PUBLIC_SUPABASE_ANON_KEY atau NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      path: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    },
  )
  .transform((env) => ({
    NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: (env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) as string,
  }));

const databaseEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL belum diisi. Salin .env.example ke .env.local."),
  // Migrasi memakai koneksi direct, tapi tidak wajib untuk runtime.
  DIRECT_URL: z.string().min(1).optional(),
});

const supabaseAdminEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

type PublicEnv = z.infer<typeof publicEnvSchema>;
type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
type SupabaseAdminEnv = z.infer<typeof supabaseAdminEnvSchema>;

let cachedPublicEnv: PublicEnv | undefined;
let cachedDatabaseEnv: DatabaseEnv | undefined;
let cachedSupabaseAdminEnv: SupabaseAdminEnv | undefined;

function formatIssues(scope: string, issues: z.ZodIssue[]) {
  const details = issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");

  return `Environment ${scope} tidak valid. ${details}`;
}

function readEnv<T>(schema: z.ZodType<T>, scope: string): T {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(formatIssues(scope, parsed.error.issues));
  }

  return parsed.data;
}

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

/**
 * Hanya untuk Prisma di server. Jangan impor dari client component.
 */
export function getDatabaseEnv(): DatabaseEnv {
  cachedDatabaseEnv ??= assertDatabaseEnv();
  return cachedDatabaseEnv;
}

/**
 * Variabel publik yang aman dipakai di browser.
 * Fungsi ini sengaja lazy agar build statis tidak gagal saat env belum diisi.
 */
export function getPublicEnv(): PublicEnv {
  cachedPublicEnv ??= readEnv(publicEnvSchema, "publik");
  return cachedPublicEnv;
}

/**
 * Hanya untuk Supabase admin/service role di server.
 */
export function getSupabaseAdminEnv(): SupabaseAdminEnv {
  cachedSupabaseAdminEnv ??= readEnv(supabaseAdminEnvSchema, "Supabase admin");

  return cachedSupabaseAdminEnv;
}

/**
 * Dipakai untuk mematikan refresh sesi dengan aman ketika project belum
 * dikonfigurasi. Setelah env diisi, proxy akan aktif kembali.
 */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
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
