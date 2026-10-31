import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CheckIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { CommunityRegistrationForm } from "@/components/communities/community-registration-form";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Daftarkan Komunitas",
  description:
    "Daftarkan komunitas disabilitas atau komunitas inklusifmu di direktori Rangkul. Isi data pengurus dan profil komunitas untuk diverifikasi admin.",
};

const verificationSteps = [
  {
    title: "Ajukan formulir",
    description: "Isi data pengurus dan profil komunitas.",
  },
  {
    title: "Ditinjau admin",
    description: "Admin memeriksa kelengkapan dan menghubungi pengurus.",
  },
  {
    title: "Tampil di direktori",
    description: "Profil aktif dan bisa ditemukan calon anggota.",
  },
];

const requirements = [
  "Nama dan kontak pengurus yang aktif",
  "Nama, deskripsi, dan wilayah komunitas",
  "Tautan grup WA atau kanal komunitas",
  "Akun Rangkul yang sudah masuk",
  "Media sosial komunitas (opsional)",
];

function RegisterSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-5 w-64" />
      <Skeleton className="mt-4 h-10 w-full max-w-xl" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Skeleton className="h-[720px] w-full rounded-sheet" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-card" />
          <Skeleton className="h-56 w-full rounded-card" />
        </div>
      </div>
    </div>
  );
}

async function CommunityRegisterContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/masuk?next=%2Fkomunitas%2Fdaftar");
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Komunitas", href: "/komunitas" },
          { label: "Daftarkan komunitas" },
        ]}
      />

      <div className="mt-6 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
          Pendaftaran komunitas
        </p>
        <h1 className="mt-3 text-display-sm font-bold tracking-tight text-ink">
          Daftarkan komunitasmu di Rangkul.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Perkenalkan komunitasmu ke penyandang disabilitas, keluarga, dan calon
          relawan di seluruh Indonesia. Setelah diverifikasi admin, profil
          komunitasmu tampil di direktori publik.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="success">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Diverifikasi admin
          </Badge>
          <Badge tone="primary">
            <CheckIcon className="h-3.5 w-3.5" />
            Gratis
          </Badge>
          <Badge tone="neutral">Perlu waktu ± 10 menit</Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
        <CommunityRegistrationForm
          defaultName={user.name}
          defaultEmail={user.email}
        />

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section
            aria-labelledby="alur-verifikasi"
            className="rounded-card border border-line bg-surface p-5 shadow-xs"
          >
            <h2
              id="alur-verifikasi"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Alur verifikasi
            </h2>
            <ol className="mt-4 space-y-4">
              {verificationSteps.map((step, index) => (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-semibold text-primary-800">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{step.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="persiapan"
            className="rounded-card border border-line bg-surface p-5 shadow-xs"
          >
            <h2
              id="persiapan"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Yang perlu disiapkan
            </h2>
            <ul className="mt-4 space-y-2.5">
              {requirements.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-ink-muted"
                >
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="privasi-kontak"
            className="rounded-card border border-line bg-surface-muted p-5"
          >
            <h2
              id="privasi-kontak"
              className="flex items-center gap-2 text-base font-semibold text-ink"
            >
              <ShieldCheckIcon className="h-5 w-5 text-primary-700" />
              Data pengurus
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Nama, email, dan nomor pengurus dipakai admin untuk verifikasi.
              Email pengurus juga menjadi kontak publik komunitas. Nomor telepon
              tidak ditampilkan di direktori.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function CommunityRegisterPage() {
  return (
    <div className="container-page py-8 lg:py-10">
      <Suspense fallback={<RegisterSkeleton />}>
        <CommunityRegisterContent />
      </Suspense>
    </div>
  );
}
