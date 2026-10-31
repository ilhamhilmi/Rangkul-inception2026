"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { RegistrationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { updateRegistrationStatusAction } from "@/lib/volunteer/actions";

type RegistrationStatusActionsProps = {
  registrationId: string;
  status: RegistrationStatus;
};

export function RegistrationStatusActions({
  registrationId,
  status,
}: RegistrationStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function update(nextStatus: "CONFIRMED" | "CANCELLED") {
    setMessage(null);
    const formData = new FormData();
    formData.set("registrationId", registrationId);
    formData.set("status", nextStatus);

    startTransition(async () => {
      const result = await updateRegistrationStatusAction(formData);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      router.refresh();
    });
  }

  if (status === "CANCELLED") {
    return <span className="text-xs text-ink-muted">—</span>;
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-wrap gap-2">
        {status === "PENDING" ? (
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => update("CONFIRMED")}
          >
            Konfirmasi
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={() => update("CANCELLED")}
        >
          Batalkan
        </Button>
      </div>
      {message ? (
        <p role="alert" className="text-xs text-danger-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
