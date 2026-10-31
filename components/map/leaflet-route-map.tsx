"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LatLngTuple } from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { createMapIcon } from "@/components/map/markers";
import type { RouteMapCanvasProps } from "@/components/map/types";
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

    map.fitBounds(points, { padding: [36, 36], maxZoom: 17 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, pointsKey]);

  return null;
}

export function LeafletRouteMap({
  origin,
  destination,
  entrances,
  route,
}: RouteMapCanvasProps) {
  const [tileErrors, setTileErrors] = useState(0);

  const otherEntrances = entrances.filter(
    (entrance) => entrance.id !== destination.id,
  );

  const points = useMemo<LatLngTuple[]>(() => {
    if (route && route.geometry.length > 0) {
      return route.geometry;
    }

    return [
      [origin.latitude, origin.longitude],
      [destination.latitude, destination.longitude],
    ];
  }, [destination, origin, route]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[destination.latitude, destination.longitude]}
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

        {route && route.geometry.length > 1 ? (
          <Polyline
            positions={route.geometry}
            pathOptions={{
              color: "var(--color-primary-600)",
              weight: 5,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        ) : null}

        <Marker
          position={[origin.latitude, origin.longitude]}
          icon={createMapIcon("origin")}
          title={`Titik awal: ${origin.label}`}
          alt={`Titik awal perjalanan, ${origin.label}`}
          keyboard
        >
          <Popup>
            <strong>Titik awal</strong>
            <br />
            {origin.label}
            <br />
            <span className="text-xs">
              {origin.source === "geolocation"
                ? "Dari lokasi perangkat."
                : "Titik awal contoh, bukan lokasi perangkat."}
            </span>
          </Popup>
        </Marker>

        {otherEntrances.map((entrance) => (
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
              {entrance.navigationHref ? (
                <>
                  <br />
                  <Link href={entrance.navigationHref}>
                    Jadikan pintu tujuan
                  </Link>
                </>
              ) : null}
            </Popup>
          </Marker>
        ))}

        <Marker
          position={[destination.latitude, destination.longitude]}
          icon={createMapIcon("destination")}
          title={`Pintu tujuan: ${destination.label}`}
          alt={`Pintu tujuan, ${destination.label}`}
          zIndexOffset={500}
          keyboard
        >
          <Popup>
            <strong>{destination.label}</strong>
            <br />
            Pintu tujuan saat ini.
          </Popup>
        </Marker>

        <FitBounds points={points} />
      </MapContainer>

      {tileErrors >= 3 ? (
        <div className="absolute inset-x-3 bottom-3 z-[500] rounded-card border border-warning-600/40 bg-warning-50 px-3 py-2 text-xs leading-relaxed text-warning-700 shadow-card">
          Peta tidak dapat memuat gambar jalan. Petunjuk arah teks di samping
          tetap bisa dipakai, atau{" "}
          <a
            href={osmViewUrl(destination)}
            className="font-semibold underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            buka titik tujuan di OpenStreetMap
          </a>
          .
        </div>
      ) : null}
    </div>
  );
}
