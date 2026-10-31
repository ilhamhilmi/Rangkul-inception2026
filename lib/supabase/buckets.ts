/**
 * Nama bucket Supabase Storage. File ini tidak memakai "server-only" agar
 * nama bucket yang sama dapat dipakai komponen client saat mengunggah lewat
 * signed upload URL. Kredensial tetap hanya ada di server.
 */
export const STORAGE_BUCKETS = {
  placePhotos: "place-photos",
  communityLogos: "community-logos",
  eventCovers: "event-covers",
  verificationDocs: "verification-docs",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];
