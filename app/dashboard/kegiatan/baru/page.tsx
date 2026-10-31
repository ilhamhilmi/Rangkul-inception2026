import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { EventForm } from "@/components/volunteer/event-form";
import { requireOrganizer } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Buat Kegiatan",
  description: "Buat kegiatan volunteer inklusif baru di Rangkul.",
};

function NewEventSkeleton() {
  return (
    <div className="container-page pb-16" aria-busy="true">
      <span className="sr-only">Memuat formulir kegiatan…</span>
      <Skeleton className="h-5 w-44" />
      <Skeleton className="mt-4 h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      <Skeleton className="mt-6 h-[32rem] w-full rounded-card" />
    </div>
  );
}

async function NewEventContent() {
  await connection();
  await requireOrganizer();

  return (
    <div className="container-page pb-16">
      <ButtonLink href="/dashboard/kegiatan" variant="ghost" size="sm">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke daftar kegiatan
      </ButtonLink>

      <div className="mt-4 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Buat kegiatan baru
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          Simpan sebagai draft untuk melengkapi nanti, atau ajukan langsung ke
          admin untuk diterbitkan di halaman Volunteer.
        </p>
      </div>

      <div className="mt-6">
        <EventForm />
      </div>
    </div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<NewEventSkeleton />}>
      <NewEventContent />
    </Suspense>
  );
}
