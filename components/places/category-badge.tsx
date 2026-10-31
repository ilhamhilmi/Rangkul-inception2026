import { getCategoryMeta } from "@/lib/mock/places";
import { cn } from "@/lib/utils/cn";
import type { PlaceCategory } from "@/types/place";
import { CategoryIcon, getCategoryVisual } from "./category-icon";

export function CategoryBadge({
  category,
  className,
}: {
  category: PlaceCategory;
  className?: string;
}) {
  const visual = getCategoryVisual(category);
  const label = getCategoryMeta(category).label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        visual.badge,
        className,
      )}
    >
      <CategoryIcon category={category} className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
