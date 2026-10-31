import { MapPinIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

export function MockMap({
  label,
  className,
  caption,
}: {
  label: string;
  className?: string;
  caption?: string;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-card border border-line", className)}>
      <div
        aria-hidden="true"
        className="relative aspect-[4/3] w-full overflow-hidden bg-primary-50"
      >
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <rect width="400" height="300" fill="var(--color-primary-50)" />

          <g fill="var(--color-primary-100)">
            <rect x="18" y="24" width="96" height="64" rx="10" />
            <rect x="286" y="44" width="90" height="72" rx="10" />
            <rect x="36" y="196" width="110" height="76" rx="10" />
            <rect x="268" y="204" width="108" height="68" rx="10" />
          </g>

          <g stroke="var(--color-surface)" strokeLinecap="round" fill="none">
            <path d="M0 150h400" strokeWidth="30" />
            <path d="M190 0v300" strokeWidth="24" />
            <path d="M0 108h400" strokeWidth="8" />
            <path d="M128 0v300" strokeWidth="8" />
            <path d="M0 232h400" strokeWidth="8" />
          </g>

          <g
            stroke="var(--color-line)"
            strokeWidth="2"
            strokeDasharray="7 9"
            fill="none"
          >
            <path d="M0 150h400" />
            <path d="M190 0v300" />
          </g>

          <circle cx="196" cy="132" r="46" fill="var(--color-primary-600)" opacity="0.1" />
          <circle cx="196" cy="132" r="24" fill="var(--color-primary-600)" opacity="0.16" />
          <circle
            cx="196"
            cy="132"
            r="9"
            fill="var(--color-primary-600)"
            stroke="var(--color-surface)"
            strokeWidth="4"
          />
        </svg>

        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-primary-800 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
          Peta contoh
        </span>

        <span className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-full bg-surface/95 px-3 py-2 text-xs font-medium text-ink shadow-xs">
          <MapPinIcon className="h-4 w-4 shrink-0 text-primary-700" />
          <span className="truncate">{label}</span>
        </span>
      </div>
      <figcaption className="bg-surface px-3 py-2 text-xs text-ink-muted">
        {caption ?? "Peta ilustrasi. Arah dan jarak sebenarnya akan tersedia saat data lokasi tersambung."}
      </figcaption>
    </figure>
  );
}
