import { ButtonLink } from "@/components/ui/button";
import { UsersIcon } from "@/components/ui/icons";

export default function CommunityNotFound() {
  return (
    <div className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-50 text-primary-700">
          <UsersIcon className="h-7 w-7" />
        </span>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
          Komunitas tidak ditemukan
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Profil komunitas ini tidak tersedia.
        </h1>
        <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ink-muted">
          Mungkin tautannya sudah berubah, komunitas belum terverifikasi, atau
          profilnya sedang tidak aktif. Kembali ke direktori untuk mencari
          komunitas lain di sekitarmu.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/komunitas">Kembali ke direktori</ButtonLink>
          <ButtonLink href="/komunitas/daftar" variant="secondary">
            Daftarkan komunitas
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
