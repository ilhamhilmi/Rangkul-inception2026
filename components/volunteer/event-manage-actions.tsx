"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { EventStatus } from "@prisma/client";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  archiveEventAction,
  closeEventAction,
  submitEventAction,
} from "@/lib/volunteer/actions";

type EventManageActionsProps = {
  eventId: string;
  status: EventStatus;
  archived: boolean;
};

export function EventManageActions({
  eventId,
  status,
  archived,
}: EventManageActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function run(
    action: (formData: FormData) => Promise<
      | { ok: true; data: { id: string } }
      | { ok: false; message: string }
    >,
    confirmText?: string,
  ) {
    if (confirmText && !window.confirm(confirmText)) return;

    setMessage(null);
    const formData = new FormData();
    formData.set("eventId", eventId);

    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      router.refresh();
    });
  }

  if (archived) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <ButtonLink
          href={`/dashboard/kegiatan/${eventId}/pendaftar`}
          variant="secondary"
          size="sm"
        >
          Lihat pendaftar
        </ButtonLink>
        <p className="text-xs font-medium text-ink-muted">
          Kegiatan diarsipkan dan tidak dapat diubah.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ButtonLink
        href={`/dashboard/kegiatan/${eventId}/edit`}
        variant="secondary"
        size="sm"
      >
        Edit
      </ButtonLink>
      <ButtonLink
        href={`/dashboard/kegiatan/${eventId}/pendaftar`}
        variant="ghost"
        size="sm"
      >
        Pendaftar
      </ButtonLink>

      {status === "DRAFT" || status === "REJECTED" ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={() => run(submitEventAction)}
        >
          {isPending ? "Memproses…" : "Ajukan terbit"}
        </Button>
      ) : null}

      {status === "PUBLISHED" ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={() =>
            run(
              closeEventAction,
              "Tutup pendaftaran kegiatan ini? Kegiatan tidak akan menerima peserta baru.",
            )
          }
        >
          Tutup pendaftaran
        </Button>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() =>
          run(
            archiveEventAction,
            "Arsipkan kegiatan ini? Kegiatan akan hilang dari halaman publik.",
          )
        }
      >
        Arsipkan
      </Button>

      {message ? (
        <p role="alert" className="w-full text-xs text-danger-700">
          {message}
        </p>
      ) : null}
    </div>
  );
}
