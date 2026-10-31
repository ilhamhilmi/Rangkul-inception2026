import "server-only";

import {
  PLACE_PHOTO_BUCKET,
  PLACE_PHOTO_MAX_BYTES,
  PLACE_PHOTO_MAX_COUNT,
  PLACE_PHOTO_TYPES,
} from "@/lib/constants/photos";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export {
  PLACE_PHOTO_BUCKET,
  PLACE_PHOTO_MAX_BYTES,
  PLACE_PHOTO_MAX_COUNT,
  PLACE_PHOTO_TYPES,
};

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type UploadedPlacePhoto = {
  url: string;
  path: string;
};

export type UploadPlacePhotosResult =
  | { photos: UploadedPlacePhoto[]; error?: undefined }
  | { photos: []; error: string };

/**
 * Unggah foto postingan ke Supabase Storage memakai sesi pengguna. Bucket
 * bersifat publik untuk dibaca, sedangkan unggahan dibatasi RLS hanya untuk
 * pemilik folder (`<user_id>/...`).
 */
export async function uploadPlacePhotos(
  userId: string,
  files: File[],
): Promise<UploadPlacePhotosResult> {
  if (files.length === 0) {
    return { photos: [], error: "Lampirkan minimal satu foto tempat." };
  }

  const supabase = await createSupabaseServerClient();
  const uploaded: UploadedPlacePhoto[] = [];

  for (const file of files) {
    const extension = EXTENSIONS[file.type] ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from(PLACE_PHOTO_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      await removePlacePhotos(uploaded.map((item) => item.path));
      return {
        photos: [],
        error:
          "Foto belum bisa diunggah. Periksa koneksi lalu coba kirim lagi.",
      };
    }

    const { data } = supabase.storage
      .from(PLACE_PHOTO_BUCKET)
      .getPublicUrl(path);

    uploaded.push({ url: data.publicUrl, path });
  }

  return { photos: uploaded };
}

/** Hapus foto yatim ketika penyimpanan postingan gagal. Tidak melempar error. */
export async function removePlacePhotos(paths: string[]) {
  if (paths.length === 0) return;

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.storage.from(PLACE_PHOTO_BUCKET).remove(paths);
  } catch {
    // Pembersihan bersifat best-effort; foto yatim tidak memblokir pengguna.
  }
}
