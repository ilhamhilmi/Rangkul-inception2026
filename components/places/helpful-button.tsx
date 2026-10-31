"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ThumbsUpIcon } from "@/components/ui/icons";
import { togglePlaceLikeAction } from "@/server/places/actions";
import { cn } from "@/lib/utils/cn";

type HelpfulButtonProps = {
  placeId: string;
  initialCount: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
  nextPath: string;
  size?: "sm" | "md";
  className?: string;
};

export function HelpfulButton({
  placeId,
  initialCount,
  initialLiked,
  isAuthenticated,
  nextPath,
  size = "sm",
  className,
}: HelpfulButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      router.push(`/masuk?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    const nextLiked = !liked;
    setNotice(null);
    setLiked(nextLiked);
    setCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)));

    startTransition(async () => {
      const result = await togglePlaceLikeAction(placeId);

      if (!result.ok) {
        setLiked(!nextLiked);
        setCount(initialCount);
        setNotice(result.message ?? "Belum bisa menyimpan tanda bantuan.");
        return;
      }

      setLiked(result.liked);
      setCount(result.likeCount);
    });
  }

  return (
    <div className={cn("inline-flex flex-col items-start gap-1", className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={liked}
        aria-label={
          liked
            ? "Batalkan tanda paling membantu"
            : "Tandai postingan ini paling membantu"
        }
        disabled={isPending}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-button border font-medium transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary-950 disabled:pointer-events-none disabled:opacity-70",
          size === "sm" ? "h-11 px-4 text-sm" : "h-12 px-5 text-sm",
          liked
            ? "border-primary-700 bg-primary-700 text-white hover:bg-primary-800"
            : "border-line-strong bg-surface text-ink shadow-xs hover:bg-surface-muted",
        )}
      >
        <ThumbsUpIcon
          className={cn("h-4 w-4", liked ? "fill-current" : undefined)}
        />
        <span>Membantu</span>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
            liked ? "bg-white/20 text-white" : "bg-surface-muted text-ink-muted",
          )}
        >
          {count}
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {isPending
          ? "Menyimpan tanda paling membantu…"
          : liked
            ? `${count} orang menandai paling membantu`
            : `${count} orang menandai paling membantu`}
      </span>
      {notice ? (
        <span className="text-xs text-danger-700">{notice}</span>
      ) : null}
    </div>
  );
}
