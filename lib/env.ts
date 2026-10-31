import { z } from "zod";

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
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
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
 * Variabel publik yang aman dipakai di browser.
 * Fungsi ini sengaja lazy agar build statis tidak gagal saat env belum diisi.
 */
export function getPublicEnv(): PublicEnv {
  cachedPublicEnv ??= readEnv(publicEnvSchema, "publik");
  return cachedPublicEnv;
}

/**
 * Hanya untuk Prisma di server. Jangan impor dari client component.
 */
export function getDatabaseEnv(): DatabaseEnv {
  cachedDatabaseEnv ??= readEnv(databaseEnvSchema, "database");
  return cachedDatabaseEnv;
}

/**
 * Hanya untuk Supabase admin/service role di server.
 */
export function getSupabaseAdminEnv(): SupabaseAdminEnv {
  cachedSupabaseAdminEnv ??= readEnv(
    supabaseAdminEnvSchema,
    "Supabase admin",
  );

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
