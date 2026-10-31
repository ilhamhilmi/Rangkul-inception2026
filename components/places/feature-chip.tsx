import type { ComponentType, SVGProps } from "react";
import {
  CheckIcon,
  DoorIcon,
  GuidingBlockIcon,
  InfoIcon,
  LiftIcon,
  ParkingIcon,
  RampIcon,
  ToiletIcon,
  XIcon,
} from "@/components/ui/icons";
import { FEATURE_MAP } from "@/lib/mock/places";
import { cn } from "@/lib/utils/cn";
import type { AccessibilityKey, FeatureStatus } from "@/types/place";

export const featureIcons: Record<
  AccessibilityKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  ramp: RampIcon,
  lift: LiftIcon,
  "accessible-toilet": ToiletIcon,
  "guiding-block": GuidingBlockIcon,
  "accessible-parking": ParkingIcon,
  "automatic-door": DoorIcon,
  "wide-entrance": DoorIcon,
};

const statusStyles: Record<
  FeatureStatus,
  { chip: string; icon: string; label: string; Icon: typeof CheckIcon }
> = {
  available: {
    chip: "border-success-600/25 bg-success-50 text-success-700",
    icon: "text-success-700",
    label: "Tersedia",
    Icon: CheckIcon,
  },
  unavailable: {
    chip: "border-danger-600/25 bg-danger-50 text-danger-700",
    icon: "text-danger-700",
    label: "Tidak tersedia",
    Icon: XIcon,
  },
  unknown: {
    chip: "border-line bg-surface-muted text-ink-muted",
    icon: "text-ink-muted",
    label: "Belum dikonfirmasi",
    Icon: InfoIcon,
  },
};

export function FeatureIcon({
  feature,
  className,
}: {
  feature: AccessibilityKey;
  className?: string;
}) {
  const Icon = featureIcons[feature];
  return <Icon className={className} />;
}

export function FeatureChip({
  feature,
  status = "available",
  className,
}: {
  feature: AccessibilityKey;
  status?: FeatureStatus;
  className?: string;
}) {
  const meta = FEATURE_MAP[feature];
  const style = statusStyles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        style.chip,
        className,
      )}
    >
      <FeatureIcon feature={feature} className="h-3.5 w-3.5" />
      <span>{meta.shortLabel}</span>
      {status !== "available" ? (
        <span className="sr-only">: {style.label}</span>
      ) : null}
    </span>
  );
}

export function FeatureStatusRow({
  feature,
  status,
}: {
  feature: AccessibilityKey;
  status: FeatureStatus;
}) {
  const meta = FEATURE_MAP[feature];
  const style = statusStyles[status];
  const StatusIcon = style.Icon;

  return (
    <li className="flex items-start gap-2.5 py-2">
      <span
        className={cn(
          "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border",
          style.chip,
        )}
      >
        <FeatureIcon feature={feature} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{meta.label}</span>
        <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
          <StatusIcon className={cn("h-3.5 w-3.5", style.icon)} />
          {style.label}
          <span className="sr-only"> — {meta.description}</span>
        </span>
      </span>
    </li>
  );
}
