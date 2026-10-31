import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PlaceReviewActions } from "@/components/admin/place-review-actions";
import { DeletePlaceButton } from "@/components/places/delete-place-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PLACE_CATEGORIES,
  PLACE_CATEGORY_TO_PRISMA,
} from "@/lib/constants/places";
import {
  getPlaceModerationQueue,
  getRecentPublishedPlaces,
} from "@/server/admin/queries";

export const metadata: Metadata = {
  title: "Moderasi Tempat",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function categoryLabel(value: string) {
  const category = PLACE_CATEGORIES.find(
    (item) => PLACE_CATEGORY_TO_PRISMA[item.value] === value,
  );

  return category?.label ?? value;
}

function AdminPlacesSkeleton() {
  return (
    <div className="container-page py-8 lg:py-10" aria-busy="true">
      <span className="sr-only">Memuat antrean postingan…</span>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-4 h-9 w-64" />
      <Skeleton className="mt-3 h-5 w-full max-w-2xl" />
      <div className="mt-8 space-y-5">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-card" />
        ))}
      </div>
    </div>
  );
}

async function AdminPlacesContent() {
  const [queue, published] = await Promise.all([
    getPlaceModerationQueue(),
    getRecentPublishedPlaces(),
  ]);

  return (
    <div className="container-page py-8 lg:py-10">
      <ButtonLink href="/admin" variant="ghost" size="sm" className="-ml-4">
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke ringkasan
      </ButtonLink>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-700">
            Antrean moderasi
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
            Postingan tempat
          </h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-ink-muted">
            Postingan yang ditahan moderasi otomatis belum tampil di Jelajahi.
            Setujui bila layak, tolak dengan alasan yang jelas, atau hapus
            postingan yang melanggar.
          </p>
        </div>
        <Badge tone={queue.length > 0 ? "info" : "success"}>
          {queue.length} menunggu
        </Badge>
      </div>

      {queue.length === 0 ? (
        <div className="mt-8 rounded-card border border-line bg-surface p-8 text-center shadow-xs">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-50 text-success-700">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-ink">
            Tidak ada postingan menunggu
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            Semua postingan sudah diputuskan. Postingan baru yang ditahan
            moderasi otomatis akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {queue.map((place) => (
            <article
              key={place.id}
              className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={place.status === "PENDING" ? "info" : "danger"}>
                    {place.status === "PENDING" ? "Menunggu" : "Ditolak"}
                  </Badge>
                  <Badge tone="primary">{categoryLabel(place.category)}</Badge>
                  <span className="text-xs text-ink-muted">
                    {dateFormatter.format(place.createdAt)} WIB
                  </span>
                </div>
                <DeletePlaceButton placeId={place.id} name={place.name} />
              </div>

              <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                {place.name}
              </h2>

              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4 text-primary-700" />
                  {[place.city, place.province].filter(Boolean).join(", ") ||
                    "Lokasi di peta"}
                </span>
                <span>
                  Oleh {place.createdBy?.name ?? "Kontributor Rangkul"} (
                  {place.createdBy?.email ?? "email tidak tersedia"})
                </span>
                <span>{place._count.likes} membantu</span>
              </p>

              <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                {place.description}
              </p>

              {place.moderationNote ? (
                <p className="mt-3 rounded-input border border-line bg-surface-muted/50 px-3.5 py-3 text-sm leading-relaxed text-ink">
                  <span className="font-semibold">Catatan moderasi: </span>
                  {place.moderationNote}
                </p>
              ) : null}

              <PlaceReviewActions placeId={place.id} name={place.name} />
            </article>
          ))}
        </div>
      )}

      <section className="mt-10" aria-labelledby="tayang-terbaru">
        <h2
          id="tayang-terbaru"
          className="text-lg font-semibold tracking-tight text-ink"
        >
          Postingan tayang terbaru
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Hapus postingan yang melanggar pedoman komunitas.
        </p>

        {published.length === 0 ? (
          <p className="mt-4 rounded-card border border-line bg-surface px-4 py-6 text-center text-sm text-ink-muted">
            Belum ada postingan tayang.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-surface shadow-xs">
            {published.map((place) => (
              <li
                key={place.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    <Link
                      href={`/jelajahi/${place.slug}`}
                      className="underline-offset-4 hover:text-primary-800 hover:underline"
                    >
                      {place.name}
                    </Link>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {categoryLabel(place.category)} ·{" "}
                    {[place.city, place.province].filter(Boolean).join(", ") ||
                      "Lokasi di peta"}{" "}
                    · {place.createdBy?.name ?? "Kontributor Rangkul"} ·{" "}
                    {dateFormatter.format(place.createdAt)} WIB
                  </p>
                </div>
                <DeletePlaceButton placeId={place.id} name={place.name} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AdminPlacesPage() {
  return (
    <Suspense fallback={<AdminPlacesSkeleton />}>
      <AdminPlacesContent />
    </Suspense>
  );
}
