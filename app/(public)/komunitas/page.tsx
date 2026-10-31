import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightIcon, CheckIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { CommunityDirectory as CommunityDirectoryView } from "@/components/communities/community-directory";
import { getCommunityDirectory } from "@/server/communities/queries";

export const metadata: Metadata = {
  title: "Komunitas",
  description:
    "Direktori komunitas disabilitas dan komunitas inklusif di Indonesia. Cari berdasarkan wilayah dan fokus komunitas, lalu bergabung langsung.",
};

const registrationSteps = [
  {
    title: "Isi formulir komunitas",
    description:
      "Lengkapi data pengurus, profil komunitas, grup komunikasi, foto KTP, dan sampul.",
  },
  {
    title: "Diverifikasi admin",
    description:
      "Admin memeriksa data dan menghubungi pengurus jika ada yang perlu dilengkapi.",
  },
  {
    title: "Tampil di direktori",
    description:
      "Setelah disetujui, profil komunitas tampil dan bisa ditemukan calon anggota.",
  },
];

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function DirectorySkeleton() {
  return (
    <div>
      <Skeleton className="h-40 w-full rounded-card" />
      <div className="mt-6 flex items-center justify-between gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-card border border-line bg-surface"
          >
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-11 w-full rounded-button" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function CommunityDirectory({
  searchParams,
}: Pick<PageProps<"/komunitas">, "searchParams">) {
  const params = await searchParams;
  const query = firstValue(params.q).trim();
  const province = firstValue(params.wilayah);
  const focus = firstValue(params.fokus);

  const { items, totalVerified } = await getCommunityDirectory({});

  return (
    <CommunityDirectoryView
      communities={items}
      totalVerified={totalVerified}
      initialQuery={query}
      initialProvince={province}
      initialFocus={focus}
    />
  );
}

export default function CommunityPage({
  searchParams,
}: PageProps<"/komunitas">) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-primary-100/70 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-secondary-100/60 blur-3xl"
        />

        <div className="container-page relative py-12 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
              Direktori komunitas
            </p>
            <h1 className="mt-3 text-display-sm font-bold tracking-tight text-ink sm:text-display">
              Temukan komunitas yang
              <br className="hidden sm:block" />{" "}
              <span className="text-primary-700">satu frekuensi.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
              Jelajahi komunitas disabilitas dan komunitas inklusif dari
              berbagai daerah. Lihat fokus komunitas, kenali pengurusnya, lalu
              bergabung lewat saluran yang tersedia.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/komunitas/daftar" size="lg">
              Daftarkan komunitasmu
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
              <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
              Setiap komunitas diverifikasi admin sebelum tampil di direktori.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page py-8 lg:py-10">
        <Suspense fallback={<DirectorySkeleton />}>
          <CommunityDirectory searchParams={searchParams} />
        </Suspense>

        <section
          aria-labelledby="ajak-komunitas"
          className="mt-12 overflow-hidden rounded-sheet border border-line bg-surface shadow-xs lg:mt-16"
        >
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                Untuk pengurus komunitas
              </p>
              <h2
                id="ajak-komunitas"
                className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
              >
                Komunitasmu belum ada di sini?
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">
                Daftarkan komunitasmu agar lebih mudah ditemukan penyandang
                disabilitas, keluarga, dan calon relawan di sekitarmu. Gratis
                dan cukup sekali mengisi formulir.
              </p>
              <ButtonLink
                href="/komunitas/daftar"
                size="lg"
                className="mt-6 w-full sm:w-auto"
              >
                Mulai pendaftaran
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>

            <ol className="space-y-4">
              {registrationSteps.map((step, index) => (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-50 text-sm font-semibold text-primary-800">
                    {index + 1}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 font-medium text-ink">
                      {step.title}
                      {index === 2 ? (
                        <CheckIcon className="h-4 w-4 text-success-700" />
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </>
  );
}
