import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { getAdminOverview } from "@/server/admin/queries";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false },
};

const cards = [
  {
    key: "pendingCommunities" as const,
    label: "Komunitas menunggu",
    description: "Perlu ditinjau dan diverifikasi.",
    href: "/admin/komunitas",
    icon: ClockIcon,
    tone: "bg-warning-50 text-warning-700" as const,
  },
  {
    key: "pendingOrganizers" as const,
    label: "Penyelenggara menunggu",
    description: "Pengajuan role ORGANIZER.",
    href: "/admin/penyelenggara",
    icon: ShieldCheckIcon,
    tone: "bg-info-50 text-info-700" as const,
  },
  {
    key: "pendingEvents" as const,
    label: "Kegiatan menunggu",
    description: "Pengadaan volunteer perlu ditinjau.",
    href: "/admin/kegiatan",
    icon: CalendarIcon,
    tone: "bg-secondary-50 text-secondary-700" as const,
  },
  {
    key: "verifiedCommunities" as const,
    label: "Komunitas terverifikasi",
    description: "Tampil di direktori publik.",
    href: "/komunitas",
    icon: CheckIcon,
    tone: "bg-success-50 text-success-700" as const,
  },
  {
    key: "totalProfiles" as const,
    label: "Total profil",
    description: "Akun yang terdaftar di Rangkul.",
    href: "/admin",
    icon: UsersIcon,
    tone: "bg-primary-50 text-primary-700" as const,
  },
];

export default async function AdminOverviewPage() {
  const stats = await getAdminOverview();
  const needsAttention =
    stats.pendingCommunities + stats.pendingOrganizers + stats.pendingEvents;

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">
            Pusat moderasi
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Dashboard Admin
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-ink-muted">
            Tinjau pengajuan komunitas, penyelenggara, dan kegiatan volunteer.
            Setelah disetujui, data langsung tampil di halaman publik yang
            sesuai.
          </p>
        </div>
        <Badge tone={needsAttention > 0 ? "info" : "success"}>
          {needsAttention > 0
            ? `${needsAttention} pengajuan menunggu`
            : "Tidak ada antrean baru"}
        </Badge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];

          return (
            <article
              key={card.key}
              className="rounded-card border border-line bg-surface p-5 shadow-xs"
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-full ${card.tone}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-3xl font-bold tracking-tight text-ink">
                {value}
              </p>
              <h2 className="mt-1 text-sm font-semibold text-ink">
                {card.label}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {card.description}
              </p>
              <ButtonLink
                href={card.href}
                variant="ghost"
                size="sm"
                className="-ml-4 mt-3"
              >
                Buka
              </ButtonLink>
            </article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <section className="rounded-card border border-line bg-surface p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-info-50 text-info-700">
              <ClockIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Antrean komunitas
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {stats.pendingCommunities > 0
                  ? `${stats.pendingCommunities} komunitas menunggu peninjauan data pengurus, logo, dan profil.`
                  : "Semua pengajuan komunitas sudah diproses."}
              </p>
              <ButtonLink href="/admin/komunitas" className="mt-4" size="sm">
                Tinjau komunitas
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-line bg-surface p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700">
              <ShieldCheckIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Antrean penyelenggara
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {stats.pendingOrganizers > 0
                  ? `${stats.pendingOrganizers} pengajuan role penyelenggara menunggu keputusan.`
                  : "Tidak ada pengajuan penyelenggara yang menunggu."}
              </p>
              <ButtonLink
                href="/admin/penyelenggara"
                variant="secondary"
                className="mt-4"
                size="sm"
              >
                Tinjau penyelenggara
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-line bg-surface p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary-50 text-secondary-700">
              <CalendarIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Antrean kegiatan
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                {stats.pendingEvents > 0
                  ? `${stats.pendingEvents} kegiatan volunteer menunggu tinjauan sebelum terbit.`
                  : "Tidak ada kegiatan volunteer yang menunggu tinjauan."}
              </p>
              <ButtonLink
                href="/admin/kegiatan"
                variant="secondary"
                className="mt-4"
                size="sm"
              >
                Tinjau kegiatan
              </ButtonLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
