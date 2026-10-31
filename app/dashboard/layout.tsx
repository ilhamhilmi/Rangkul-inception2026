import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Brand } from "@/components/layout/brand";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLeftIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { getAuthorizedProfile } from "@/lib/auth/guards";

function DashboardSkeleton() {
  return (
    <div className="container-page py-10" aria-busy="true">
      <span className="sr-only">Memuat dashboard…</span>
      <div className="h-8 w-56 animate-pulse rounded-input bg-surface-muted" />
      <div className="mt-4 h-40 w-full animate-pulse rounded-card bg-surface-muted" />
    </div>
  );
}

async function DashboardShell({ children }: { children: ReactNode }) {
  await connection();

  const result = await getAuthorizedProfile(["ORGANIZER", "ADMIN"]);

  if (!result.allowed) {
    if (result.reason === "UNAUTHENTICATED") {
      redirect("/masuk?next=/dashboard/kegiatan");
    }

    return (
      <div className="container-page py-16 lg:py-24">
        <div className="mx-auto max-w-xl rounded-card border border-line bg-surface p-8 text-center shadow-xs">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-50 text-primary-700">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">
            Dashboard ini khusus penyelenggara
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Akunmu belum memiliki akses penyelenggara. Ajukan verifikasi terlebih
            dahulu, lalu kembali setelah admin menyetujui.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/volunteer/jadi-penyelenggara">
              Ajukan penyelenggara
            </ButtonLink>
            <ButtonLink href="/volunteer" variant="secondary">
              Kembali ke Volunteer
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const profile = result.profile;

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted/40">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <Brand href="/dashboard/kegiatan" />
            <span className="hidden text-sm text-ink-muted sm:inline">
              Dashboard penyelenggara
            </span>
          </div>

          <nav aria-label="Navigasi dashboard" className="flex items-center gap-2">
            <Link
              href="/dashboard/kegiatan"
              className="rounded-button px-3 py-2 text-sm font-medium text-ink hover:bg-surface-muted focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Kegiatan
            </Link>
            <ButtonLink href="/dashboard/kegiatan/baru" size="sm">
              Buat kegiatan
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main id="konten-utama" tabIndex={-1} className="flex-1">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-4 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            Masuk sebagai{" "}
            <span className="font-medium text-ink">{profile.name}</span>
            {profile.role === "ORGANIZER" ? <VerifiedBadge /> : null}
            {profile.role === "ADMIN" ? " (admin)" : ""}
          </span>
          <Link
            href="/volunteer"
            className="inline-flex items-center gap-1.5 rounded-button px-2 py-1 underline-offset-4 hover:text-ink hover:underline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Lihat halaman Volunteer
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
