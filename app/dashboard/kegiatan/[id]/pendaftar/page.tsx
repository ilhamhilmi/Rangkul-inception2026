import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeftIcon, ExternalLinkIcon, UsersIcon } from "@/components/ui/icons";
import { RegistrationStatusActions } from "@/components/volunteer/registration-status-actions";
import { requireOrganizer } from "@/lib/auth/guards";
import { listEventRegistrations } from "@/lib/volunteer/data";
import { REGISTRATION_STATUS_META } from "@/lib/volunteer/status";

export const metadata: Metadata = {
  title: "Pendaftar Kegiatan",
  description: "Kelola pendaftar kegiatan volunteer milikmu.",
};

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

export default async function EventRegistrantsPage({
  params,
}: PageProps<"/dashboard/kegiatan/[id]/pendaftar">) {
  const { id } = await params;
  await connection();

  const profile = await requireOrganizer();
  const data = await listEventRegistrations(id, profile);

  if (!data) notFound();

  const { event, registrations } = data;
  const confirmed = registrations.filter(
    (registration) => registration.status === "CONFIRMED",
  ).length;
  const pending = registrations.filter(
    (registration) => registration.status === "PENDING",
  ).length;

  return (
    <div className="container-page pb-16">
      <ButtonLink href="/dashboard/kegiatan" variant="ghost" size="sm">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke daftar kegiatan
      </ButtonLink>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Pendaftar kegiatan
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {event.title}
          </p>
        </div>

        <ButtonLink
          href={`/dashboard/kegiatan/${event.id}/pendaftar/export`}
          prefetch={false}
          size="md"
        >
          <ExternalLinkIcon className="h-4 w-4" />
          Ekspor XLSX
        </ButtonLink>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-card border border-line bg-surface p-4">
          <dt className="text-xs text-ink-muted">Terkonfirmasi</dt>
          <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
            {confirmed}
          </dd>
        </div>
        <div className="rounded-card border border-line bg-surface p-4">
          <dt className="text-xs text-ink-muted">Menunggu konfirmasi</dt>
          <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
            {pending}
          </dd>
        </div>
        <div className="rounded-card border border-line bg-surface p-4">
          <dt className="text-xs text-ink-muted">Total pendaftar</dt>
          <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
            {registrations.length}
          </dd>
        </div>
      </dl>

      {registrations.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={UsersIcon}
            title="Belum ada pendaftar"
            description="Pendaftar akan muncul di sini setelah kegiatan terbit dan ada relawan yang mendaftar."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Daftar pendaftar kegiatan {event.title}
              </caption>
              <thead>
                <tr className="border-b border-line bg-surface-muted/60 text-xs uppercase tracking-wide text-ink-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Peserta
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Kontak
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Kebutuhan aksesibilitas
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Waktu daftar
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {registrations.map((registration) => {
                  const meta = REGISTRATION_STATUS_META[registration.status];
                  return (
                    <tr key={registration.id} className="align-top">
                      <th scope="row" className="px-4 py-4 font-medium text-ink">
                        {registration.name}
                      </th>
                      <td className="px-4 py-4 text-ink-muted">
                        <span className="block break-all">
                          {registration.email}
                        </span>
                        <span className="mt-0.5 block">
                          {registration.phone}
                        </span>
                      </td>
                      <td className="max-w-[16rem] px-4 py-4 text-ink-muted">
                        {registration.accessibilityNeeds || "—"}
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-ink-muted">
                        <time dateTime={registration.createdAt.toISOString()}>
                          {dateTimeFormatter.format(registration.createdAt)}
                        </time>
                      </td>
                      <td className="px-4 py-4">
                        <RegistrationStatusActions
                          registrationId={registration.id}
                          status={registration.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-6 rounded-card border border-line bg-surface-muted/60 p-4 text-xs leading-relaxed text-ink-muted">
        Data peserta bersifat pribadi. Ekspor hanya tersedia untuk penyelenggara
        pemilik kegiatan dan admin. Hanya pendaftaran berstatus terkonfirmasi
        yang dihitung sebagai peserta pada halaman publik.
      </p>
    </div>
  );
}
