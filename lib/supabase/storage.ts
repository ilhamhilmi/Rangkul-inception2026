import "server-only";

import { getPublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
 * URL publik untuk bucket publik. Tidak membutuhkan service role karena URL
 * dibentuk dari alamat project Supabase. Untuk verification-docs, gunakan
 * createVerificationDocumentSignedUrl() supaya akses tetap terbatas.
 */
export function getPublicStorageUrl(bucket: StorageBucket, path: string) {
  if (!isPublicBucket(bucket)) {
    throw new Error(
      `Bucket ${bucket} privat. Gunakan signed URL, bukan URL publik.`,
    );
  }

  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const encodedPath = path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

/**
 * Signed upload URL agar file diunggah langsung dari client tanpa melewati
 * batas body Server Action. Memakai sesi pengguna, bukan service role, sehingga
 * policy Storage tetap berlaku.
 */
export async function createSignedUploadUrl(
  bucket: StorageBucket,
  path: string,
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error) {
    throw new Error(`Gagal membuat signed upload URL: ${error.message}`);
  }

  return data;
}

/**
 * Signed download URL untuk dokumen verifikasi. Memakai sesi admin yang sedang
 * login agar policy `verification_docs_select_own_or_admin` dapat memverifikasi
 * role ADMIN di database.
 */
export async function createVerificationDocumentSignedUrl(
  path: string,
  expiresInSeconds = 300,
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.verificationDocs)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    throw new Error(`Gagal membuat signed URL dokumen: ${error.message}`);
  }

  return data.signedUrl;
}
