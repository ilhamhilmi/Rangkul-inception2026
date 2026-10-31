/** Batas bersama antara form (client) dan server action (server). */
export const PLACE_PHOTO_BUCKET = "place-photos";
export const PLACE_PHOTO_MAX_COUNT = 4;
export const PLACE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PLACE_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
