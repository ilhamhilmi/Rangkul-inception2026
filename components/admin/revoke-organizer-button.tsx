"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { revokeOrganizerAction } from "@/server/admin/actions";

export function RevokeOrganizerButton({
  profileId,
  name,
}: {
  profileId: string;
  name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function revoke() {
    setOpen(false);
    setError(null);

    startTransition(async () => {
      const result = await revokeOrganizerAction(profileId);

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
        {isPending ? "Memproses…" : "Cabut verifikasi"}
      </Button>
      {open ? (
        <ConfirmDialog
          open
          title="Cabut verifikasi penyelenggara?"
          description={`${name} akan kembali menjadi pengguna biasa dan tidak bisa lagi mengelola kegiatan sampai mengajukan verifikasi ulang.`}
          confirmLabel="Cabut verifikasi"
          danger
          onConfirm={revoke}
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
