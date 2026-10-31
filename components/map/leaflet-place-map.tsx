"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import { LeafletMapShell } from "@/components/map/leaflet-map-shell";
import { createMapIcon } from "@/components/map/markers";
import type { PlaceMapCanvasProps } from "@/components/map/types";
import { mapEnv } from "@/lib/env";
import { osmViewUrl } from "@/lib/map/osm";

function FocusLocation({ position }: { position: LatLngTuple }) {
  const map = useMap();
  const positionKey = position.join(",");

  useEffect(() => {
    map.setView(position, 16);
    // positionKey mewakili isi position; array baru dengan isi sama tidak perlu refit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, positionKey]);

  return null;
}

export function LeafletPlaceMap({
  slug,
  name,
  latitude,
  longitude,
}: PlaceMapCanvasProps) {
  const [tileErrors, setTileErrors] = useState(0);
  const position: LatLngTuple = [latitude, longitude];

  return (
    <div className="relative h-full w-full">
      <LeafletMapShell
        center={position}
        zoom={16}
        className="h-full w-full"
      >
        <TileLayer
          url={mapEnv.tileUrl}
          attribution={mapEnv.attribution}
          eventHandlers={{
            tileerror: () => setTileErrors((count) => count + 1),
          }}
        />

        <Marker
          position={position}
          icon={createMapIcon("destination")}
          title={name}
          alt={`Lokasi ${name}`}
          keyboard
        >
          <Popup>
            <strong>{name}</strong>
            <br />
            <Link href={`/jelajahi/${slug}/navigasi`}>Buka navigasi</Link>
          </Popup>
        </Marker>

        <FocusLocation position={position} />
      </LeafletMapShell>

      {tileErrors >= 3 ? (
        <div className="absolute inset-x-3 bottom-3 z-[500] rounded-card border border-warning-600/40 bg-warning-50 px-3 py-2 text-xs leading-relaxed text-warning-700 shadow-card">
          Peta tidak dapat memuat gambar jalan. Koordinat lokasi tetap tersedia
          di halaman ini, atau{" "}
          <a
            href={osmViewUrl({ latitude, longitude })}
            className="font-semibold underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            buka lokasi di OpenStreetMap
          </a>
          .
        </div>
      ) : null}
    </div>
  );
}
