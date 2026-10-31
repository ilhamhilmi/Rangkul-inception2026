"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type {
  LeafletEvent,
  LeafletMouseEvent,
  Marker as LeafletMarker,
} from "leaflet";
import { createMapIcon } from "@/components/map/markers";
import type { LocationPickerCanvasProps } from "@/components/map/types";
import { mapEnv } from "@/lib/env";

const INDONESIA_CENTER: [number, number] = [-2.5, 118];
const DETAIL_ZOOM = 16;

function positionOf({
  latitude,
  longitude,
}: Pick<LocationPickerCanvasProps, "latitude" | "longitude">): [
  number,
  number,
] | null {
  if (
    latitude === null ||
    longitude === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return [latitude, longitude];
}

function ClickHandler({
  onChange,
}: {
  onChange: LocationPickerCanvasProps["onChange"];
}) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function Recenter({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const positionKey = position ? position.join(",") : "";

  useEffect(() => {
    if (!position) return;

    const alreadyVisible =
      map.getZoom() >= 15 && map.getBounds().contains(position);

    if (!alreadyVisible) {
      map.flyTo(position, DETAIL_ZOOM, { duration: 0.6 });
    }
    // positionKey mewakili isi position; array baru dengan isi sama tidak perlu refit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, positionKey]);

  return null;
}

export function LeafletLocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerCanvasProps) {
  const [tileErrors, setTileErrors] = useState(0);
  const position = positionOf({ latitude, longitude });
  const center = position ?? INDONESIA_CENTER;

  function handleDragEnd(event: LeafletEvent) {
    const point = (event.target as LeafletMarker).getLatLng();
    onChange({ latitude: point.lat, longitude: point.lng });
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={position ? DETAIL_ZOOM : 5}
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

        {position ? (
          <Marker
            position={position}
            icon={createMapIcon("destination")}
            draggable
            title="Titik lokasi tempat"
            alt="Penanda titik lokasi tempat. Geser untuk menyesuaikan."
            keyboard
            eventHandlers={{ dragend: handleDragEnd }}
          />
        ) : null}

        <ClickHandler onChange={onChange} />
        <Recenter position={position} />
      </MapContainer>

      {!position ? (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] rounded-card bg-surface/95 px-3 py-2 text-xs leading-relaxed text-ink-muted shadow-card">
          Klik peta untuk menaruh titik lokasi tempat.
        </div>
      ) : null}

      {tileErrors >= 3 ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] rounded-card border border-warning-600/40 bg-warning-50 px-3 py-2 text-xs leading-relaxed text-warning-700 shadow-card">
          Gambar peta tidak dapat dimuat. Titik tetap bisa diisi lewat kolom
          koordinat di bawah.
        </div>
      ) : null}
    </div>
  );
}
