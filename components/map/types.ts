import type { Coordinate, RouteOrigin, WalkingRoute } from "@/types/map";

export type PlaceMapProps = {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  className?: string;
};

export type PlaceMapCanvasProps = PlaceMapProps;

export type RouteDestination = Coordinate & {
  label: string;
};

export type RouteMapProps = {
  origin: RouteOrigin | null;
  destination: RouteDestination;
  route: WalkingRoute | null;
  followUser?: boolean;
  onUserInteract?: () => void;
  className?: string;
};

export type RouteMapCanvasProps = RouteMapProps;

export type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (coordinate: Coordinate) => void;
  className?: string;
};

export type LocationPickerCanvasProps = Omit<LocationPickerProps, "className">;
