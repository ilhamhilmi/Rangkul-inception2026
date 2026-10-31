import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getPublicEnv, getSupabaseAdminEnv } from "@/lib/env";

/**
 * Supabase client dengan service role key. Hanya untuk server.
 * Jangan pernah impor file ini dari client component.
 */
export function createSupabaseAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getSupabaseAdminEnv();

  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
