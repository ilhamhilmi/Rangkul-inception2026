import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PostingForm } from "@/components/places/posting-form";
import { ButtonLink } from "@/components/ui/button";
import {
  ChevronRightIcon,
  InfoIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { isModerationEnabled } from "@/lib/env";

export const metadata: Metadata = {
  title: "Tambah info tempat",
  description:
    "Bagikan pengalaman aksesibilitas tempat umum dan tandai titik lokasinya di peta.",
};

function PostingFormSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Memuat formulir…</span>
      <div
        aria-hidden="true"
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]"
      >
        <div className="space-y-5">
          <div className="h-80 animate-pulse rounded-sheet border border-line bg-surface-muted" />
          <div className="h-96 animate-pulse rounded-sheet border border-line bg-surface-muted" />
        </div>
        <div className="h-56 animate-pulse rounded-sheet border border-line bg-surface-muted" />
      </div>
    </div>
  );
}

async function AddPlaceContent() {
  const user = await getCurrentUser();
  const moderationEnabled = isModerationEnabled();

  if (user) {
    return <PostingForm moderationEnabled={moderationEnabled} />;
  }

  return (
    <div className="mx-auto max-w-xl rounded-sheet border border-line bg-surface p-6 text-center shadow-xs sm:p-8">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-50 text-primary-700">
        <ShieldCheckIcon className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink">
        Masuk dulu untuk membagikan info
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        Postingan perlu terhubung dengan akun agar bisa ditandai “Paling
        membantu” dan dimoderasi dengan jelas.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <ButtonLink href="/masuk?next=%2Ftambah-info" size="md">
          Masuk
        </ButtonLink>
        <ButtonLink
          href="/daftar?next=%2Ftambah-info"
          variant="secondary"
          size="md"
        >
          Buat akun
        </ButtonLink>
      </div>
    </div>
  );
}

export default function AddPlacePage() {
  return (
    <>
      <section className="border-b border-line bg-surface-muted/40">
        <div className="container-page py-8 lg:py-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
              <li>
                <Link
                  href="/"
                  className="underline-offset-4 hover:text-ink hover:underline"
                >
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </li>
              <li>
                <Link
                  href="/jelajahi"
                  className="underline-offset-4 hover:text-ink hover:underline"
                >
                  Jelajahi
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </li>
              <li>
                <span aria-current="page" className="font-medium text-ink">
                  Tambah info
                </span>
              </li>
            </ol>
          </nav>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800">
                <PlusIcon className="h-3.5 w-3.5" />
                Kontribusi komunitas
              </p>
              <h1 className="mt-3 text-display-sm font-bold tracking-tight text-ink">
                Tambah info tempat
              </h1>
              <p className="mt-3 text-lg leading-relaxed text-ink-muted">
                Ceritakan kondisi tempat yang kamu datangi. Postinganmu muncul di
                Jelajahi dan bisa ditandai “Paling membantu” oleh pengguna lain.
              </p>
            </div>

            <p className="flex max-w-sm items-start gap-2 rounded-card border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted shadow-xs">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
              {isModerationEnabled()
                ? "Postingan diperiksa moderasi otomatis sebelum tayang. Yang aman langsung muncul; yang meragukan ditahan untuk ditinjau."
                : "Postingan langsung tayang setelah dikirim. Pastikan informasi dan fotonya sudah sesuai kondisi di lokasi."}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-8 lg:py-10">
        <Suspense fallback={<PostingFormSkeleton />}>
          <AddPlaceContent />
        </Suspense>
      </section>
    </>
  );
}
