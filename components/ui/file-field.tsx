"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { FieldError, FieldHint, Label } from "@/components/ui/field";
import { CloseIcon, UploadIcon } from "@/components/ui/icons";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type FileFieldProps = {
  id: string;
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  imageClassName?: string;
  error?: string;
  onFileChange?: (file: File | null) => void;
};

export function FileField({
  id,
  name,
  label,
  hint,
  required,
  imageClassName = "h-40",
  error,
  onFileChange,
}: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const shownError = localError ?? error;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = shownError ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setLocalError(null);
    setFileName(null);
    setPreviewUrl(null);

    if (!file) {
      onFileChange?.(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError("Format harus JPEG, PNG, atau WebP. SVG tidak diterima.");
      event.target.value = "";
      onFileChange?.(null);
      return;
    }

    if (file.size > MAX_BYTES) {
      setLocalError("Ukuran file maksimal 5 MB. Pilih file yang lebih kecil.");
      event.target.value = "";
      onFileChange?.(null);
      return;
    }

    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    onFileChange?.(file);
  }

  function handleRemove() {
    if (inputRef.current) inputRef.current.value = "";
    setFileName(null);
    setPreviewUrl(null);
    setLocalError(null);
    onFileChange?.(null);
  }

  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="ml-1 text-danger-700" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1 font-normal text-ink-muted">(opsional)</span>
        )}
      </Label>

      <div className="relative mt-2">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={required}
          aria-describedby={describedBy}
          aria-invalid={shownError ? true : undefined}
          onChange={handleChange}
          className="peer sr-only"
        />

        <label
          htmlFor={id}
          className="block cursor-pointer rounded-input focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-focus peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
        >
          {previewUrl ? (
            <span className="relative block overflow-hidden rounded-input border border-line bg-surface">
              <Image
                src={previewUrl}
                alt={`Pratinjau ${label.toLowerCase()}`}
                width={640}
                height={360}
                unoptimized
                className={`w-full object-cover ${imageClassName}`}
              />
              <span className="absolute inset-x-0 bottom-0 flex min-h-11 items-center justify-center gap-1.5 bg-ink/75 px-3 text-xs font-medium text-white">
                Ganti foto
              </span>
            </span>
          ) : (
            <span className="flex flex-col items-center gap-2 rounded-input border-2 border-dashed border-line-strong/70 bg-surface-muted/60 px-4 py-8 text-center transition-colors hover:border-primary-600 hover:bg-primary-50">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-surface text-primary-700 shadow-xs">
                <UploadIcon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-ink">Pilih foto</span>
              <span className="text-xs text-ink-muted">
                JPEG, PNG, atau WebP · maksimal 5 MB
              </span>
            </span>
          )}
        </label>

        {previewUrl ? (
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Hapus ${label.toLowerCase()}`}
            className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full border border-line bg-surface/95 text-ink shadow-card transition-colors hover:bg-surface-muted"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <p role="status" className="mt-1.5 truncate text-xs text-ink-muted">
        {fileName ?? "Belum ada file dipilih."}
      </p>

      {shownError ? (
        <FieldError id={errorId}>{shownError}</FieldError>
      ) : null}
      {hint ? <FieldHint id={hintId}>{hint}</FieldHint> : null}
    </div>
  );
}
