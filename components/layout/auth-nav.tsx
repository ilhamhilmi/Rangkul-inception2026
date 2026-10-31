"use client";

import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";

const AUTH_PATHS = new Set(["/masuk", "/daftar"]);

/**
 * CTA masuk/daftar di navbar. Tujuan setelah autentikasi mengikuti halaman yang
 * sedang dibuka, sehingga pengunjung landing kembali ke landing.
 */
export function AuthNav() {
  const pathname = usePathname();
  const nextPath =
    pathname && !AUTH_PATHS.has(pathname) ? pathname : "/";
  const query = `?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="flex items-center gap-2">
      <ButtonLink href={`/masuk${query}`} variant="ghost" size="sm">
        Masuk
      </ButtonLink>
      <ButtonLink href={`/daftar${query}`} size="sm">
        Daftar
      </ButtonLink>
    </div>
  );
}
