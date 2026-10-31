"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheckIcon, UploadIcon } from "@/components/ui/icons";
import { communityProvinceOptions } from "@/lib/constants/communities";
import {
  createVerificationDocumentUploadAction,
  submitOrganizerApplicationAction,
} from "@/lib/volunteer/actions";
import { uploadToSignedPath } from "@/lib/volunteer/upload";
import type { VolunteerFieldErrors } from "@/lib/volunteer/action-state";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export function OrganizerApplicationForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<VolunteerFieldErrors>({});
  const [fileName, setFileName] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    setFieldErrors({});

    const file = formData.get("document");
    if (!(file instanceof File) || file.size === 0) {
      setFieldErrors({ documentPath: ["Dokumen verifikasi wajib diunggah."] });
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFieldErrors({
        documentPath: ["Gunakan file JPEG, PNG, WebP, atau PDF."],
      });
      return;
    }

    if (file.size > MAX_BYTES) {
      setFieldErrors({ documentPath: ["Ukuran file maksimal 5 MB."] });
      return;
    }

    startTransition(async () => {
      const upload = await createVerificationDocumentUploadAction({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });

      if (!upload.ok) {
        setMessage(upload.message);
        setFieldErrors(upload.fieldErrors ?? {});
        return;
      }

      try {
        await uploadToSignedPath({
          bucket: "verification-docs",
          path: upload.data.path,
          token: upload.data.token,
          file,
        });
      } catch {
        setMessage(
          "Dokumen gagal diunggah. Periksa koneksi lalu coba lagi.",
        );
        return;
      }

      const payload = new FormData();
      payload.set("organizationName", String(formData.get("organizationName") ?? ""));
      payload.set("contactName", String(formData.get("contactName") ?? ""));
      payload.set("phone", String(formData.get("phone") ?? ""));
      payload.set("city", String(formData.get("city") ?? ""));
      payload.set("province", String(formData.get("province") ?? ""));
      payload.set("experience", String(formData.get("experience") ?? ""));
      payload.set("documentPath", upload.data.path);

      const result = await submitOrganizerApplicationAction(payload);

      if (!result.ok) {
        setMessage(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setMessage(
        "Pengajuan berhasil dikirim. Admin Rangkul akan meninjau data dan dokumenmu.",
      );
      formRef.current?.reset();
      setFileName(null);
      router.refresh();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="organizationName">Nama organisasi atau komunitas</Label>
          <Input
            id="organizationName"
            name="organizationName"
            maxLength={120}
            required
            aria-invalid={fieldErrors.organizationName ? true : undefined}
          />
          {fieldErrors.organizationName ? (
            <FieldError>{fieldErrors.organizationName[0]}</FieldError>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Nama kontak yang bisa dihubungi</Label>
          <Input
            id="contactName"
            name="contactName"
            autoComplete="name"
            maxLength={80}
            required
            aria-invalid={fieldErrors.contactName ? true : undefined}
          />
          {fieldErrors.contactName ? (
            <FieldError>{fieldErrors.contactName[0]}</FieldError>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizer-phone">Nomor telepon</Label>
          <Input
            id="organizer-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08xxxxxxxxxx"
            required
            aria-invalid={fieldErrors.phone ? true : undefined}
          />
          {fieldErrors.phone ? (
            <FieldError>{fieldErrors.phone[0]}</FieldError>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizer-city">Kota</Label>
          <Input
            id="organizer-city"
            name="city"
            autoComplete="address-level2"
            maxLength={80}
            required
            aria-invalid={fieldErrors.city ? true : undefined}
          />
          {fieldErrors.city ? (
            <FieldError>{fieldErrors.city[0]}</FieldError>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizer-province">Provinsi</Label>
          <Select
            id="organizer-province"
            name="province"
            defaultValue=""
            required
            aria-invalid={fieldErrors.province ? true : undefined}
          >
            <option value="" disabled>
              Pilih provinsi
            </option>
            {communityProvinceOptions.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </Select>
          {fieldErrors.province ? (
            <FieldError>{fieldErrors.province[0]}</FieldError>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="experience">Pengalaman menyelenggarakan kegiatan</Label>
          <Textarea
            id="experience"
            name="experience"
            rows={4}
            maxLength={1000}
            required
            aria-describedby="experience-hint"
            aria-invalid={fieldErrors.experience ? true : undefined}
            placeholder="Ceritakan pengalaman, jejaring, atau rencana kegiatan inklusif yang ingin kamu adakan."
          />
          <FieldHint id="experience-hint">
            Minimal 20 karakter. Jelaskan peranmu dan jenis kegiatan yang biasa
            kamu tangani.
          </FieldHint>
          {fieldErrors.experience ? (
            <FieldError>{fieldErrors.experience[0]}</FieldError>
          ) : null}
        </div>
      </div>

      <div className="rounded-card border border-dashed border-line-strong/70 bg-surface-muted/60 p-4">
        <Label htmlFor="organizer-document">
          Dokumen verifikasi
          <span className="ml-1 text-danger-700" aria-hidden="true">
            *
          </span>
        </Label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label
            htmlFor="organizer-document"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-button border border-line-strong bg-surface px-4 text-sm font-medium text-ink shadow-xs transition-colors hover:bg-surface-muted focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-focus"
          >
            <UploadIcon className="h-4 w-4" />
            Pilih dokumen
          </label>
          <input
            id="organizer-document"
            name="document"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            required
            onChange={(event) =>
              setFileName(event.target.files?.[0]?.name ?? null)
            }
            className="sr-only"
            aria-describedby="organizer-document-hint"
            aria-invalid={fieldErrors.documentPath ? true : undefined}
          />
          <span className="truncate text-sm text-ink-muted">
            {fileName ?? "Belum ada file dipilih."}
          </span>
        </div>
        <p id="organizer-document-hint" className="mt-2 text-xs leading-relaxed text-ink-muted">
          Unggah KTP pengurus atau surat penugasan organisasi. Format JPEG, PNG,
          WebP, atau PDF maksimal 5 MB. Dokumen disimpan di bucket privat dan
          hanya dapat dibuka admin melalui signed URL.
        </p>
        {fieldErrors.documentPath ? (
          <FieldError>{fieldErrors.documentPath[0]}</FieldError>
        ) : null}
      </div>

      <label className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 h-4 w-4 rounded border-line-strong text-primary-600 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus"
        />
        <span>
          Saya menyatakan data yang dikirim benar dan bersedia dihubungi admin
          Rangkul untuk proses verifikasi.
        </span>
      </label>

      {message ? (
        <p
          role="alert"
          className="rounded-input border border-line bg-surface-muted p-3.5 text-sm leading-relaxed text-ink"
        >
          {message}
        </p>
      ) : null}

      <Button type="submit" size="md" disabled={isPending}>
        <ShieldCheckIcon className="h-4 w-4" />
        {isPending ? "Mengirim pengajuan…" : "Kirim pengajuan"}
      </Button>
    </form>
  );
}
