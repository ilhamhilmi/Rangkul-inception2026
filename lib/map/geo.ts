import type { Coordinate } from "@/types/map";

const METERS_PER_DEGREE_LATITUDE = 110_574;
const METERS_PER_DEGREE_LONGITUDE = 111_320;

export type RouteLocation = {
  /** Jarak titik ke garis rute (meter). */
  distanceToRouteMeters: number;
  /** Jarak dari awal rute ke titik terdekat di rute (meter). */
  distanceAlongMeters: number;
  /** Sisa jarak menuju ujung rute, termasuk jarak kembali ke rute bila menyimpang. */
  remainingMeters: number;
  /** Indeks segmen rute terdekat. */
  segmentIndex: number;
};

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function haversineMeters(a: Coordinate, b: Coordinate) {
  const earthRadius = 6_371_000;
  const deltaLat = toRadians(b.latitude - a.latitude);
  const deltaLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.min(1, Math.sqrt(h)));
}

function segmentMetrics(
  point: Coordinate,
  from: readonly [number, number],
  to: readonly [number, number],
) {
  const referenceLatitude = ((from[0] + to[0]) / 2) * (Math.PI / 180);
  const metersPerLongitude =
    METERS_PER_DEGREE_LONGITUDE * Math.cos(referenceLatitude);

  const ax = 0;
  const ay = 0;
  const bx = (to[1] - from[1]) * metersPerLongitude;
  const by = (to[0] - from[0]) * METERS_PER_DEGREE_LATITUDE;
  const px = (point.longitude - from[1]) * metersPerLongitude;
  const py = (point.latitude - from[0]) * METERS_PER_DEGREE_LATITUDE;

  const segmentLength = Math.hypot(bx - ax, by - ay);

  if (segmentLength === 0) {
    return { distance: Math.hypot(px, py), ratio: 0, segmentLength: 0 };
  }

  const ratio = Math.max(
    0,
    Math.min(
      1,
      ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) /
        (segmentLength * segmentLength),
    ),
  );

  const nearestX = ratio * bx;
  const nearestY = ratio * by;

  return {
    distance: Math.hypot(px - nearestX, py - nearestY),
    ratio,
    segmentLength,
  };
}

/**
 * Cari posisi titik terhadap rute: jarak ke garis, jarak dari awal rute, dan
 * sisa jarak. Dipakai untuk progres navigasi live (mengikuti pergerakan).
 */
export function locateOnRoute(
  point: Coordinate,
  geometry: readonly [number, number][],
): RouteLocation | null {
  if (geometry.length === 0) return null;

  if (geometry.length === 1) {
    const [latitude, longitude] = geometry[0]!;
    return {
      distanceToRouteMeters: haversineMeters(point, { latitude, longitude }),
      distanceAlongMeters: 0,
      remainingMeters: 0,
      segmentIndex: 0,
    };
  }

  let cumulative = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestAlong = 0;
  let bestSegment = 0;

  for (let index = 0; index < geometry.length - 1; index += 1) {
    const from = geometry[index]!;
    const to = geometry[index + 1]!;
    const metrics = segmentMetrics(point, from, to);

    if (metrics.distance < bestDistance) {
      bestDistance = metrics.distance;
      bestAlong = cumulative + metrics.ratio * metrics.segmentLength;
      bestSegment = index;
    }

    cumulative += metrics.segmentLength;
  }

  return {
    distanceToRouteMeters: bestDistance,
    distanceAlongMeters: bestAlong,
    remainingMeters: Math.max(0, cumulative - bestAlong) + bestDistance,
    segmentIndex: bestSegment,
  };
}

export function distanceAlongRoute(
  point: Coordinate,
  geometry: readonly [number, number][],
) {
  return locateOnRoute(point, geometry)?.distanceAlongMeters ?? 0;
}
