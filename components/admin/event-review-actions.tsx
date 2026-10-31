"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FieldHint, Label } from "@/components/ui/field";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/textarea";
import { adminModerateEventAction } from "@/lib/volunteer/actions";

export function EventReviewActions({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function moderate(status: "PUBLISHED" | "REJECTED", reason = "") {
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set("eventId", eventId);
    formData.set("status", status);
    formData.set("note", reason);

    startTransition(async () => {
      const result = await adminModerateEventAction(formData);

      if (result.ok) {
        setSuccess(
          status === "PUBLISHED"
            ? "Kegiatan berhasil diterbitkan."
            : "Kegiatan ditolak dan catatan disimpan.",
        );
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  }

  function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (note.trim().length < 3) {
      setError("Tulis alasan penolakan minimal 3 karakter.");
      return;
    }

    moderate("REJECTED", note);
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => moderate("PUBLISHED")}
          disabled={isPending}
        >
          {isPending ? "Memproses..." : "Setujui dan terbitkan"}
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
          <Label htmlFor={`event-reject-note-${eventId}`}>
            Alasan penolakan
          </Label>
          <Textarea
            id={`event-reject-note-${eventId}`}
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
            rows={3}
            maxLength={500}
            placeholder="Jelaskan bagian kegiatan yang perlu diperbaiki penyelenggara."
            required
          />
          <FieldHint>
            Catatan ini disimpan pada kegiatan dan dapat dibaca penyelenggara.
          </FieldHint>
          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? "Mengirim..." : "Kirim penolakan"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
