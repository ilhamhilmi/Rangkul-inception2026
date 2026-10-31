import { AccessibilityIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

/**
 * Badge untuk postingan dengan rating pemosting 4 atau 5 bintang.
 */
export function RamahDisabilitasBadge({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-success-600/25 bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700",
        className,
      )}
    >
      <AccessibilityIcon className="h-3.5 w-3.5" aria-hidden="true" />
      Ramah Disabilitas
    </span>
  );
}
