import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ProfileForm } from "@/components/profile/profile-form";
import { DeletePlaceButton } from "@/components/places/delete-place-button";
import { PlaceMedia } from "@/components/places/place-media";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CalendarIcon,
  HeartHandshakeIcon,
  MapPinIcon,
  PlusIcon,
  ThumbsUpIcon,
  UserIcon,
} from "@/components/ui/icons";
import { requireUser } from "@/lib/auth/guards";
import { PLACE_CATEGORIES } from "@/lib/constants/places";
import { formatDate, formatShortDate } from "@/lib/utils/format";
import { formatEventShortDate } from "@/lib/volunteer/format";
import { getProfileOverview } from "@/server/profiles/queries";
import type {
  ProfilePostStatus,
  ProfileRegistrationStatus,
} from "@/types/profile";

export const metadata: Metadata = {
  title: "Profil saya",
  description:
    "Kelola profil Rangkul, lihat postingan yang pernah kamu bagikan, dan pantau pendaftaran volunteer-mu.",
  robots: { index: false, follow: false },
};

const roleLabels = {
  USER: "Pengguna",
  ORGANIZER: "Penyelenggara",
  ADMIN: "Admin",
} as const;

const postStatusMeta: Record<
  ProfilePostStatus,
  { label: string; tone: "success" | "info" | "danger" | "neutral"; hint: string }
> = {
  PUBLISHED: {
    label: "Tayang",
    tone: "success",
    hint: "Postingan sudah tampil di Jelajahi.",
  },
  PENDING: {
    label: "Menunggu tinjauan",
    tone: "info",
    hint: "Postingan sedang diperiksa sebelum tayang.",
  },
  REJECTED: {
    label: "Tidak lolos moderasi",
    tone: "danger",
    hint: "Postingan tidak tayang. Kamu bisa membagikan ulang dengan perbaikan.",
  },
  ARCHIVED: {
    label: "Diarsipkan",
    tone: "neutral",
    hint: "Postingan sudah diarsipkan dan tidak tampil publik.",
  },
};

const registrationStatusMeta: Record<
  ProfileRegistrationStatus,
  { label: string; tone: "success" | "info" | "neutral" }
> = {
  PENDING: { label: "Menunggu konfirmasi", tone: "info" },
  CONFIRMED: { label: "Terkonfirmasi", tone: "success" },
  CANCELLED: { label: "Dibatalkan", tone: "neutral" },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "R";
}

function categoryLabel(value: string) {
  return (
    PLACE_CATEGORIES.find((category) => category.value === value)?.label ??
    "Lainnya"
  );
}

function ProfileSkeleton() {
  return (
    <div className="container-page py-10" aria-busy="true">
      <span className="sr-only">Memuat profil…</span>
      <div className="h-24 w-full animate-pulse rounded-sheet bg-surface-muted" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <div className="h-72 w-full animate-pulse rounded-sheet bg-surface-muted" />
          <div className="h-64 w-full animate-pulse rounded-sheet bg-surface-muted" />
        </div>
        <div className="h-48 w-full animate-pulse rounded-sheet bg-surface-muted" />
      </div>
    </div>
  );
}

async function ProfileContent() {
  const profile = await requireUser("/profil");
  const overview = await getProfileOverview(profile.id);

  const confirmedVolunteer = overview.registrations.filter(
    (registration) => registration.status === "CONFIRMED",
  ).length;

  return (
    <>
      <section className="border-b border-line bg-surface-muted/40">
        <div className="container-page py-8 lg:py-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
              <li>
                <Link
                  href="/"
                  className="underline-offset-4 hover:text-ink hover:underline"
                >
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span aria-current="page" className="font-medium text-ink">
                  Profil saya
                </span>
              </li>
            </ol>
          </nav>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span
                aria-hidden="true"
                className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary-100 text-xl font-bold text-primary-800 sm:h-20 sm:w-20 sm:text-2xl"
              >
                {initials(profile.name)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700">
                  Profil pengguna
                </p>
                <h1 className="mt-1 break-words text-3xl font-bold tracking-tight text-ink">
                  {profile.name}
                </h1>
                <p className="mt-0.5 truncate text-sm text-ink-muted">
                  {profile.email}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="primary">{roleLabels[profile.role]}</Badge>
                  <Badge tone="neutral">
                    Bergabung {formatDate(profile.createdAt.toISOString())}
                  </Badge>
                </div>
              </div>
            </div>

            <ButtonLink
              href="/tambah-info"
              className="self-start sm:self-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Bagikan pengalaman
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="container-page py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="space-y-6">
            <ProfileForm
              defaultName={profile.name}
              defaultBio={profile.bio ?? ""}
            />

            <section
              id="postingan"
              aria-labelledby="postingan-heading"
              className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2
                    id="postingan-heading"
                    className="text-lg font-semibold tracking-tight text-ink"
                  >
                    Postingan saya
                  </h2>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {overview.posts.length > 0
                      ? `${overview.posts.length} tempat pernah kamu bagikan.`
                      : "Belum ada postingan yang kamu bagikan."}
                  </p>
                </div>
                <ButtonLink
                  href="/tambah-info"
                  variant="secondary"
                  size="sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Tambah info
                </ButtonLink>
              </div>

              {overview.posts.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {overview.posts.map((post) => {
                    const status = postStatusMeta[post.status];
                    const location = [post.city, post.province]
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <li key={post.id}>
                        <article className="flex gap-3 rounded-card border border-line p-3 sm:p-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-input bg-primary-50 sm:h-20 sm:w-20">
                            {post.coverPhotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={post.coverPhotoUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <PlaceMedia
                                category={post.category}
                                className="h-full w-full"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge tone={status.tone}>{status.label}</Badge>
                              <span className="text-xs text-ink-muted">
                                {categoryLabel(post.category)}
                              </span>
                            </div>

                            <h3 className="mt-1 text-base font-semibold leading-snug text-ink">
                              {post.detailHref ? (
                                <Link
                                  href={post.detailHref}
                                  className="underline-offset-4 hover:text-primary-800 hover:underline"
                                >
                                  {post.name}
                                </Link>
                              ) : (
                                post.name
                              )}
                            </h3>

                            <p className="mt-0.5 truncate text-xs text-ink-muted">
                              {location || "Lokasi di peta"} ·{" "}
                              {formatShortDate(post.createdAt)}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              {post.detailHref ? (
                                <Link
                                  href={post.detailHref}
                                  className="inline-flex items-center gap-1 font-medium text-primary-800 underline-offset-4 hover:underline"
                                >
                                  Lihat postingan
                                  <ArrowRightIcon className="h-3.5 w-3.5" />
                                </Link>
                              ) : (
                                <span className="text-ink-muted">
                                  {status.hint}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 text-ink-muted">
                                <ThumbsUpIcon className="h-3.5 w-3.5" />
                                {post.likeCount} membantu
                              </span>
                              <DeletePlaceButton
                                placeId={post.id}
                                name={post.name}
                                className="h-8 px-2 text-xs"
                              />
                            </div>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-4 rounded-card border border-dashed border-line-strong/60 px-5 py-8 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-50 text-primary-700">
                    <MapPinIcon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-ink">
                    Mulai dari tempat yang kamu kenal
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
                    Bagikan kondisi pintu masuk, jalur, atau fasilitas yang kamu
                    temui agar orang lain berangkat lebih percaya diri.
                  </p>
                  <ButtonLink href="/tambah-info" size="sm" className="mt-4">
                    Bagikan tempat pertama
                  </ButtonLink>
                </div>
              )}
            </section>

            <section
              id="volunteer"
              aria-labelledby="volunteer-heading"
              className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <div>
                <h2
                  id="volunteer-heading"
                  className="text-lg font-semibold tracking-tight text-ink"
                >
                  Volunteer yang saya ikuti
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {overview.registrations.length > 0
                    ? `${overview.registrations.length} pendaftaran tercatat.`
                    : "Belum ada kegiatan volunteer yang kamu daftarkan."}
                </p>
              </div>

              {!overview.volunteerSchemaReady ? (
                <p className="mt-4 rounded-card border border-line bg-surface-muted/60 px-4 py-3 text-sm leading-relaxed text-ink-muted">
                  Data volunteer belum tersedia di database ini. Pendaftaran akan
                  tampil otomatis setelah modul Volunteer diterapkan.
                </p>
              ) : overview.registrations.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {overview.registrations.map((registration) => {
                    const status =
                      registrationStatusMeta[registration.status];
                    const canOpen =
                      registration.event.status === "PUBLISHED" ||
                      registration.event.status === "CLOSED";

                    return (
                      <li key={registration.id}>
                        <article className="rounded-card border border-line p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={status.tone}>{status.label}</Badge>
                            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              {formatEventShortDate(
                                registration.event.startsAt,
                              )}
                            </span>
                          </div>

                          <h3 className="mt-2 text-base font-semibold leading-snug text-ink">
                            {canOpen ? (
                              <Link
                                href={`/volunteer/${registration.event.slug}`}
                                className="underline-offset-4 hover:text-primary-800 hover:underline"
                              >
                                {registration.event.title}
                              </Link>
                            ) : (
                              registration.event.title
                            )}
                          </h3>

                          <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-ink-muted">
                            <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-700" />
                            <span>
                              {registration.event.locationName},{" "}
                              {registration.event.city}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            Oleh {registration.event.organizer}
                          </p>

                          {canOpen ? (
                            <Link
                              href={`/volunteer/${registration.event.slug}`}
                              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-800 underline-offset-4 hover:underline"
                            >
                              Lihat detail kegiatan
                              <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                          ) : (
                            <p className="mt-2 text-xs text-ink-muted">
                              Kegiatan ini sudah tidak tayang di halaman
                              Volunteer.
                            </p>
                          )}
                        </article>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-4 rounded-card border border-dashed border-line-strong/60 px-5 py-8 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-50 text-primary-700">
                    <HeartHandshakeIcon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-ink">
                    Belum ikut kegiatan volunteer
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
                    Temukan kegiatan inklusif yang sesuai dengan minat dan
                    waktumu, lalu daftar langsung dari halaman kegiatan.
                  </p>
                  <ButtonLink href="/volunteer" size="sm" className="mt-4">
                    Jelajahi kegiatan
                  </ButtonLink>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <section
              aria-labelledby="ringkasan-profil"
              className="rounded-sheet border border-line bg-surface p-5 shadow-xs"
            >
              <h2
                id="ringkasan-profil"
                className="text-base font-semibold tracking-tight text-ink"
              >
                Ringkasan kontribusi
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-card bg-surface-muted/70 p-3.5">
                  <dt className="text-xs text-ink-muted">Postingan</dt>
                  <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
                    {overview.posts.length}
                  </dd>
                </div>
                <div className="rounded-card bg-surface-muted/70 p-3.5">
                  <dt className="text-xs text-ink-muted">Volunteer</dt>
                  <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
                    {overview.registrations.length}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                {confirmedVolunteer > 0
                  ? `${confirmedVolunteer} pendaftaran volunteer sudah dikonfirmasi penyelenggara.`
                  : "Konfirmasi pendaftaran volunteer akan muncul di sini setelah diperiksa penyelenggara."}
              </p>
            </section>

            <section
              aria-labelledby="akun-profil"
              className="rounded-sheet border border-line bg-surface p-5 shadow-xs"
            >
              <h2
                id="akun-profil"
                className="flex items-center gap-2 text-base font-semibold tracking-tight text-ink"
              >
                <UserIcon className="h-4 w-4 text-primary-700" />
                Detail akun
              </h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-ink-muted">Email</dt>
                  <dd className="mt-0.5 break-words font-medium text-ink">
                    {profile.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Peran</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {roleLabels[profile.role]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Bergabung sejak</dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    {formatDate(profile.createdAt.toISOString())}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-sheet border border-primary-200 bg-primary-50 p-5">
              <h2 className="text-base font-semibold tracking-tight text-primary-900">
                Butuh ruang lain?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-primary-800">
                Kamu bisa mengajukan diri sebagai penyelenggara kegiatan
                volunteer inklusif.
              </p>
              <ButtonLink
                href="/volunteer/jadi-penyelenggara"
                variant="secondary"
                size="sm"
                className="mt-4 w-full"
              >
                Jadi penyelenggara
              </ButtonLink>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
