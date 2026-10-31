"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";
import type { LocationPickerProps } from "@/components/map/types";

const LeafletLocationPicker = dynamic(
  () =>
    import("@/components/map/leaflet-location-picker").then(
      (module) => module.LeafletLocationPicker,
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

export function LocationPicker({ className, ...props }: LocationPickerProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border border-line bg-surface",
        className,
      )}
    >
      <div
        role="region"
        aria-label="Peta pemilih titik lokasi. Klik peta atau geser penanda. Koordinat juga bisa diisi manual di kolom bawah."
        className="h-64 w-full sm:h-72"
      >
        <LeafletLocationPicker {...props} />
      </div>
    </div>
  );
}
