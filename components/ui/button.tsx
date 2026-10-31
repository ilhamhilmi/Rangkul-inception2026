import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "inverse" | "outline-inverse";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-button font-medium transition-colors duration-150 whitespace-nowrap focus-visible:outline-[3px] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white shadow-xs hover:bg-primary-700 active:bg-primary-800 focus-visible:outline-primary-950",
  secondary:
    "border border-line-strong bg-surface text-ink shadow-xs hover:bg-surface-muted focus-visible:outline-primary-950",
  ghost:
    "text-ink hover:bg-surface-muted focus-visible:outline-primary-950",
  inverse:
    "bg-white text-primary-800 shadow-xs hover:bg-primary-50 active:bg-primary-100 focus-visible:outline-white",
  "outline-inverse":
    "border border-white/40 text-white hover:border-white/70 hover:bg-white/10 focus-visible:outline-white",
};

const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-6 text-base",
};

function classes(variant: Variant, size: Size, className?: string) {
  return [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return <button className={classes(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={classes(variant, size, className)} {...props} />;
}

type ButtonAnchorProps = ComponentProps<"a"> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonAnchor({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonAnchorProps) {
  return <a className={classes(variant, size, className)} {...props} />;
}
