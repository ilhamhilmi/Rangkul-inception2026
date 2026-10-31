import { ShieldCheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

type VerifiedBadgeProps = {
  className?: string;
  label?: string;
};

/**
 * Tanda akun penyelenggara yang sudah diverifikasi admin. Ikon tameng berisi
 * centang, dengan teks alternatif untuk pembaca layar.
 */
export function VerifiedBadge({
  className,
  label = "Penyelenggara terverifikasi",
}: VerifiedBadgeProps) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-50 text-success-700 ring-1 ring-success-600/20",
        className,
      )}
    >
      <ShieldCheckIcon className="h-3.5 w-3.5" />
    </span>
  );
}
