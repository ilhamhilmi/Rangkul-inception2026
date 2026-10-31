import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKETS, type StorageBucket } from "@/lib/supabase/buckets";

export { STORAGE_BUCKETS };
export type { StorageBucket };

const PUBLIC_BUCKETS: readonly StorageBucket[] = [
  STORAGE_BUCKETS.placePhotos,
  STORAGE_BUCKETS.communityLogos,
  STORAGE_BUCKETS.eventCovers,
];

export function isPublicBucket(bucket: StorageBucket) {
  return PUBLIC_BUCKETS.includes(bucket);
}

/**
 * URL publik untuk bucket publik. Untuk verification-docs, gunakan
 * createVerificationDocumentSignedUrl() supaya akses tetap terbatas.
 */
export function getPublicStorageUrl(bucket: StorageBucket, path: string) {
  if (!isPublicBucket(bucket)) {
    throw new Error(
      `Bucket ${bucket} privat. Gunakan signed URL, bukan URL publik.`,
    );
  }

  const supabase = createSupabaseAdminClient();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Signed upload URL agar file diunggah langsung dari client tanpa melewati
 * batas body Server Action.
 */
export async function createSignedUploadUrl(
  bucket: StorageBucket,
  path: string,
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) {
    throw new Error(`Gagal membuat signed upload URL: ${error.message}`);
  }

  return data;
}

/**
 * Signed download URL untuk dokumen verifikasi. Hanya dipakai di server
 * setelah guard admin lolos.
 */
export async function createVerificationDocumentSignedUrl(
  path: string,
  expiresInSeconds = 60,
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.verificationDocs)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    throw new Error(`Gagal membuat signed URL dokumen: ${error.message}`);
  }

  return data.signedUrl;
}
