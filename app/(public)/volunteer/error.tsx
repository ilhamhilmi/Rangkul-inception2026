"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";

export default function VolunteerError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-danger-50 text-danger-700">
          <AlertIcon className="h-7 w-7" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
          Kendala sementara
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Kegiatan belum bisa dimuat.
        </h1>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-muted">
          Terjadi kendala saat mengambil data kegiatan. Coba muat ulang, atau
          kembali ke halaman Volunteer beberapa saat lagi.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
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
