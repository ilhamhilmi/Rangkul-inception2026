import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { safeNextPath } from "@/lib/utils/redirect";

export const metadata: Metadata = {
  title: "Masuk",
  description:
    "Masuk ke akun Rangkul untuk menjelajah tempat aksesibel, komunitas inklusif, dan kegiatan volunteer.",
};

async function LoginFormSection({
  searchParams,
}: Pick<PageProps<"/masuk">, "searchParams">) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "/");

  return (
    <div>
      <LoginForm nextPath={next} />

      <p className="mt-6 text-center text-sm text-ink-muted">
        Belum punya akun?{" "}
        <Link
          href={`/daftar?next=${encodeURIComponent(next)}`}
          className="font-semibold text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/masuk">) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">
        Selamat datang kembali
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
        Masuk ke Rangkul
      </h1>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Lanjutkan menjelajah tempat, komunitas, dan kegiatan yang inklusif.
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
          <LoginFormSection searchParams={searchParams} />
        </Suspense>
      </div>

      <div className="mt-8 border-t border-line pt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
