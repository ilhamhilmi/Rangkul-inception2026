import Link from "next/link";

type BrandProps = {
  inverse?: boolean;
  className?: string;
  href?: string;
};

export function Brand({ inverse = false, className, href = "/" }: BrandProps) {
  return (
    <Link
      href={href}
      className={["inline-flex items-center gap-2.5 rounded-button", className]
        .filter(Boolean)
        .join(" ")}
      aria-label="Rangkul"
    >
      <span
        aria-hidden="true"
        className={[
          "grid h-10 w-10 place-items-center rounded-[0.85rem]",
          inverse
            ? "bg-white text-primary-800"
            : "bg-primary-700 text-white",
        ].join(" ")}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
        >
          <path d="M4 16.5c0-4.14 3.58-7.5 8-7.5s8 3.36 8 7.5" />
          <circle cx="7.2" cy="8.2" r="1.7" fill="currentColor" stroke="none" />
          <circle cx="16.8" cy="8.2" r="1.7" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span
        className={[
          "font-display text-xl font-bold tracking-tight",
          inverse ? "text-white" : "text-ink",
        ].join(" ")}
      >
        Rangkul
      </span>
    </Link>
  );
}
