import type { Community } from "@/types/community";

const variants = [
  {
    surface: "bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-100",
    line: "text-primary-200",
    shape: "bg-secondary-100/70",
    mark: "bg-primary-700 text-white",
  },
  {
    surface: "bg-gradient-to-br from-secondary-100 via-secondary-50 to-primary-100",
    line: "text-secondary-300",
    shape: "bg-primary-100/80",
    mark: "bg-secondary-500 text-secondary-950",
  },
  {
    surface: "bg-gradient-to-br from-primary-200 via-primary-100 to-sand-100",
    line: "text-primary-300",
    shape: "bg-primary-50/90",
    mark: "bg-primary-900 text-white",
  },
  {
    surface: "bg-gradient-to-br from-sand-100 via-primary-50 to-primary-100",
    line: "text-secondary-300",
    shape: "bg-secondary-100/60",
    mark: "bg-primary-100 text-primary-900",
  },
];

function hash(value: string) {
  return value
    .split("")
    .reduce((total, character) => (total + character.charCodeAt(0)) % 997, 0);
}

function getInitials(name: string) {
  return name
    .replace(/[^A-Za-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function getVariant(slug: string) {
  return variants[hash(slug) % variants.length];
}

type CommunityMarkProps = {
  community: Community;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const markSizes = {
  sm: "h-12 w-12 rounded-button text-base",
  md: "h-20 w-20 rounded-card text-2xl",
  lg: "h-24 w-24 rounded-sheet text-3xl",
};

export function CommunityMark({
  community,
  size = "md",
  className,
}: CommunityMarkProps) {
  const variant = getVariant(community.slug);

  return (
    <span
      aria-hidden="true"
      className={[
        "grid shrink-0 place-items-center border-2 border-surface font-display font-bold tracking-tight shadow-card",
        markSizes[size],
        variant.mark,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {getInitials(community.name)}
    </span>
  );
}

type CommunityCoverProps = {
  community: Community;
  showMark?: boolean;
  className?: string;
};

export function CommunityCover({
  community,
  showMark = true,
  className,
}: CommunityCoverProps) {
  const variant = getVariant(community.slug);

  return (
    <div
      aria-hidden="true"
      className={[
        "relative overflow-hidden",
        variant.surface,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        viewBox="0 0 480 200"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M-20 168C70 150 118 96 218 104s158 66 286 36"
          stroke="currentColor"
          strokeWidth="20"
          strokeLinecap="round"
          className={variant.line}
        />
        <path
          d="M40 -30c26 70 20 130 4 250"
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          className={variant.line}
        />
        <path
          d="M330 -30c-22 76 58 118 36 250"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className={variant.line}
        />
        <circle
          cx="392"
          cy="46"
          r="58"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 7"
          className={variant.line}
        />
      </svg>

      <span
        className={[
          "pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full blur-2xl",
          variant.shape,
        ].join(" ")}
      />
      <span
        className={[
          "pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full blur-2xl",
          variant.shape,
        ].join(" ")}
      />

      {showMark ? (
        <span className="absolute inset-0 grid place-items-center">
          <CommunityMark community={community} size="md" />
        </span>
      ) : null}
    </div>
  );
}
