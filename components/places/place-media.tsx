import { cn } from "@/lib/utils/cn";
import type { PlaceCategory } from "@/types/place";
import { CategoryIcon, getCategoryVisual } from "./category-icon";

export function PlaceMedia({
  category,
  className,
  compact = false,
}: {
  category: PlaceCategory;
  className?: string;
  compact?: boolean;
}) {
  const visual = getCategoryVisual(category);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate overflow-hidden",
        visual.media,
        className,
      )}
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          className={cn("opacity-25", visual.iconTone)}
        >
          <path d="M-20 220C70 200 110 150 190 160s150 80 240 40" strokeWidth="26" />
          <path d="M60 -20c20 70 60 110 40 340" strokeWidth="16" />
          <path d="M310 -20c-20 80 50 120 30 340" strokeWidth="12" />
          <path d="M0 80h400M0 250h400" strokeWidth="2" strokeDasharray="8 10" />
        </g>
        <g className={cn("opacity-15", visual.iconTone)}>
          <circle cx="300" cy="96" r="46" fill="currentColor" />
          <circle cx="300" cy="96" r="18" fill="currentColor" opacity="0.6" />
          <rect x="40" y="40" width="70" height="36" rx="8" fill="currentColor" />
          <rect x="230" y="230" width="90" height="30" rx="8" fill="currentColor" />
        </g>
      </svg>

      <span
        className={cn(
          "absolute grid place-items-center rounded-full bg-surface/80 text-ink shadow-xs backdrop-blur-sm",
          compact ? "right-2.5 bottom-2.5 h-8 w-8" : "right-4 bottom-4 h-12 w-12",
        )}
      >
        <CategoryIcon
          category={category}
          className={cn(compact ? "h-4 w-4" : "h-6 w-6", visual.iconTone)}
        />
      </span>
    </div>
  );
}
