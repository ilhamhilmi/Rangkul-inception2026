"use client";

import { useCallback, useState, type ReactNode } from "react";
import L, { type LatLngTuple } from "leaflet";
import {
  LeafletContext,
  createLeafletContext,
  type LeafletContextInterface,
} from "@react-leaflet/core";
import { cn } from "@/lib/utils/cn";

type LeafletMapShellProps = {
  center: LatLngTuple;
  zoom: number;
  className?: string;
  scrollWheelZoom?: boolean;
  children: ReactNode;
};

/**
 * Pembungkus Leaflet yang aman untuk React Strict Mode dan Fast Refresh.
 *
 * `MapContainer` bawaan react-leaflet menyimpan instance map di ref tanpa
 * mereset-nya saat cleanup. Saat Strict Mode menjalankan effect dua kali,
 * instance map lama yang sudah dihapus tetap dipakai sehingga muncul error
 * "Map container is being reused by another instance". Di sini map selalu
 * dibuat ulang bersama container-nya, lalu dibersihkan lewat ref cleanup.
 */
export function LeafletMapShell({
  center,
  zoom,
  className,
  scrollWheelZoom = false,
  children,
}: LeafletMapShellProps) {
  const [context, setContext] = useState<LeafletContextInterface | null>(null);
  // center/zoom hanya untuk tampilan awal; perubahan berikutnya diatur oleh
  // controller di dalam map (fitBounds/setView).
  const [initial] = useState(() => ({ center, zoom, scrollWheelZoom }));

  const mapRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;

      const map = L.map(node, { scrollWheelZoom: initial.scrollWheelZoom });
      map.setView(initial.center, initial.zoom);
      setContext(createLeafletContext(map));

      return () => {
        map.remove();
        setContext(null);
      };
    },
    [initial],
  );

  return (
    <div ref={mapRef} className={cn("h-full w-full", className)}>
      {context ? (
        <LeafletContext.Provider value={context}>
          {children}
        </LeafletContext.Provider>
      ) : null}
    </div>
  );
}
