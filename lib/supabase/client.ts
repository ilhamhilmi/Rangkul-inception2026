"use client";

import { createBrowserClient } from "@supabase/ssr";

type BrowserClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserClient | undefined;

/**
 * Supabase client untuk browser. Hanya untuk auth dan upload ke Storage,
 * bukan untuk query tabel langsung (gunakan Prisma di server).
 *
 * Variabel env dirujuk secara statis agar di-inline oleh Next di bundle
 * client. Jangan mengganti dengan akses `process.env` dinamis.
 */
export function createSupabaseBrowserClient(): BrowserClient {
  if (browserClient) {
    return browserClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY (atau NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) di .env.local.",
    );
  }

  browserClient = createBrowserClient(url, key);

  return browserClient;
}
