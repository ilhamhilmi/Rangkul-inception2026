"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { EventStatus } from "@prisma/client";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  cancelEventAction,
  closeEventAction,
  deleteEventAction,
  submitEventAction,
} from "@/lib/volunteer/actions";

type EventManageActionsProps = {
  eventId: string;
  status: EventStatus;
  archived: boolean;
};

type Confirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  run: () => void;
};

export function EventManageActions({
  eventId,
  status,
  archived,
}: EventManageActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  function execute(
    action: (formData: FormData) => Promise<
      | { ok: true; data: { id: string } }
      | { ok: false; message: string }
    >,
  ) {
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

  function run(
    action: (formData: FormData) => Promise<
      | { ok: true; data: { id: string } }
      | { ok: false; message: string }
    >,
    options?: Omit<Confirmation, "run">,
  ) {
    if (!options) {
      execute(action);
      return;
    }

    setConfirmation({
      ...options,
      run: () => {
        setConfirmation(null);
        execute(action);
      },
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

  if (status === "CANCELLED") {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink
            href={`/dashboard/kegiatan/${eventId}/pendaftar`}
            variant="secondary"
            size="sm"
          >
            Lihat pendaftar
          </ButtonLink>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="text-danger-700"
            onClick={() =>
              run(deleteEventAction, {
                title: "Hapus kegiatan?",
                description:
                  "Kegiatan ini akan dihapus permanen. Peserta sudah menerima notifikasi pembatalan.",
                confirmLabel: "Hapus kegiatan",
                danger: true,
              })
            }
          >
            {isPending ? "Memproses…" : "Hapus kegiatan"}
          </Button>
          {message ? (
            <p role="alert" className="w-full text-xs text-danger-700">
              {message}
            </p>
          ) : null}
        </div>
        {confirmation ? (
          <ConfirmDialog
            open
            title={confirmation.title}
            description={confirmation.description}
            confirmLabel={confirmation.confirmLabel}
            danger={confirmation.danger}
            onConfirm={confirmation.run}
            onCancel={() => setConfirmation(null)}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
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
              run(closeEventAction, {
                title: "Tutup pendaftaran?",
                description:
                  "Kegiatan tidak akan menerima peserta baru setelah pendaftaran ditutup.",
                confirmLabel: "Tutup pendaftaran",
              })
            }
          >
            Tutup pendaftaran
          </Button>
        ) : null}

        {status === "PUBLISHED" || status === "CLOSED" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="text-danger-700"
            onClick={() =>
              run(cancelEventAction, {
                title: "Batalkan kegiatan?",
                description:
                  "Semua peserta aktif akan menerima notifikasi pembatalan dan pendaftarannya ikut dibatalkan.",
                confirmLabel: "Batalkan kegiatan",
                danger: true,
              })
            }
          >
            Batalkan kegiatan
          </Button>
        ) : null}

        {message ? (
          <p role="alert" className="w-full text-xs text-danger-700">
            {message}
          </p>
        ) : null}
      </div>
      {confirmation ? (
        <ConfirmDialog
          open
          title={confirmation.title}
          description={confirmation.description}
          confirmLabel={confirmation.confirmLabel}
          danger={confirmation.danger}
          onConfirm={confirmation.run}
          onCancel={() => setConfirmation(null)}
        />
      ) : null}
    </>
  );
}
