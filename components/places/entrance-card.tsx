import { ButtonLink } from "@/components/ui/button";
import {
  ClockIcon,
  DoorIcon,
  NavigationIcon,
  WalkIcon,
} from "@/components/ui/icons";
import { ACCESSIBILITY_FEATURES } from "@/lib/mock/places";
import type { Entrance } from "@/types/place";
import { FeatureStatusRow } from "./feature-chip";

export function EntranceCard({
  entrance,
  placeSlug,
}: {
  entrance: Entrance;
  placeSlug: string;
}) {
  const availableCount = ACCESSIBILITY_FEATURES.filter(
    (feature) => entrance.features[feature.key] === "available",
  ).length;

  return (
    <li className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-ink">{entrance.label}</h3>
            {entrance.isMain ? (
              <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">
                Pintu utama
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            {entrance.notes}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
          <DoorIcon className="h-3.5 w-3.5" />
          {availableCount} dari {ACCESSIBILITY_FEATURES.length} fasilitas
        </span>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-y border-line py-3 text-sm">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Jarak dari titik awal rute contoh</dt>
          <dd className="flex items-center gap-1.5 text-ink-muted">
            <WalkIcon className="h-4 w-4 text-primary-700" />
            <span className="font-medium text-ink">{entrance.route.distance}</span>
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Estimasi waktu</dt>
          <dd className="flex items-center gap-1.5 text-ink-muted">
            <ClockIcon className="h-4 w-4 text-primary-700" />
            <span className="font-medium text-ink">{entrance.route.duration}</span>
          </dd>
        </div>
      </dl>

      <ul className="mt-2 grid gap-x-6 sm:grid-cols-2">
        {ACCESSIBILITY_FEATURES.map((feature) => (
          <FeatureStatusRow
            key={feature.key}
            feature={feature.key}
            status={entrance.features[feature.key]}
          />
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink-muted">
          {entrance.route.condition}
        </p>
        <ButtonLink
          href={`/jelajahi/${placeSlug}/navigasi?pintu=${entrance.id}`}
          size="sm"
          className="shrink-0"
        >
          <NavigationIcon className="h-4 w-4" />
          Navigasi ke pintu ini
        </ButtonLink>
      </div>
    </li>
  );
}
