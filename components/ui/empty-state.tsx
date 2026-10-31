import type { ComponentType, ReactNode, SVGProps } from "react";

type EmptyStateProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={[
        "rounded-card border border-dashed border-line-strong/60 bg-surface px-6 py-12 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-50 text-primary-700">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        {description}
      </p>
      {action ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
        </div>
      ) : null}
    </div>
  );
}
