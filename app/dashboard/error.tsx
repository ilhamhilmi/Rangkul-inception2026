"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";

/**
 * Error boundary dashboard penyelenggara. Dipakai terutama saat tabel
 * Volunteer belum ada karena migration belum diterapkan pada database.
 */
export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page py-14 lg:py-20">
      <div className="mx-auto max-w-xl rounded-card border border-line bg-surface p-8 text-center shadow-xs">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger-50 text-danger-700">
          <AlertIcon className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">
          Data kegiatan belum tersedia
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Tabel Volunteer belum ada di database saat ini. Migration modul
          Volunteer perlu dijalankan oleh pengelola database. Setelah itu, muat
          ulang halaman ini.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            Coba lagi
          </Button>
          <ButtonLink href="/volunteer" variant="secondary">
            Kembali ke Volunteer
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
