import { NextResponse, type NextRequest } from "next/server";
import { ensureProfileForAuthUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils/redirect";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"), "/");

  if (!code) {
    return NextResponse.redirect(new URL("/masuk", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/masuk?error=konfirmasi", url.origin));
  }

  await ensureProfileForAuthUser(data.user);

  return NextResponse.redirect(new URL(next, url.origin));
}
