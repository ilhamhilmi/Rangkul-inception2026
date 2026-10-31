"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";
import type { PlaceMapProps } from "@/components/map/types";

const LeafletPlaceMap = dynamic(
  () =>
    import("@/components/map/leaflet-place-map").then(
      (module) => module.LeafletPlaceMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="h-full w-full animate-pulse bg-surface-muted"
      />
    ),
  },
);

export function PlaceMap({ className, ...props }: PlaceMapProps) {
  return (
    <figure
      className={cn(
        "relative isolate z-0 overflow-hidden rounded-card border border-line bg-surface",
        className,
      )}
    >
      <div
        role="region"
        aria-label={`Peta lokasi ${props.name}. Ringkasan lokasi tersedia sebagai teks di halaman ini.`}
        className="h-64 w-full sm:h-72"
      >
        <LeafletPlaceMap {...props} />
      </div>
      <figcaption className="border-t border-line px-3 py-2 text-xs leading-relaxed text-ink-muted">
        Peta © OpenStreetMap. Pilih penanda untuk membuka navigasi.
      </figcaption>
    </figure>
  );
}
