export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

export function buildUniqueSlug(base: string, existing: Set<string>) {
  const normalized = slugify(base) || "komunitas";

  if (!existing.has(normalized)) return normalized;

  let counter = 2;
  while (existing.has(`${normalized}-${counter}`)) {
    counter += 1;
  }

  return `${normalized}-${counter}`;
}
