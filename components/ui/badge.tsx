import type { ComponentProps } from "react";

type BadgeTone =
  | "primary"
  | "secondary"
  | "success"
  | "neutral"
  | "info"
  | "danger";

const tones: Record<BadgeTone, string> = {
  primary: "border-primary-200 bg-primary-50 text-primary-800",
  secondary: "border-secondary-200 bg-secondary-50 text-secondary-800",
  success: "border-success-600/25 bg-success-50 text-success-700",
  neutral: "border-line bg-surface-muted text-ink-muted",
  info: "border-info-600/25 bg-info-50 text-info-700",
  danger: "border-danger-600/25 bg-danger-50 text-danger-700",
};

type BadgeProps = ComponentProps<"span"> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium leading-none",
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
