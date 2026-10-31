import Link from "next/link";
import { Brand } from "@/components/layout/brand";

const fitur = [
  { href: "/#jelajahi", label: "Jelajahi tempat" },
  { href: "/komunitas", label: "Direktori komunitas" },
  { href: "/komunitas/daftar", label: "Daftarkan komunitas" },
  { href: "/#volunteer", label: "Kegiatan volunteer" },
  { href: "/#detail", label: "Detail pintu masuk" },
];

const akun = [
  { href: "/masuk", label: "Masuk" },
  { href: "/daftar", label: "Daftar akun" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted">
            Platform komunitas yang menyatukan informasi aksesibilitas tempat,
            direktori komunitas disabilitas, dan kegiatan volunteer inklusif.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-800">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-primary-600"
            />
            Dibangun bersama komunitas
          </p>
        </div>

        <nav aria-label="Fitur">
          <h2 className="text-sm font-semibold text-ink">Fitur</h2>
          <ul className="mt-4 space-y-2.5">
            {fitur.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Akun">
          <h2 className="text-sm font-semibold text-ink">Akun</h2>
          <ul className="mt-4 space-y-2.5">
            {akun.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Rangkul.</p>
          <p>Aksesibel sejak awal, untuk semua.</p>
        </div>
      </div>
    </footer>
  );
}
