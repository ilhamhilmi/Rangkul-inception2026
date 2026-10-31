"use client";

import { useEffect, useMemo, useState } from "react";
import type { LatLngTuple } from "leaflet";
import {
  Circle,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { LeafletMapShell } from "@/components/map/leaflet-map-shell";
import { createMapIcon } from "@/components/map/markers";
import type { RouteMapCanvasProps } from "@/components/map/types";
import { mapEnv } from "@/lib/env";
import { osmViewUrl } from "@/lib/map/osm";

const ROUTE_BLUE = "#2563eb";

function MapController({
  origin,
  destination,
  route,
  followUser,
}: {
  origin: RouteMapCanvasProps["origin"];
  destination: RouteMapCanvasProps["destination"];
  route: RouteMapCanvasProps["route"];
  followUser: boolean;
}) {
  const map = useMap();
  const routeKey = route
    ? [
        route.geometry.length,
        route.distanceMeters,
        route.geometry[0]?.join(",") ?? "",
        route.geometry[route.geometry.length - 1]?.join(",") ?? "",
      ].join(":")
    : "no-route";
  const originLatitude = origin?.latitude;
  const originLongitude = origin?.longitude;

  // Tampilkan gambaran rute saat rute pertama kali tersedia/diperbarui.
  useEffect(() => {
    const points: LatLngTuple[] =
      route && route.geometry.length > 1
        ? route.geometry
        : origin
          ? [
              [origin.latitude, origin.longitude],
              [destination.latitude, destination.longitude],
            ]
          : [[destination.latitude, destination.longitude]];

    if (points.length === 1) {
      map.setView(points[0]!, 16);
      return;
    }

    map.fitBounds(points, { padding: [36, 36], maxZoom: 17 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, routeKey]);

  // Ikuti pergerakan pengguna saat mode live aktif.
  useEffect(() => {
    if (!followUser || originLatitude === undefined || originLongitude === undefined) {
      return;
    }

    map.setView(
      [originLatitude, originLongitude],
      Math.max(map.getZoom(), 16),
      { animate: true },
    );
  }, [followUser, map, originLatitude, originLongitude]);

  return null;
}

function MapInteractionHandler({
  onUserInteract,
}: {
  onUserInteract?: () => void;
}) {
  useMapEvents({
    dragstart: () => onUserInteract?.(),
  });

  return null;
}

export function LeafletRouteMap({
  origin,
  destination,
  route,
  followUser = false,
  onUserInteract,
}: RouteMapCanvasProps) {
  const [tileErrors, setTileErrors] = useState(0);

  const points = useMemo<LatLngTuple[]>(() => {
    if (route && route.geometry.length > 0) {
      return route.geometry;
    }

    if (origin) {
      return [
        [origin.latitude, origin.longitude],
        [destination.latitude, destination.longitude],
      ];
    }

    return [[destination.latitude, destination.longitude]];
  }, [destination, origin, route]);

  return (
    <div className="relative h-full w-full">
      <LeafletMapShell
        center={[destination.latitude, destination.longitude]}
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

        {route && route.geometry.length > 1 ? (
          <>
            <Polyline
              positions={route.geometry}
              pathOptions={{
                color: "#ffffff",
                weight: 9,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={route.geometry}
              pathOptions={{
                color: ROUTE_BLUE,
                weight: 5,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        ) : null}

        {origin && origin.accuracyMeters && origin.accuracyMeters < 200 ? (
          <Circle
            center={[origin.latitude, origin.longitude]}
            radius={origin.accuracyMeters}
            pathOptions={{
              color: ROUTE_BLUE,
              weight: 1,
              opacity: 0.35,
              fillColor: ROUTE_BLUE,
              fillOpacity: 0.08,
            }}
          />
        ) : null}

        {origin ? (
          <Marker
            position={[origin.latitude, origin.longitude]}
            icon={createMapIcon("user")}
            title="Lokasi Anda"
            alt="Lokasi perangkat saat ini"
            zIndexOffset={700}
            keyboard
          >
            <Popup>
              <strong>Lokasi Anda</strong>
              <br />
              Titik awal navigasi diambil dari GPS perangkat.
            </Popup>
          </Marker>
        ) : null}

        <Marker
          position={[destination.latitude, destination.longitude]}
          icon={createMapIcon("destination")}
          title={`Lokasi tujuan: ${destination.label}`}
          alt={`Lokasi tujuan, ${destination.label}`}
          zIndexOffset={500}
          keyboard
        >
          <Popup>
            <strong>{destination.label}</strong>
            <br />
            Lokasi tujuan.
          </Popup>
        </Marker>

        <MapInteractionHandler onUserInteract={onUserInteract} />

        <MapController
          origin={origin}
          destination={destination}
          route={route}
          followUser={followUser}
        />
      </LeafletMapShell>

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

      <span className="sr-only" aria-live="polite">
        {points.length > 1 ? "Rute pejalan kaki ditampilkan di peta." : ""}
      </span>
    </div>
  );
}
