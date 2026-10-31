"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";
import type { RouteMapProps } from "@/components/map/types";

const LeafletRouteMap = dynamic(
  () =>
    import("@/components/map/leaflet-route-map").then(
      (module) => module.LeafletRouteMap,
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

export function RouteMap({ className, ...props }: RouteMapProps) {
  return (
    <figure
      className={cn(
        "relative isolate z-0 overflow-hidden rounded-sheet border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div
        role="region"
        aria-label={`Peta rute menuju ${props.destination.label}. Ringkasan jarak dan petunjuk arah tersedia sebagai teks di halaman ini.`}
        className="h-[320px] w-full sm:h-[380px]"
      >
        <LeafletRouteMap {...props} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-4 py-3 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="rangkul-map-dot rangkul-map-dot--user"
          />
          Lokasi Anda
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="rangkul-map-dot rangkul-map-dot--destination"
          />
          Lokasi tujuan
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-1 w-5 rounded-full bg-[#2563eb]"
          />
          Rute pejalan kaki
        </span>
        <span className="w-full text-[11px] text-ink-muted">
          Peta © OpenStreetMap · rute dari OSRM
        </span>
      </div>
    </figure>
  );
}
