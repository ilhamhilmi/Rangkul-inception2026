import Link from "next/link";
import type { ReactNode } from "react";

import { Brand } from "@/components/layout/brand";
import { ArrowLeftIcon, ShieldCheckIcon } from "@/components/ui/icons";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted/50">
      <header className="border-b border-line bg-surface">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Brand />
          <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted">
            <ShieldCheckIcon className="h-4 w-4 text-primary-700" />
            Area admin
          </span>
        </div>
      </header>

      <main
        id="konten-utama"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6"
      >
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="pb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali ke situs Rangkul
        </Link>
      </footer>
    </div>
  );
}
