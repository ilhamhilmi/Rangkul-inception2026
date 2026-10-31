"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteCommunityAction } from "@/server/admin/actions";

export function DeleteCommunityButton({
  communityId,
  name,
}: {
  communityId: string;
  name: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (
      !window.confirm(
        `Hapus komunitas “${name}”? Tindakan ini tidak bisa dibatalkan.`,
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteCommunityAction(communityId);

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
        className="text-danger-700"
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
