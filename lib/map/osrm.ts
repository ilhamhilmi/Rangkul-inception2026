import { mapEnv } from "@/lib/env";
import type { Coordinate, RouteStep, WalkingRoute } from "@/types/map";

type OsrmStep = {
  distance: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    exit?: number;
    /** [longitude, latitude] */
    location?: [number, number];
  };
};

type OsrmResponse = {
  code: string;
  routes?: {
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
    legs: { steps: OsrmStep[] }[];
  }[];
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 8000;

const routeCache = new Map<
  string,
  { route: WalkingRoute; expiresAt: number }
>();

function cacheKey(origin: Coordinate, destination: Coordinate) {
  return [
    origin.latitude.toFixed(5),
    origin.longitude.toFixed(5),
    destination.latitude.toFixed(5),
    destination.longitude.toFixed(5),
  ].join(":");
}

function roadName(name: string) {
  return name.trim() || "jalan tanpa nama";
}

export function describeStep(step: OsrmStep): string {
  const road = step.name.trim();
  const modifier = step.maneuver.modifier ?? "";
  const type = step.maneuver.type;

  switch (type) {
    case "depart":
      return road ? `Mulai perjalanan di ${road}.` : "Mulai perjalanan dari titik ini.";
    case "arrive":
      return "Tiba di tujuan.";
    case "turn":
      if (modifier.includes("left")) {
        return `Belok kiri ke ${roadName(road)}.`;
      }
      if (modifier.includes("right")) {
        return `Belok kanan ke ${roadName(road)}.`;
      }
      return `Belok ke ${roadName(road)}.`;
    case "new name":
      return `Lanjutkan ke ${roadName(road)}.`;
    case "continue":
      return road ? `Terus lurus di ${roadName(road)}.` : "Terus lurus.";
    case "merge":
      return `Gabung ke ${roadName(road)}.`;
    case "fork":
      if (modifier.includes("left")) return `Ambil jalur kiri ke ${roadName(road)}.`;
      if (modifier.includes("right")) return `Ambil jalur kanan ke ${roadName(road)}.`;
      return `Ikuti jalur menuju ${roadName(road)}.`;
    case "end of road":
      if (modifier.includes("left")) return `Di ujung jalan, belok kiri ke ${roadName(road)}.`;
      if (modifier.includes("right")) return `Di ujung jalan, belok kanan ke ${roadName(road)}.`;
      return `Di ujung jalan, lanjutkan ke ${roadName(road)}.`;
    case "roundabout":
    case "rotary":
      return step.maneuver.exit
        ? `Masuk bundaran dan ambil jalan keluar ke-${step.maneuver.exit}.`
        : "Masuk bundaran dan ambil jalan keluar yang sesuai.";
    case "on ramp":
      return `Masuk jalur ${roadName(road)}.`;
    case "off ramp":
      return `Keluar menuju ${roadName(road)}.`;
    default:
      return road ? `Lanjutkan melalui ${roadName(road)}.` : "Lanjutkan perjalanan.";
  }
}

function toSteps(steps: OsrmStep[]): RouteStep[] {
  return steps
    .filter((step) => step.maneuver.type !== "arrive" || step.distance === 0)
    .map((step) => ({
      instruction: describeStep(step),
      distanceMeters: Math.round(step.distance),
      maneuver: step.maneuver.type,
      location: step.maneuver.location
        ? ([step.maneuver.location[1], step.maneuver.location[0]] as [
            number,
            number,
          ])
        : undefined,
    }));
}

export async function fetchWalkingRoute({
  origin,
  destination,
  signal,
}: {
  origin: Coordinate;
  destination: Coordinate;
  signal?: AbortSignal;
}): Promise<WalkingRoute | null> {
  const key = cacheKey(origin, destination);
  const cached = routeCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.route;
  }

  const coordinates = [
    `${origin.longitude},${origin.latitude}`,
    `${destination.longitude},${destination.latitude}`,
  ].join(";");

  // Jangan memakai string path berawalan "/" pada `new URL`, karena akan
  // membuang sub-path endpoint (mis. `/routed-foot`) dan menghasilkan 404.
  const baseUrl = mapEnv.osrmUrl.replace(/\/+$/, "");
  const url = new URL(`${baseUrl}/route/v1/foot/${coordinates}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "true");
  url.searchParams.set("annotations", "false");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();

  signal?.addEventListener("abort", abortFromCaller, { once: true });

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as OsrmResponse;
    const route = data.routes?.[0];

    if (data.code !== "Ok" || !route) return null;

    const walkingRoute: WalkingRoute = {
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      geometry: route.geometry.coordinates.map(
        ([longitude, latitude]) => [latitude, longitude] as [number, number],
      ),
      steps: toSteps(route.legs[0]?.steps ?? []),
    };

    routeCache.set(key, {
      route: walkingRoute,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return walkingRoute;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

export function formatRouteDistance(meters: number) {
  if (meters < 1000) {
    return `${new Intl.NumberFormat("id-ID").format(meters)} m`;
  }

  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(meters / 1000)} km`;
}

export function formatRouteDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${new Intl.NumberFormat("id-ID").format(minutes)} menit`;
}
