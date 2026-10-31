import type { ComponentProps } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={[
          "h-12 w-full appearance-none rounded-input border border-line-strong bg-surface px-3.5 pr-10 text-base text-ink shadow-xs transition-colors focus:border-primary-600 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted [aria-invalid=true]:border-danger-600",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}
