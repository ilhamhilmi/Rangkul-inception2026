"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  PLACE_PHOTO_MAX_BYTES,
  PLACE_PHOTO_MAX_COUNT,
  PLACE_PHOTO_TYPES,
} from "@/lib/constants/photos";
import { preparePhoto } from "@/lib/utils/image";
import { CameraIcon, TrashIcon, UploadIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

const PHOTO_TYPES: readonly string[] = PLACE_PHOTO_TYPES;

export function PhotoInput({
  files,
  onChange,
  error,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const preview of previews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [previews]);

  const remaining = PLACE_PHOTO_MAX_COUNT - files.length;
  const shownError = localError ?? error;

  async function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selected.length === 0) return;

    setLocalError(null);

    const room = PLACE_PHOTO_MAX_COUNT - files.length;

    if (room <= 0) {
      setLocalError(
        `Maksimal ${PLACE_PHOTO_MAX_COUNT} foto per postingan. Hapus salah satu untuk menambah.`,
      );
      return;
    }

    const accepted: File[] = [];

    for (const file of selected.slice(0, room)) {
      if (!PHOTO_TYPES.includes(file.type)) {
        setLocalError("Format foto harus JPG, PNG, atau WebP.");
        continue;
      }

      if (file.size > PLACE_PHOTO_MAX_BYTES) {
        setLocalError("Ukuran setiap foto maksimal 5 MB sebelum dikompres.");
        continue;
      }

      accepted.push(file);
    }

    if (selected.length > room) {
      setLocalError(
        `Hanya ${room} foto lagi yang bisa ditambahkan (maksimal ${PLACE_PHOTO_MAX_COUNT}).`,
      );
    }

    if (accepted.length === 0) return;

    setProcessing(true);
    const prepared = await Promise.all(accepted.map((file) => preparePhoto(file)));
    setProcessing(false);

    onChange([...files, ...prepared]);
  }

  function removeAt(index: number) {
    setLocalError(null);
    onChange(files.filter((_, position) => position !== index));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id="field-photos"
        name="photos-input"
        type="file"
        accept={PHOTO_TYPES.join(",")}
        multiple
        className="sr-only"
        onChange={handleSelect}
        aria-describedby={shownError ? "error-photos" : "hint-photos"}
      />

      <div
        className={cn(
          "rounded-card border border-dashed p-4",
          shownError ? "border-danger-600/50 bg-danger-50/40" : "border-line-strong/60 bg-surface-muted/30",
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700"
            >
              <CameraIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                Foto tempat <span className="text-danger-700">*</span>
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                Wajib minimal 1 foto, maksimal {PLACE_PHOTO_MAX_COUNT}. Format
                JPG, PNG, atau WebP. Foto diperkecil otomatis sebelum dikirim.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={processing || remaining <= 0}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-button border border-line-strong bg-surface px-4 text-sm font-medium text-ink shadow-xs transition-colors hover:bg-surface-muted focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary-950 disabled:pointer-events-none disabled:opacity-50"
          >
            <UploadIcon className="h-4 w-4" />
            {processing
              ? "Menyiapkan foto…"
              : remaining <= 0
                ? "Batas foto tercapai"
                : "Pilih foto"}
          </button>
        </div>

        <p className="mt-3 text-xs text-ink-muted">
          {files.length} dari {PLACE_PHOTO_MAX_COUNT} foto dipilih.
        </p>

        {previews.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {previews.map((preview, index) => (
              <li
                key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
                className="group relative overflow-hidden rounded-card border border-line bg-surface"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={`Pratinjau foto ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
                {index === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Sampul
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-ink/75 text-white transition-colors hover:bg-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary-950"
                  aria-label={`Hapus foto ${index + 1}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {shownError ? (
        <p id="error-photos" role="alert" className="text-sm text-danger-700">
          {shownError}
        </p>
      ) : (
        <p id="hint-photos" className="text-xs text-ink-muted">
          Foto pertama dipakai sebagai sampul di timeline Jelajahi.
        </p>
      )}
    </div>
  );
}
