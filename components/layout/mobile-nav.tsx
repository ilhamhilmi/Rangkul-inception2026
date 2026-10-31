"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import {
  CalendarIcon,
  MenuIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
  XIcon,
} from "@/components/ui/icons";
import { signOutAction } from "@/server/auth/actions";

export type MobileNavUser = {
  name: string;
  email: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
};

const navigation = [
  { href: "/jelajahi", label: "Jelajahi tempat" },
  { href: "/komunitas", label: "Komunitas" },
  { href: "/volunteer", label: "Volunteer" },
];

const AUTH_PATHS = new Set(["/masuk", "/daftar"]);

const roleLabels: Record<MobileNavUser["role"], string> = {
  USER: "Pengguna",
  ORGANIZER: "Penyelenggara",
  ADMIN: "Admin",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "R";
}

export function MobileNav({ user }: { user: MobileNavUser | null }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const nextPath = pathname && !AUTH_PATHS.has(pathname) ? pathname : "/";
  const query = `?next=${encodeURIComponent(nextPath)}`;
  const canManageEvents = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
        className="inline-grid h-11 w-11 place-items-center rounded-button text-ink transition-colors hover:bg-surface-muted focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {open ? (
          <XIcon className="h-5 w-5" />
        ) : (
          <MenuIcon className="h-5 w-5" />
        )}
      </button>

      {open ? (
        <div
          id="menu-mobile"
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-surface shadow-card"
        >
          <div className="container-page py-4">
            <nav aria-label="Navigasi mobile">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "flex min-h-11 items-center rounded-button px-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary-50 text-primary-800"
                            : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {user ? (
              <div className="mt-4 border-t border-line pt-4">
                <div className="flex items-start gap-3 rounded-card bg-surface-muted/70 p-3">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-800"
                  >
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {user.email}
                    </p>
                    <p className="mt-1 text-xs font-medium text-primary-800">
                      {roleLabels[user.role]}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <Link
                    href="/profil"
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center gap-2.5 rounded-button px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                  >
                    <UserIcon className="h-4 w-4 shrink-0" />
                    Profil saya
                  </Link>
                  {canManageEvents ? (
                    <Link
                      href="/dashboard/kegiatan"
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center gap-2.5 rounded-button px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                    >
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      Kelola kegiatan
                    </Link>
                  ) : null}
                  {user.role === "ADMIN" ? (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center gap-2.5 rounded-button px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                    >
                      <ShieldCheckIcon className="h-4 w-4 shrink-0" />
                      Dashboard admin
                    </Link>
                  ) : null}
                </div>

                <form action={signOutAction} className="mt-3 border-t border-line pt-3">
                  <Button type="submit" variant="secondary" className="w-full">
                    Keluar
                  </Button>
                </form>
              </div>
            ) : (
              <div className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-2">
                <ButtonLink href={`/masuk${query}`} variant="secondary">
                  Masuk
                </ButtonLink>
                <ButtonLink href={`/daftar${query}`}>Daftar</ButtonLink>
              </div>
            )}

            <ButtonLink
              href="/tambah-info"
              onClick={() => setOpen(false)}
              className="mt-3 w-full"
            >
              <PlusIcon className="h-4 w-4" />
              Bagikan pengalaman
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </div>
  );
}
