import L from "leaflet";

export type MarkerKind = "origin" | "destination" | "entrance" | "user";

const KIND_CLASS: Record<MarkerKind, string> = {
  origin: "rangkul-map-dot rangkul-map-dot--origin",
  destination: "rangkul-map-dot rangkul-map-dot--destination",
  entrance: "rangkul-map-dot rangkul-map-dot--entrance",
  user: "rangkul-map-dot rangkul-map-dot--user",
};

export function createMapIcon(kind: MarkerKind) {
  const dot = `<span class="${KIND_CLASS[kind]}" aria-hidden="true"></span>`;
  const html =
    kind === "user"
      ? `<span class="rangkul-map-user"><span class="rangkul-map-user__pulse" aria-hidden="true"></span>${dot}</span>`
      : dot;

  return L.divIcon({
    className: "rangkul-map-marker",
    html,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}
