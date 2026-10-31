"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UsersIcon } from "@/components/ui/icons";

type JoinCommunityButtonProps = {
  communityName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function JoinCommunityButton({
  communityName,
  size = "sm",
  className,
}: JoinCommunityButtonProps) {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className={className}>
      <Button
        type="button"
        size={size}
        className="w-full"
        onClick={() =>
          setNotice(
            `Tautan bergabung ke ${communityName} belum tersambung pada versi UI ini.`,
          )
        }
      >
        <UsersIcon className="h-4 w-4" />
        Bergabung
        <span className="sr-only"> dengan {communityName}</span>
      </Button>

      {notice ? (
        <p
          role="status"
          className="mt-2 rounded-input bg-surface-muted px-2.5 py-2 text-xs leading-relaxed text-ink-muted"
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}
