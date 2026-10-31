export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RouteStep = {
  instruction: string;
  distanceMeters: number;
  maneuver: string;
  /** [latitude, longitude] titik manuver bila tersedia dari OSRM. */
  location?: [number, number];
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
  source: "geolocation";
  accuracyMeters?: number;
};
