import type { ComponentType, SVGProps } from "react";
import {
  HealthIcon,
  LandmarkIcon,
  TrainIcon,
  TreeIcon,
  UtensilsIcon,
} from "@/components/ui/icons";
import type { PlaceCategory } from "@/types/place";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type CategoryMeta = {
  icon: IconComponent;
  badge: string;
  media: string;
  iconTone: string;
};

const meta: Record<PlaceCategory, CategoryMeta> = {
  wisata: {
    icon: TreeIcon,
    badge: "border-primary-200 bg-primary-50 text-primary-800",
    media: "bg-linear-to-br from-primary-100 via-primary-50 to-secondary-100",
    iconTone: "text-primary-600",
  },
  kuliner: {
    icon: UtensilsIcon,
    badge: "border-secondary-200 bg-secondary-50 text-secondary-800",
    media: "bg-linear-to-br from-secondary-100 via-secondary-50 to-primary-100",
    iconTone: "text-secondary-600",
  },
  transportasi: {
    icon: TrainIcon,
    badge: "border-info-600/25 bg-info-50 text-info-700",
    media: "bg-linear-to-br from-info-50 via-surface to-primary-50",
    iconTone: "text-info-700",
  },
  ibadah: {
    icon: LandmarkIcon,
    badge: "border-primary-200 bg-primary-50 text-primary-800",
    media: "bg-linear-to-br from-primary-50 via-sand-100 to-secondary-50",
    iconTone: "text-primary-700",
  },
  kesehatan: {
    icon: HealthIcon,
    badge: "border-danger-600/25 bg-danger-50 text-danger-700",
    media: "bg-linear-to-br from-danger-50 via-surface to-primary-50",
    iconTone: "text-danger-700",
  },
};

export function getCategoryVisual(category: PlaceCategory) {
  return meta[category];
}

export function CategoryIcon({
  category,
  className,
}: {
  category: PlaceCategory;
  className?: string;
}) {
  const Icon = meta[category].icon;
  return <Icon className={className} />;
}
