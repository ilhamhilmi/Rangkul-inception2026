import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Masuk",
  description:
    "Masuk ke akun Rangkul untuk menjelajah tempat aksesibel, komunitas inklusif, dan kegiatan volunteer.",
};

export default function LoginPage() {
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
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Belum punya akun?{" "}
        <Link
          href="/daftar"
          className="font-semibold text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline"
        >
          Daftar sekarang
        </Link>
      </p>

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
