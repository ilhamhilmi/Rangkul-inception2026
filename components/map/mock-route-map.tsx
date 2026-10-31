import { MapPinIcon, NavigationIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

export function MockRouteMap({
  destination,
  entranceLabel,
  distance,
  className,
}: {
  destination: string;
  entranceLabel: string;
  distance: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-sheet border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="relative aspect-[4/3] w-full overflow-hidden bg-primary-50 sm:aspect-[16/11]"
      >
        <svg
          viewBox="0 0 640 440"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <rect width="640" height="440" fill="var(--color-primary-50)" />

          <g fill="var(--color-primary-100)">
            <rect x="24" y="30" width="150" height="96" rx="14" />
            <rect x="248" y="18" width="130" height="80" rx="14" />
            <rect x="468" y="44" width="148" height="110" rx="14" />
            <rect x="40" y="300" width="140" height="104" rx="14" />
            <rect x="250" y="318" width="120" height="86" rx="14" />
            <rect x="470" y="314" width="146" height="96" rx="14" />
          </g>

          <g fill="var(--color-secondary-100)" opacity="0.8">
            <circle cx="314" cy="152" r="34" />
            <rect x="440" y="238" width="64" height="44" rx="10" />
          </g>

          <g stroke="var(--color-surface)" strokeLinecap="round" fill="none">
            <path d="M0 220h640" strokeWidth="48" />
            <path d="M220 0v440" strokeWidth="40" />
            <path d="M430 0v440" strokeWidth="26" />
            <path d="M0 130h640" strokeWidth="14" />
            <path d="M0 360h640" strokeWidth="14" />
          </g>

          <g
            stroke="var(--color-line)"
            strokeWidth="2"
            strokeDasharray="8 10"
            fill="none"
          >
            <path d="M0 220h640" />
            <path d="M220 0v440" />
            <path d="M430 0v440" />
          </g>

          <path
            d="M96 388h124v-168h102v-92h86"
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M96 388h124v-168h102v-92h86"
            fill="none"
            stroke="var(--color-primary-600)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 20"
          />

          <circle
            cx="96"
            cy="388"
            r="16"
            fill="var(--color-surface)"
            stroke="var(--color-primary-700)"
            strokeWidth="5"
          />
          <circle cx="96" cy="388" r="6" fill="var(--color-primary-700)" />

          <circle cx="408" cy="128" r="36" fill="var(--color-primary-600)" opacity="0.12" />
          <circle cx="408" cy="128" r="22" fill="var(--color-primary-600)" opacity="0.2" />
          <circle
            cx="408"
            cy="128"
            r="10"
            fill="var(--color-primary-600)"
            stroke="var(--color-surface)"
            strokeWidth="4"
          />
        </svg>

        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-primary-800 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
          Peta contoh
        </span>

        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-surface/95 text-xs font-bold text-ink shadow-xs">
          U
        </span>

        <span className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-medium text-ink shadow-xs">
          <NavigationIcon className="h-3.5 w-3.5 text-primary-700" />
          Mulai
        </span>

        <span className="absolute bottom-3 right-3 flex max-w-[70%] items-center gap-2 rounded-full bg-surface/95 px-3 py-2 text-xs font-medium text-ink shadow-xs">
          <MapPinIcon className="h-4 w-4 shrink-0 text-primary-700" />
          <span className="truncate">{entranceLabel}</span>
        </span>

        <span className="absolute bottom-3 left-3 rounded-full bg-primary-900/90 px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
          {distance}
        </span>
      </div>

      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-xs text-ink-muted">
        <span>
          Rute contoh ke <strong className="font-semibold text-ink">{entranceLabel}</strong> di{" "}
          {destination}.
        </span>
        <span>Peta ilustrasi, bukan rute sebenarnya.</span>
      </figcaption>
    </figure>
  );
}
