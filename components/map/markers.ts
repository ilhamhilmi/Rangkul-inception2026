import L from "leaflet";

export type MarkerKind = "origin" | "destination" | "entrance";

const KIND_CLASS: Record<MarkerKind, string> = {
  origin: "rangkul-map-dot rangkul-map-dot--origin",
  destination: "rangkul-map-dot rangkul-map-dot--destination",
  entrance: "rangkul-map-dot rangkul-map-dot--entrance",
};

export function createMapIcon(kind: MarkerKind) {
  return L.divIcon({
    className: "rangkul-map-marker",
    html: `<span class="${KIND_CLASS[kind]}" aria-hidden="true"></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}
