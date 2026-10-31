export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RouteStep = {
  instruction: string;
  distanceMeters: number;
  maneuver: string;
};

export type WalkingRoute = {
  distanceMeters: number;
  durationSeconds: number;
  /** [latitude, longitude] agar langsung dipakai Leaflet. */
  geometry: [number, number][];
  steps: RouteStep[];
};

export type RouteOrigin = Coordinate & {
  label: string;
  source: "seed" | "geolocation";
};

export type MapEntrance = Coordinate & {
  id: string;
  label: string;
  isMain: boolean;
  navigationHref?: string;
};
