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
import { haversineMeters } from "@/lib/map/geo";
import { osmViewUrl } from "@/lib/map/osm";

const ROUTE_BLUE = "#2563eb";
const SNAP_TOLERANCE_METERS = 15;

function toLatLng([latitude, longitude]: readonly [number, number]): LatLngTuple {
  return [latitude, longitude];
}

function gapMeters(from: LatLngTuple, to: LatLngTuple) {
  return haversineMeters(
    { latitude: from[0], longitude: from[1] },
    { latitude: to[0], longitude: to[1] },
  );
}

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

  /**
   * Garis rute digambar apa adanya dari OSRM. Sebelumnya garis dipotong ke
   * "sisa rute di depan pengguna"; pemotongan itu memilih segmen terdekat di
   * seluruh rute, sehingga pada rute yang berpotongan garis bisa melompat ke
   * segmen lain (terlihat memutar) dan selalu menarik garis lurus dari posisi
   * GPS mentah ke jalan terdekat.
   *
   * OSRM men-snap ujung rute ke jalan terdekat. Sambungan ke titik asli hanya
   * digambar putus-putus bila jaraknya melebihi toleransi, supaya jelas itu
   * bukan jalan.
   */
  const { routePoints, originGap, destinationGap } = useMemo(() => {
    if (!route || route.geometry.length < 2) {
      return {
        routePoints: [] as LatLngTuple[],
        originGap: null as [LatLngTuple, LatLngTuple] | null,
        destinationGap: null as [LatLngTuple, LatLngTuple] | null,
      };
    }

    const points = route.geometry.map(toLatLng);
    const first = points[0]!;
    const last = points[points.length - 1]!;
    const originPoint: LatLngTuple | null = origin
      ? [origin.latitude, origin.longitude]
      : null;
    const destinationPoint: LatLngTuple = [
      destination.latitude,
      destination.longitude,
    ];

    return {
      routePoints: points,
      originGap:
        originPoint && gapMeters(originPoint, first) > SNAP_TOLERANCE_METERS
          ? [originPoint, first]
          : null,
      destinationGap:
        gapMeters(last, destinationPoint) > SNAP_TOLERANCE_METERS
          ? [last, destinationPoint]
          : null,
    };
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

        {routePoints.length > 1 ? (
          <>
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: "#ffffff",
                weight: 9,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={routePoints}
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

        {originGap ? (
          <Polyline
            positions={originGap}
            pathOptions={{
              color: "#64748b",
              weight: 4,
              opacity: 0.9,
              dashArray: "6 8",
              lineCap: "round",
            }}
          />
        ) : null}

        {destinationGap ? (
          <Polyline
            positions={destinationGap}
            pathOptions={{
              color: "#64748b",
              weight: 4,
              opacity: 0.9,
              dashArray: "6 8",
              lineCap: "round",
            }}
          />
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
        {routePoints.length > 1 ? "Rute ditampilkan di peta." : ""}
      </span>
    </div>
  );
}
