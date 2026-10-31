"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { deletePlacePostAction } from "@/server/places/actions";

export function DeletePlaceButton({
  placeId,
  name,
  className,
}: {
  placeId: string;
  name: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (
      !window.confirm(
        `Hapus postingan “${name}”? Tindakan ini tidak bisa dibatalkan.`,
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deletePlacePostAction(placeId);

      if (result.ok) {
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("text-danger-700", className)}
        onClick={remove}
        disabled={isPending}
      >
        {isPending ? "Menghapus…" : "Hapus"}
      </Button>
      {error ? (
        <p role="alert" className="w-full text-xs text-danger-700">
          {error}
        </p>
      ) : null}
    </>
  );
}
