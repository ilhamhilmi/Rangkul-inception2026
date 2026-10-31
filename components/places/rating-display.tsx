import { StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { formatRating, pluralize, ratingLabel } from "@/lib/utils/format";

export function RatingDisplay({
  rating,
  reviewCount,
  className,
  showLabel = false,
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
  showLabel?: boolean;
}) {
  const rounded = Math.round(rating);

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <span aria-hidden="true" className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rounded ? "text-secondary-500" : "text-line",
            )}
          />
        ))}
      </span>
      <span className="text-sm font-semibold text-ink">
        {formatRating(rating)}
      </span>
      <span className="text-sm text-ink-muted">
        {showLabel ? ratingLabel(rating) : null}
        {reviewCount !== undefined ? (
          <>
            {showLabel ? " · " : null}
            {reviewCount} {pluralize(reviewCount, "ulasan")}
          </>
        ) : null}
      </span>
      <span className="sr-only">
        Rating aksesibilitas {formatRating(rating)} dari 5
      </span>
    </span>
  );
}
