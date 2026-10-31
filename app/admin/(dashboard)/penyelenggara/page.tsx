import type { Metadata } from "next";
import { Suspense } from "react";

import { ReviewActions } from "@/components/admin/review-actions";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { createVerificationDocumentSignedUrl } from "@/lib/supabase/storage";
import { getPendingOrganizerApplications } from "@/server/admin/queries";

export const metadata: Metadata = {
  title: "Approval Penyelenggara",
  robots: { index: false, follow: false },
};

function payloadText(payload: unknown, key: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function AdminOrganizersSkeleton() {
  return (
    <div className="container-page py-8 lg:py-10" aria-busy="true">
      <span className="sr-only">Memuat antrean penyelenggara…</span>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-4 h-9 w-64" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <div className="mt-8 space-y-5">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-card" />
        ))}
      </div>
    </div>
  );
}

async function AdminOrganizersContent() {
  const applications = await getPendingOrganizerApplications();

  const items = await Promise.all(
    applications.map(async (application) => {
      let documentSignedUrl: string | null = null;

      if (application.documentUrl) {
        try {
          documentSignedUrl = await createVerificationDocumentSignedUrl(
            application.documentUrl,
            600,
          );
        } catch {
          documentSignedUrl = null;
        }
      }

      return { application, documentSignedUrl };
    }),
  );

  return (
    <div className="container-page py-8 lg:py-10">
      <ButtonLink href="/admin" variant="ghost" size="sm" className="-ml-4">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke ringkasan
      </ButtonLink>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">
            Antrean verifikasi
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Penyelenggara
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-ink-muted">
            Tinjau identitas pengurus, pengalaman, dan dokumen pendukung sebelum
            memberikan role ORGANIZER.
          </p>
        </div>
        <Badge tone={items.length > 0 ? "info" : "success"}>
          {items.length} menunggu
        </Badge>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-card border border-line bg-surface p-8 text-center shadow-xs">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-50 text-success-700">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-ink">
            Tidak ada pengajuan menunggu
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            Pengajuan penyelenggara baru akan muncul di sini setelah pengguna
            mengirim formulir di halaman Volunteer.
          </p>
          <ButtonLink
            href="/volunteer/jadi-penyelenggara"
            className="mt-5"
            variant="secondary"
          >
            Lihat halaman pengajuan
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {items.map(({ application, documentSignedUrl }) => (
            <article
              key={application.id}
              className="overflow-hidden rounded-card border border-line bg-surface shadow-xs"
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold tracking-tight text-ink">
                        {payloadText(application.payload, "organizationName") ??
                          application.user.name}
                      </h2>
                      <Badge tone="info">PENDING</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      Diajukan {formatDate(application.submittedAt)} · role saat
                      ini {application.user.role}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 rounded-card border border-line bg-surface-muted/40 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Akun
                    </dt>
                    <dd className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium text-ink">
                      <span className="inline-flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5" />
                        {application.user.name}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-ink-muted">
                        <MailIcon className="h-3.5 w-3.5" />
                        {application.user.email}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Kontak pengurus
                    </dt>
                    <dd className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink">
                      <span className="inline-flex items-center gap-1.5">
                        <PhoneIcon className="h-3.5 w-3.5" />
                        {payloadText(application.payload, "phone") ?? "-"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-ink-muted">
                        {payloadText(application.payload, "contactName") ??
                          application.user.name}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Wilayah
                    </dt>
                    <dd className="mt-1 inline-flex items-center gap-1.5 text-ink">
                      <MapPinIcon className="h-3.5 w-3.5 text-primary-700" />
                      {payloadText(application.payload, "city") ?? "-"},{" "}
                      {payloadText(application.payload, "province") ?? "-"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Dokumen verifikasi
                    </dt>
                    <dd className="mt-1">
                      {documentSignedUrl ? (
                        <a
                          href={documentSignedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-medium text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline"
                        >
                          Buka dokumen (tautan 10 menit)
                          <ExternalLinkIcon className="h-3 w-3" />
                        </a>
                      ) : application.documentUrl ? (
                        <span className="text-ink-muted">
                          Dokumen ada, tetapi tautan gagal dibuat.
                        </span>
                      ) : (
                        <span className="text-ink-muted">Tidak ada dokumen.</span>
                      )}
                    </dd>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-ink">
                    Pengalaman / motivasi
                  </h3>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                    {payloadText(application.payload, "experience") ??
                      "Tidak diisi."}
                  </p>
                </div>
              </div>

              <div className="border-t border-line bg-surface-muted/30 px-5 pb-5 sm:px-6">
                <ReviewActions kind="organizer" id={application.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrganizersPage() {
  return (
    <Suspense fallback={<AdminOrganizersSkeleton />}>
      <AdminOrganizersContent />
    </Suspense>
  );
}
