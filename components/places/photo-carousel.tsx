"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CameraIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import type { PlaceCategory, PlacePhotoItem } from "@/types/place";
import { PlaceMedia } from "./place-media";

export function PhotoCarousel({
  photos,
  name,
  category,
  frameClassName = "aspect-[16/10] sm:aspect-[16/9]",
}: {
  photos: PlacePhotoItem[];
  name: string;
  category: PlaceCategory;
  frameClassName?: string;
}) {
  const [index, setIndex] = useState(0);
  const total = photos.length;
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const photo = photos[safeIndex];

  const go = useCallback(
    (delta: number) => {
      if (total < 2) return;
      setIndex((current) => (current + delta + total) % total);
    },
    [total],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  }

  if (!photo) {
    return (
      <figure className="min-w-0 max-w-full">
        <PlaceMedia
          category={category}
          className={cn(
            "w-full rounded-sheet border border-line",
            frameClassName,
          )}
        />
        <figcaption className="mt-2.5 flex items-start gap-1.5 text-xs text-ink-muted">
          <CameraIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Postingan ini belum memiliki foto.
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="min-w-0 max-w-full">
      <div
        role={total > 1 ? "group" : undefined}
        aria-roledescription={total > 1 ? "carousel" : undefined}
        aria-label={total > 1 ? `Foto ${name}` : undefined}
        tabIndex={total > 1 ? 0 : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative isolate w-full overflow-hidden rounded-sheet border border-line bg-surface-muted",
          frameClassName,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.alt || `Foto ${safeIndex + 1} untuk ${name}`}
          className="h-full w-full object-cover"
          loading={safeIndex === 0 ? "eager" : "lazy"}
        />

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto sebelumnya"
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-ink/55 text-white backdrop-blur-sm transition-colors hover:bg-ink/75 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Foto berikutnya"
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-ink/55 text-white backdrop-blur-sm transition-colors hover:bg-ink/75 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
            <span
              aria-live="polite"
              className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold tabular-nums text-white"
            >
              {safeIndex + 1} / {total}
            </span>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <ul
          aria-label="Pilih foto"
          className="mt-2.5 flex gap-2 overflow-x-auto pb-1"
        >
          {photos.map((item, position) => {
            const active = position === safeIndex;

            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-label={`Tampilkan foto ${position + 1}`}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "relative block h-16 w-24 overflow-hidden rounded-card border-2 transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary-950",
                    active
                      ? "border-primary-700"
                      : "border-transparent hover:border-primary-300",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <figcaption className="mt-2.5 flex items-start gap-1.5 text-xs text-ink-muted">
        <CameraIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {total > 1
          ? `${total} foto dari kontributor. Gunakan tombol panah atau pilih thumbnail untuk melihat foto lain.`
          : "Foto dari kontributor."}
      </figcaption>
    </figure>
  );
}
