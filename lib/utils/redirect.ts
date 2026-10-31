export function safeNextPath(
  value: FormDataEntryValue | string | string[] | null | undefined,
  fallback = "/",
) {
  const raw = Array.isArray(value) ? value[0] : value;
  const path = typeof raw === "string" ? raw : "";
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
