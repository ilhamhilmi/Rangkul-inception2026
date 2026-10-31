import type { Metadata } from "next";
import { Suspense } from "react";

import { ReviewActions } from "@/components/admin/review-actions";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingCommunityApplications } from "@/server/admin/queries";

export const metadata: Metadata = {
  title: "Approval Komunitas",
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

function AdminCommunitiesSkeleton() {
  return (
    <div className="container-page py-8 lg:py-10" aria-busy="true">
      <span className="sr-only">Memuat antrean komunitas…</span>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-4 h-9 w-56" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <div className="mt-8 space-y-5">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-72 rounded-card" />
        ))}
      </div>
    </div>
  );
}

async function AdminCommunitiesContent() {
  const applications = await getPendingCommunityApplications();

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
            Komunitas
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-ink-muted">
            Periksa data pengurus, profil komunitas, dan logo sebelum
            menampilkan komunitas di direktori publik.
          </p>
        </div>
        <Badge tone={applications.length > 0 ? "info" : "success"}>
          {applications.length} menunggu
        </Badge>
      </div>

      {applications.length === 0 ? (
        <div className="mt-8 rounded-card border border-line bg-surface p-8 text-center shadow-xs">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-50 text-success-700">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-ink">
            Tidak ada komunitas menunggu
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            Semua pengajuan komunitas sudah diproses. Antrean baru akan muncul
            di sini setelah pengurus mengirim formulir.
          </p>
          <ButtonLink href="/komunitas" className="mt-5" variant="secondary">
            Lihat direktori publik
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {applications.map(({ community, request }) => (
            <article
              key={community.id}
              className="overflow-hidden rounded-card border border-line bg-surface shadow-xs"
            >
              <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-card border-2 border-surface bg-primary-100 font-display text-2xl font-bold text-primary-800 shadow-card">
                  {community.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={community.logoUrl}
                      alt={`Logo ${community.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    community.name.slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-ink">
                      {community.name}
                    </h2>
                    <Badge tone="info">PENDING</Badge>
                    {community.logoUrl ? (
                      <Badge tone="success">Logo tersedia</Badge>
                    ) : (
                      <Badge tone="neutral">Tanpa logo</Badge>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPinIcon className="h-4 w-4 text-primary-700" />
                      {community.city}, {community.province}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <UsersIcon className="h-4 w-4 text-primary-700" />
                      {community.focus.join(", ")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <ClockIcon className="h-4 w-4 text-primary-700" />
                      Diajukan {formatDate(request?.submittedAt ?? community.createdAt)}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                    {community.description}
                  </p>

                  <dl className="mt-4 grid gap-3 rounded-card border border-line bg-surface-muted/40 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Pengurus
                      </dt>
                      <dd className="mt-1 font-medium text-ink">
                        {payloadText(request?.payload, "picName") ??
                          community.owner.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Pemilik akun
                      </dt>
                      <dd className="mt-1 break-all font-medium text-ink">
                        {community.owner.email}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Kontak pengurus
                      </dt>
                      <dd className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-ink-muted">
                        {payloadText(request?.payload, "picEmail") ? (
                          <span className="inline-flex items-center gap-1">
                            <MailIcon className="h-3.5 w-3.5" />
                            {payloadText(request?.payload, "picEmail")}
                          </span>
                        ) : null}
                        {payloadText(request?.payload, "picPhone") ? (
                          <span className="inline-flex items-center gap-1">
                            <PhoneIcon className="h-3.5 w-3.5" />
                            {payloadText(request?.payload, "picPhone")}
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Tautan bergabung
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={community.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all font-medium text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline"
                        >
                          {community.joinUrl}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="border-t border-line bg-surface-muted/30 px-5 pb-5 sm:px-6">
                <ReviewActions kind="community" id={community.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCommunitiesPage() {
  return (
    <Suspense fallback={<AdminCommunitiesSkeleton />}>
      <AdminCommunitiesContent />
    </Suspense>
  );
}
