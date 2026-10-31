import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Daftar",
  description:
    "Buat akun Rangkul untuk menambah info aksesibilitas tempat, mengajukan komunitas, dan mendaftar kegiatan volunteer.",
};

export default function SignupPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">
        Bergabung dengan komunitas
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
        Buat akun Rangkul
      </h1>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Satu akun untuk menjelajah, berkontribusi, dan ikut kegiatan yang
        inklusif.
      </p>

      <div className="mt-8">
        <SignupForm />
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Sudah punya akun?{" "}
        <Link
          href="/masuk"
          className="font-semibold text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline"
        >
          Masuk di sini
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
