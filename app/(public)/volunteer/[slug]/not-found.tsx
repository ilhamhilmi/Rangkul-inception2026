import { ButtonLink } from "@/components/ui/button";
import { HeartHandshakeIcon } from "@/components/ui/icons";

export default function VolunteerEventNotFound() {
  return (
    <div className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-50 text-primary-700">
          <HeartHandshakeIcon className="h-7 w-7" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
          Kegiatan tidak ditemukan
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Kegiatan ini tidak tersedia untuk publik.
        </h1>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-muted">
          Mungkin tautannya sudah berubah, kegiatan sudah ditutup, atau belum
          diterbitkan admin. Kembali ke halaman Volunteer untuk mencari kegiatan
          lain yang bisa kamu ikuti.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/volunteer">Lihat semua kegiatan</ButtonLink>
          <ButtonLink
            href="/volunteer/jadi-penyelenggara"
            variant="secondary"
          >
            Jadi penyelenggara
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
