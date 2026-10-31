import type { ComponentProps } from "react";

function classes(base: string, className?: string) {
  return [base, className].filter(Boolean).join(" ");
}

export function Textarea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      className={classes(
        "min-h-32 w-full rounded-input border border-line-strong bg-surface px-3.5 py-3 text-base leading-relaxed text-ink shadow-xs transition-colors placeholder:text-ink-muted/70 focus:border-primary-600 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted [aria-invalid=true]:border-danger-600",
        className,
      )}
      {...props}
    />
  );
}
