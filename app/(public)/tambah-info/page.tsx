import type { Metadata } from "next";
import Link from "next/link";
import { PostingForm } from "@/components/places/posting-form";
import { ChevronRightIcon, InfoIcon, PlusIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Tambah info tempat",
  description:
    "Bagikan informasi aksesibilitas tempat umum, termasuk fasilitas yang tersedia dan titik lokasi di peta.",
};

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
                Bantu orang lain tahu kondisi tempat sebelum berangkat. Tandai
                lokasinya di peta dan ceritakan fasilitas yang tersedia.
              </p>
            </div>

            <p className="flex max-w-sm items-start gap-2 rounded-card border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-muted shadow-xs">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
              Versi UI: form ini belum tersambung ke akun, unggahan, atau
              database. Data hanya ditampilkan di panel sukses.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-8 lg:py-10">
        <PostingForm />
      </section>
    </>
  );
}
