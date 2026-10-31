import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

/**
 * Next 16 memakai proxy.ts (bukan middleware.ts) untuk me-refresh sesi
 * Supabase. Proxy bukan pengganti otorisasi: guard tetap dicek di server.
 */
export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff|woff2)$).*)",
  ],
};
