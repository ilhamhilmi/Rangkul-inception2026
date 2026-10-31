import Link from "next/link";
import { Suspense } from "react";
import { Brand } from "@/components/layout/brand";
import { Button, ButtonLink } from "@/components/ui/button";
import { UserIcon } from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { signOutAction } from "@/server/auth/actions";

const navigation = [
  { href: "/jelajahi", label: "Jelajahi" },
  { href: "/komunitas", label: "Komunitas" },
  { href: "/volunteer", label: "Volunteer" },
];

async function AccountNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <ButtonLink href="/masuk" variant="ghost" size="sm">
          Masuk
        </ButtonLink>
        <ButtonLink href="/daftar" size="sm">
          Daftar
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-40 items-center gap-1.5 truncate text-sm font-medium text-ink sm:inline-flex">
        <UserIcon className="h-4 w-4 shrink-0 text-primary-700" />
        <span className="truncate">{user.name}</span>
      </span>
      <form action={signOutAction}>
        <Button type="submit" variant="ghost" size="sm">
          Keluar
        </Button>
      </form>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Brand />

        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-11 items-center rounded-button px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Suspense
          fallback={
            <div
              aria-hidden="true"
              className="h-11 w-32 animate-pulse rounded-button bg-surface-muted"
            />
          }
        >
          <AccountNav />
        </Suspense>
      </div>
    </header>
  );
}
