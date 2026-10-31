import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "@/components/layout/brand";
import { CheckIcon } from "@/components/ui/icons";

const benefits = [
  "Info aksesibilitas sampai level pintu masuk",
  "Direktori komunitas dari berbagai daerah",
  "Kegiatan volunteer yang benar-benar inklusif",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-primary-900 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[28px] border-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full border-[24px] border-white/5"
        />

        <div className="relative">
          <Brand inverse />
        </div>

        <div className="relative max-w-md py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-200">
            Satu akun, banyak ruang
          </p>
          <p className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-white">
            Ruang yang lebih ramah dimulai dari satu akun.
          </p>
          <p className="mt-4 text-primary-100">
            Bergabung untuk menjelajah, berkontribusi, atau mengajak orang lain
            ikut serta.
          </p>

          <ul className="mt-8 space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-primary-100">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-primary-100">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-200">
          Aksesibel sejak awal. Dirancang untuk semua.
        </p>
      </aside>

      <div className="flex min-h-dvh flex-col bg-canvas">
        <div className="container-page flex h-16 items-center justify-between lg:hidden">
          <Brand />
          <Link
            href="/"
            className="text-sm font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Beranda
          </Link>
        </div>

        <main
          id="konten-utama"
          tabIndex={-1}
          className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10"
        >
          <div className="w-full max-w-md">{children}</div>
        </main>

        <p className="pb-6 text-center text-xs text-ink-muted">
          Rangkul · Membantu Sesama, Ruang untuk Semua
        </p>
      </div>
    </div>
  );
}
