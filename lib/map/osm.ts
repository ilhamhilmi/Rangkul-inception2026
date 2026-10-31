import type { Coordinate } from "@/types/map";

export function osmViewUrl({ latitude, longitude }: Coordinate, zoom = 17) {
  return `https://www.openstreetmap.org/?mlat=${latitude.toFixed(
    6,
  )}&mlon=${longitude.toFixed(6)}#map=${zoom}/${latitude}/${longitude}`;
}

export function formatCoordinate({ latitude, longitude }: Coordinate) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
