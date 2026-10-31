"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Beranda" },
  { href: "/jelajahi", label: "Jelajahi" },
  { href: "/komunitas", label: "Komunitas" },
  { href: "/volunteer", label: "Volunteer" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/jelajahi" && pathname === "/tambah-info") return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "inline-flex h-11 items-center rounded-button px-3 text-sm font-medium transition-colors",
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
  );
}
