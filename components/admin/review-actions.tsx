"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FieldHint, Label } from "@/components/ui/field";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/textarea";
import {
  approveCommunityAction,
  approveOrganizerAction,
  rejectCommunityAction,
  rejectOrganizerAction,
} from "@/server/admin/actions";

export function ReviewActions({
  kind,
  id,
}: {
  kind: "community" | "organizer";
  id: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function approve() {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result =
        kind === "community"
          ? await approveCommunityAction(id)
          : await approveOrganizerAction(id);

      if (result.ok) {
        setSuccess(result.message);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (note.trim().length < 3) {
      setError("Tulis alasan penolakan minimal 3 karakter.");
      return;
    }

    startTransition(async () => {
      const result =
        kind === "community"
          ? await rejectCommunityAction(id, note)
          : await rejectOrganizerAction(id, note);

      if (result.ok) {
        setSuccess(result.message);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={approve} disabled={isPending}>
          {isPending ? "Memproses..." : "Setujui"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowReject((value) => !value)}
          disabled={isPending}
        >
          {showReject ? "Batal menolak" : "Tolak"}
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-input border border-danger-600/30 bg-danger-50 px-3.5 py-3 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}

      {success ? (
        <p
          role="status"
          className="mt-3 flex items-start gap-2 rounded-input border border-success-600/30 bg-success-50 px-3.5 py-3 text-sm text-success-700"
        >
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </p>
      ) : null}

      {showReject ? (
        <form onSubmit={reject} className="mt-4 space-y-2">
          <Label htmlFor={`reject-note-${kind}-${id}`}>
            Alasan penolakan
          </Label>
          <Textarea
            id={`reject-note-${kind}-${id}`}
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
            rows={3}
            maxLength={500}
            placeholder="Jelaskan data yang perlu diperbaiki pengaju."
            required
          />
          <FieldHint>Catatan ini disimpan pada pengajuan verifikasi.</FieldHint>
          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? "Mengirim..." : "Kirim penolakan"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
