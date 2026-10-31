import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { ShieldCheckIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { safeAdminNextPath } from "@/lib/utils/redirect";

export const metadata: Metadata = {
  title: "Masuk Admin",
  description: "Halaman masuk khusus admin Rangkul.",
  robots: { index: false, follow: false },
};

async function AdminLoginFormSection({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const nextPath = safeAdminNextPath(params.next);

  return <AdminLoginForm nextPath={nextPath} />;
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  return (
    <div className="rounded-sheet border border-line bg-surface p-6 shadow-card sm:p-8">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-50 text-primary-700">
        <ShieldCheckIcon className="h-6 w-6" />
      </span>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">
        Akses terbatas
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
        Masuk Admin Rangkul
      </h1>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Gunakan akun yang sudah memiliki role <strong>ADMIN</strong> untuk
        meninjau komunitas dan pengajuan penyelenggara.
      </p>

      <div className="mt-8">
        <Suspense
          fallback={
            <div className="space-y-5" aria-hidden="true">
              <Skeleton className="h-20 w-full rounded-input" />
              <Skeleton className="h-20 w-full rounded-input" />
              <Skeleton className="h-11 w-full rounded-button" />
            </div>
          }
        >
          <AdminLoginFormSection searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
