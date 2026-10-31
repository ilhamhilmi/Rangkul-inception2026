import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";

import { Brand } from "@/components/layout/brand";
import { Button, ButtonLink } from "@/components/ui/button";
import { ArrowLeftIcon, ShieldCheckIcon, UsersIcon } from "@/components/ui/icons";
import { getAuthorizedProfile } from "@/lib/auth/guards";
import { signOutAction } from "@/server/auth/actions";

const navigation = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/komunitas", label: "Komunitas" },
  { href: "/admin/penyelenggara", label: "Penyelenggara" },
  { href: "/admin/kegiatan", label: "Kegiatan" },
  { href: "/admin/tempat", label: "Tempat" },
];

function AdminSkeleton() {
  return (
    <div className="container-page py-10" aria-busy="true">
      <span className="sr-only">Memuat dashboard admin…</span>
      <div className="h-8 w-56 animate-pulse rounded-input bg-surface-muted" />
      <div className="mt-4 h-40 w-full animate-pulse rounded-card bg-surface-muted" />
    </div>
  );
}

async function AdminShell({ children }: { children: ReactNode }) {
  await connection();

  const auth = await getAuthorizedProfile(["ADMIN"]);

  if (!auth.allowed) {
    if (auth.reason === "UNAUTHENTICATED") {
      redirect("/admin/masuk?next=/admin");
    }

    return (
      <div className="container-page py-16 lg:py-24">
        <div className="mx-auto max-w-xl rounded-card border border-line bg-surface p-8 text-center shadow-xs">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger-50 text-danger-700">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">
            Area ini khusus admin
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Akunmu sudah masuk, tetapi belum memiliki role ADMIN. Hubungi admin
            utama bila akses ini diperlukan.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/">Kembali ke beranda</ButtonLink>
            <form action={signOutAction}>
              <Button type="submit" variant="secondary" className="w-full">
                Keluar dari akun ini
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const profile = auth.profile;

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted/40">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <Brand href="/admin" />
            <span className="hidden text-sm text-ink-muted sm:inline">
              Dashboard admin
            </span>
          </div>

          <nav aria-label="Navigasi admin" className="flex flex-wrap items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-button px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main id="konten-utama" tabIndex={-1} className="flex-1">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-4 text-sm text-ink-muted">
          <span>
            Masuk sebagai{" "}
            <span className="font-medium text-ink">{profile.name}</span>{" "}
            <span className="hidden sm:inline">({profile.email})</span>
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-button px-2 py-1 underline-offset-4 hover:text-ink hover:underline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Lihat situs
            </Link>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Keluar
              </Button>
            </form>
          </div>
        </div>
        {children}
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-ink-muted">
          <span>Rangkul Admin · Approval komunitas, penyelenggara, dan kegiatan</span>
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="h-4 w-4" />
            Akses terbatas ADMIN
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
