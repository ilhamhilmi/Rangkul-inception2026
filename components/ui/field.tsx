import type { ComponentProps } from "react";

function classes(base: string, className?: string) {
  return [base, className].filter(Boolean).join(" ");
}

export function Label({
  className,
  ...props
}: ComponentProps<"label">) {
  return (
    <label
      className={classes("block text-sm font-medium text-ink", className)}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      className={classes(
        "h-12 w-full rounded-input border border-line-strong bg-surface px-3.5 text-base text-ink shadow-xs transition-colors placeholder:text-ink-muted/70 focus:border-primary-600 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted [aria-invalid=true]:border-danger-600",
        className,
      )}
      {...props}
    />
  );
}

export function FieldHint({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={classes("text-sm leading-5 text-ink-muted", className)}
      {...props}
    />
  );
}

export function FieldError({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      role="alert"
      className={classes("text-sm font-medium leading-5 text-danger-700", className)}
      {...props}
    />
  );
}
