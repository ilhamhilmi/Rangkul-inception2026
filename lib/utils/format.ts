const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatShortDate(value: string) {
  return shortDateFormatter.format(new Date(value));
}

export function formatRating(value: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : (plural ?? singular);
}

export function ratingLabel(value: number) {
  if (value >= 4.5) return "Sangat baik";
  if (value >= 3.5) return "Baik";
  if (value >= 2.5) return "Cukup";
  if (value >= 1.5) return "Kurang";
  return "Perlu perbaikan";
}
