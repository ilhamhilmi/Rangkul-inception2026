import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertIcon, CheckIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { OrganizerApplicationForm } from "@/components/volunteer/organizer-application-form";
import { getCurrentProfile } from "@/lib/auth/session";
import { isOrganizer } from "@/lib/auth/guards";
import { getLatestOrganizerVerification } from "@/lib/volunteer/data";

export const metadata: Metadata = {
  title: "Jadi Penyelenggara",
  description:
    "Ajukan diri sebagai penyelenggara kegiatan volunteer inklusif di Rangkul. Verifikasi akun untuk membuat dan mengelola kegiatan.",
};

const steps = [
  {
    title: "Kirim pengajuan",
    description:
      "Lengkapi data organisasi, kontak, pengalaman, dan dokumen verifikasi.",
  },
  {
    title: "Ditinjau admin",
    description:
      "Admin memeriksa kelengkapan data dan menghubungi kontak yang terdaftar.",
  },
  {
    title: "Kelola kegiatan",
    description:
      "Setelah disetujui, akunmu menjadi penyelenggara dan dapat membuat kegiatan.",
  },
];

const requirements = [
  "Organisasi atau komunitas yang aktif",
  "Kontak pengurus yang dapat dihubungi",
  "Dokumen verifikasi yang jelas",
  "Komitmen menyelenggarakan kegiatan inklusif",
];

const fullDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function ApplicationSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">Memuat formulir pengajuan…</span>
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-40 w-full rounded-sheet" />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-96 w-full rounded-card" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    </div>
  );
}

function StatusCard({
  tone,
  title,
  description,
  children,
}: {
  tone: "info" | "success" | "danger";
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const toneClasses = {
    info: "border-info-600/25 bg-info-50 text-info-700",
    success: "border-success-600/25 bg-success-50 text-success-700",
    danger: "border-danger-600/25 bg-danger-50 text-danger-700",
  } as const;

  return (
    <div className={`rounded-card border p-5 ${toneClasses[tone]}`}>
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <ShieldCheckIcon className="h-5 w-5" />
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {description}
      </p>
      {children}
    </div>
  );
}

async function OrganizerApplicationContent() {
  await connection();

  const profile = await getCurrentProfile();
  const latest = profile
    ? await getLatestOrganizerVerification(profile.id)
    : null;

  const organizerAccount = profile ? isOrganizer(profile) : false;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Volunteer", href: "/volunteer" },
          { label: "Jadi penyelenggara" },
        ]}
      />

      <header className="mt-4 max-w-3xl">
        <Badge tone="primary">Pengajuan penyelenggara</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Ajak lebih banyak orang berkontribusi
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Penyelenggara Rangkul dapat membuat kegiatan volunteer inklusif,
          mengelola pendaftar, dan mengekspor data peserta. Ajukan akunmu dengan
          data yang jelas agar proses verifikasi berjalan cepat.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          {!profile ? (
            <StatusCard
              tone="info"
              title="Masuk terlebih dahulu"
              description="Kamu perlu masuk ke akun Rangkul sebelum mengirim pengajuan penyelenggara."
            >
              <ButtonLink
                href="/masuk?next=/volunteer/jadi-penyelenggara"
                size="md"
                className="mt-4"
              >
                Masuk ke akun
              </ButtonLink>
            </StatusCard>
          ) : organizerAccount ? (
            <StatusCard
              tone="success"
              title="Akunmu sudah menjadi penyelenggara"
              description="Kamu dapat langsung membuat dan mengelola kegiatan volunteer dari dashboard penyelenggara."
            >
              <ButtonLink href="/dashboard/kegiatan" size="md" className="mt-4">
                Buka dashboard kegiatan
              </ButtonLink>
            </StatusCard>
          ) : latest?.status === "PENDING" ? (
            <StatusCard
              tone="info"
              title="Pengajuan sedang ditinjau"
              description={`Pengajuan dikirim pada ${fullDateFormatter.format(
                latest.submittedAt,
              )}. Admin akan menghubungi kontak yang terdaftar. Kamu tidak perlu mengirim pengajuan baru.`}
            />
          ) : latest?.status === "APPROVED" ? (
            <StatusCard
              tone="success"
              title="Pengajuan sudah disetujui"
              description="Pengajuanmu telah disetujui admin. Jika akses penyelenggara belum aktif pada akunmu, muat ulang halaman ini atau hubungi admin Rangkul."
            />
          ) : (
            <>
              {latest?.status === "REJECTED" ? (
                <StatusCard
                  tone="danger"
                  title="Pengajuan sebelumnya ditolak"
                  description={
                    latest.reviewNote
                      ? `Catatan admin: ${latest.reviewNote}`
                      : "Perbaiki data dan dokumen, lalu kirim pengajuan baru."
                  }
                />
              ) : null}

              <section
                aria-labelledby="formulir-pengajuan"
                className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6"
              >
                <h2
                  id="formulir-pengajuan"
                  className="text-lg font-semibold tracking-tight text-ink"
                >
                  Formulir pengajuan
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Data kontak hanya digunakan untuk verifikasi dan koordinasi.
                </p>
                <div className="mt-5">
                  <OrganizerApplicationForm />
                </div>
              </section>
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section
            aria-labelledby="alur-verifikasi"
            className="rounded-card border border-line bg-surface p-5 shadow-xs"
          >
            <h2
              id="alur-verifikasi"
              className="text-base font-semibold tracking-tight text-ink"
            >
              Alur verifikasi
            </h2>
            <ol className="mt-4 space-y-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{step.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="syarat-penyelenggara"
            className="rounded-card border border-line bg-surface p-5 shadow-xs"
          >
            <h2
              id="syarat-penyelenggara"
              className="text-base font-semibold tracking-tight text-ink"
            >
              Yang perlu disiapkan
            </h2>
            <ul className="mt-4 space-y-2.5">
              {requirements.map((requirement) => (
                <li
                  key={requirement}
                  className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted"
                >
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                  {requirement}
                </li>
              ))}
            </ul>
          </section>

          <p className="flex items-start gap-2 rounded-card border border-line bg-surface-muted/60 p-4 text-xs leading-relaxed text-ink-muted">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
            Status pengajuan mengikuti keputusan admin pada dashboard verifikasi
            global. Modul Volunteer hanya membaca status tersebut.
          </p>
        </aside>
      </div>
    </>
  );
}

export default function OrganizerApplicationPage() {
  return (
    <div className="container-page py-6 lg:py-10">
      <Suspense fallback={<ApplicationSkeleton />}>
        <OrganizerApplicationContent />
      </Suspense>
    </div>
  );
}
