import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { StorageBucket } from "@/lib/supabase/buckets";

/**
 * Mengunggah file langsung ke Supabase Storage memakai signed upload URL yang
 * dibuat Server Action. File tidak pernah melewati body Server Action.
 */
export async function uploadToSignedPath(input: {
  bucket: StorageBucket;
  path: string;
  token: string;
  file: File;
}) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage
    .from(input.bucket)
    .uploadToSignedUrl(input.path, input.token, input.file, {
      contentType: input.file.type,
    });

  if (error) {
    throw new Error(error.message);
  }
}
