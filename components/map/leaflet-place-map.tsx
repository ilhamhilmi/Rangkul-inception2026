"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import { createMapIcon } from "@/components/map/markers";
import type { PlaceMapCanvasProps } from "@/components/map/types";
import { mapEnv } from "@/lib/env";
import { osmViewUrl } from "@/lib/map/osm";

function FitBounds({ points }: { points: LatLngTuple[] }) {
  const map = useMap();
  const pointsKey = points.map((point) => point.join(",")).join("|");

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 16);
      return;
    }

    map.fitBounds(points, { padding: [32, 32], maxZoom: 17 });
    // pointsKey mewakili isi points; array baru dengan isi sama tidak perlu refit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, pointsKey]);

  return null;
}

export function LeafletPlaceMap({
  slug,
  name,
  latitude,
  longitude,
  entrances,
}: PlaceMapCanvasProps) {
  const [tileErrors, setTileErrors] = useState(0);

  const points = useMemo<LatLngTuple[]>(
    () => [
      [latitude, longitude],
      ...entrances.map(
        (entrance) =>
          [entrance.latitude, entrance.longitude] as LatLngTuple,
      ),
    ],
    [entrances, latitude, longitude],
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        scrollWheelZoom={false}
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
          position={[latitude, longitude]}
          icon={createMapIcon("destination")}
          title={name}
          alt={`Lokasi ${name}`}
          keyboard
        >
          <Popup>
            <strong>{name}</strong>
            <br />
            Titik lokasi tempat.
          </Popup>
        </Marker>

        {entrances.map((entrance) => (
          <Marker
            key={entrance.id}
            position={[entrance.latitude, entrance.longitude]}
            icon={createMapIcon("entrance")}
            title={entrance.label}
            alt={`Pintu masuk ${entrance.label}`}
            keyboard
          >
            <Popup>
              <strong>{entrance.label}</strong>
              {entrance.isMain ? " · pintu utama" : ""}
              <br />
              <Link href={`/jelajahi/${slug}/navigasi?pintu=${entrance.id}`}>
                Navigasi ke pintu ini
              </Link>
            </Popup>
          </Marker>
        ))}

        <FitBounds points={points} />
      </MapContainer>

      {tileErrors >= 3 ? (
        <div className="absolute inset-x-3 bottom-3 z-[500] rounded-card border border-warning-600/40 bg-warning-50 px-3 py-2 text-xs leading-relaxed text-warning-700 shadow-card">
          Peta tidak dapat memuat gambar jalan. Informasi lokasi tetap tersedia
          di daftar pintu masuk, atau{" "}
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
