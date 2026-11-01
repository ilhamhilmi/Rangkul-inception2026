"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteVolunteerEventAction } from "@/server/admin/actions";

export function DeleteVolunteerEventButton({
  eventId,
  title,
}: {
  eventId: string;
  title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    setOpen(false);
    setError(null);

    startTransition(async () => {
      const result = await deleteVolunteerEventAction(eventId);

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
        disabled={isPending}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        {isPending ? "Menghapus…" : "Hapus"}
      </Button>
      {open ? (
        <ConfirmDialog
          open
          title="Hapus kegiatan volunteer?"
          description={`Kegiatan “${title}” akan dihapus permanen. Pendaftaran peserta ikut terhapus dan tidak bisa dikembalikan.`}
          confirmLabel="Hapus kegiatan"
          danger
          onConfirm={remove}
          onCancel={() => setOpen(false)}
        />
      ) : null}
      {error ? (
        <p role="alert" className="w-full text-xs text-danger-700">
          {error}
        </p>
      ) : null}
    </>
  );
}
