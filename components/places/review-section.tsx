import { StarIcon } from "@/components/ui/icons";
import { formatDate, formatRating, pluralize } from "@/lib/utils/format";
import type { Review } from "@/types/place";

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={
            star <= Math.round(rating)
              ? "h-3.5 w-3.5 text-secondary-500"
              : "h-3.5 w-3.5 text-line"
          }
        />
      ))}
    </span>
  );
}

export function ReviewSection({
  reviews,
  rating,
  reviewCount,
  placeName,
}: {
  reviews: Review[];
  rating: number;
  reviewCount: number;
  placeName: string;
}) {
  return (
    <section aria-labelledby="ulasan-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="ulasan-heading"
            className="text-2xl font-bold tracking-tight text-ink"
          >
            Ulasan komunitas
          </h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Pengalaman pengguna lain soal aksesibilitas {placeName}.
          </p>
        </div>
        <div className="rounded-card border border-line bg-surface px-4 py-3 text-center shadow-xs">
          <p className="text-3xl font-bold text-ink">{formatRating(rating)}</p>
          <ReviewStars rating={rating} />
          <p className="mt-1 text-xs text-ink-muted">
            {reviewCount} {pluralize(reviewCount, "ulasan")}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-5 rounded-card border border-dashed border-line bg-surface-muted/50 px-4 py-5 text-sm leading-relaxed text-ink-muted">
          Belum ada ulasan untuk tempat ini. Kamu bisa membagikan pengalaman
          aksesibilitas lewat postingan baru di Jelajahi.
        </p>
      ) : null}

      <ol className="mt-5 space-y-4">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-card border border-line bg-surface p-5 shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-800"
                >
                  {review.author.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {review.author}
                  </p>
                  <p className="text-xs text-ink-muted">
                    <time dateTime={review.date}>{formatDate(review.date)}</time>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <ReviewStars rating={review.rating} />
                <span className="sr-only">
                  Rating {review.rating} dari 5
                </span>
                {review.accessibilityNote ? (
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-muted">
                    {review.accessibilityNote}
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {review.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
