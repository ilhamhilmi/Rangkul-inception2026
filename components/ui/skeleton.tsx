import type { ComponentProps } from "react";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={["animate-pulse rounded-input bg-surface-muted", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
