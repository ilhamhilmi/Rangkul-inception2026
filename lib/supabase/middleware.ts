/**
 * Kompatibilitas: sebagian kode lama mengimpor `updateSession`. Implementasi
 * sebenarnya ada di `lib/supabase/proxy.ts` agar hanya ada satu jalur refresh
 * sesi untuk Next 16 (`proxy.ts`).
 */
export { updateSupabaseSession as updateSession } from "@/lib/supabase/proxy";
