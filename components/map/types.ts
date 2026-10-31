import type {
  Coordinate,
  MapEntrance,
  RouteOrigin,
  WalkingRoute,
} from "@/types/map";

export type PlaceMapProps = {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  entrances: MapEntrance[];
  className?: string;
};

export type PlaceMapCanvasProps = PlaceMapProps;

export type RouteMapProps = {
  origin: RouteOrigin;
  destination: MapEntrance;
  entrances: MapEntrance[];
  route: WalkingRoute | null;
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
