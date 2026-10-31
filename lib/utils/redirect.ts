export function safeNextPath(
  value: FormDataEntryValue | string | string[] | null | undefined,
  fallback = "/",
) {
  const raw = Array.isArray(value) ? value[0] : value;
  const path = typeof raw === "string" ? raw : "";
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

/**
 * Redirect admin hanya boleh kembali ke area /admin. Halaman login admin tidak
 * dipakai sebagai tujuan agar tidak terjadi loop setelah sesi dibuat.
 */
export function safeAdminNextPath(
  value: FormDataEntryValue | string | string[] | null | undefined,
  fallback = "/admin",
) {
  const path = safeNextPath(value, fallback);

  if (path === "/admin") return path;
  if (path.startsWith("/admin/") && !path.startsWith("/admin/masuk")) {
    return path;
  }

  return fallback;
}
