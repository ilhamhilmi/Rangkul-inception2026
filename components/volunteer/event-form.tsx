"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { EventCategory } from "@prisma/client";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/field";
import { FileField } from "@/components/ui/file-field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { communityProvinceOptions } from "@/lib/constants/communities";
import { EVENT_CATEGORY_LABELS } from "@/lib/volunteer/categories";
import {
  createEventCoverUploadAction,
  saveEventAction,
} from "@/lib/volunteer/actions";
import { uploadToSignedPath } from "@/lib/volunteer/upload";
import type { VolunteerFieldErrors } from "@/lib/volunteer/action-state";

export type EventFormValues = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  locationName: string;
  address: string;
  city: string;
  province: string;
  startsAt: string;
  endsAt: string;
  requirements: string;
  accessibilityNotes: string;
  slots: string;
  coverUrl: string;
  coverAlt: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "CLOSED" | "REJECTED";
  coverPreviewUrl?: string;
};

type EventFormProps = {
  event?: EventFormValues;
};

const categoryOptions = Object.entries(EVENT_CATEGORY_LABELS) as Array<
  [EventCategory, string]
>;

function toJakartaInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const jakarta = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return jakarta.toISOString().slice(0, 16);
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const intentRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<VolunteerFieldErrors>({});
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const canSubmitForReview =
    !event || event.status === "DRAFT" || event.status === "REJECTED";

  function handleSubmit(formData: FormData) {
    setMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      let coverUrl = String(formData.get("coverUrl") ?? "").trim();
      let coverAlt = String(formData.get("coverAlt") ?? "").trim();

      if (coverFile) {
        const upload = await createEventCoverUploadAction({
          fileName: coverFile.name,
          contentType: coverFile.type,
          size: coverFile.size,
        });

        if (!upload.ok) {
          setMessage(upload.message);
          setFieldErrors(upload.fieldErrors ?? {});
          return;
        }

        try {
          await uploadToSignedPath({
            bucket: "event-covers",
            path: upload.data.path,
            token: upload.data.token,
            file: coverFile,
          });
        } catch {
          setMessage("Cover gagal diunggah. Periksa koneksi lalu coba lagi.");
          return;
        }

        coverUrl = upload.data.path;
        coverAlt = coverAlt || `Ilustrasi kegiatan ${String(formData.get("title") ?? "")}`;
      }

      const payload = new FormData();
      for (const key of [
        "title",
        "description",
        "category",
        "locationName",
        "address",
        "city",
        "province",
        "startsAt",
        "endsAt",
        "requirements",
        "accessibilityNotes",
        "slots",
      ]) {
        payload.set(key, String(formData.get(key) ?? ""));
      }
      payload.set("coverUrl", coverUrl);
      payload.set("coverAlt", coverUrl ? coverAlt : "");
      payload.set("intent", String(formData.get("intent") ?? "DRAFT"));

      if (event) payload.set("eventId", event.id);

      const result = await saveEventAction(payload);

      if (!result.ok) {
        setMessage(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setMessage("Kegiatan berhasil disimpan.");
      router.push("/dashboard/kegiatan");
      router.refresh();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      <input ref={intentRef} type="hidden" name="intent" value="DRAFT" readOnly />

      <section
        aria-labelledby="info-utama-kegiatan"
        className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6"
      >
        <h2
          id="info-utama-kegiatan"
          className="text-lg font-semibold tracking-tight text-ink"
        >
          Informasi utama
        </h2>

        <div className="mt-4 grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Judul kegiatan</Label>
            <Input
              id="event-title"
              name="title"
              maxLength={150}
              defaultValue={event?.title}
              required
              aria-invalid={fieldErrors.title ? true : undefined}
            />
            {fieldErrors.title ? (
              <FieldError>{fieldErrors.title[0]}</FieldError>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Deskripsi</Label>
            <Textarea
              id="event-description"
              name="description"
              rows={6}
              maxLength={5000}
              defaultValue={event?.description}
              required
              aria-invalid={fieldErrors.description ? true : undefined}
            />
            <FieldHint>
              Jelaskan peran relawan, suasana kegiatan, dan hal yang membuat
              kegiatan ini inklusif.
            </FieldHint>
            {fieldErrors.description ? (
              <FieldError>{fieldErrors.description[0]}</FieldError>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-category">Kategori</Label>
              <Select
                id="event-category"
                name="category"
                defaultValue={event?.category ?? "EVENT_SUPPORT"}
                aria-invalid={fieldErrors.category ? true : undefined}
              >
                {categoryOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              {fieldErrors.category ? (
                <FieldError>{fieldErrors.category[0]}</FieldError>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-slots">Kapasitas peserta</Label>
              <Input
                id="event-slots"
                name="slots"
                type="number"
                min={1}
                max={10000}
                defaultValue={event?.slots ?? ""}
                required
                aria-invalid={fieldErrors.slots ? true : undefined}
              />
              {fieldErrors.slots ? (
                <FieldError>{fieldErrors.slots[0]}</FieldError>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="lokasi-kegiatan"
        className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6"
      >
        <h2
          id="lokasi-kegiatan"
          className="text-lg font-semibold tracking-tight text-ink"
        >
          Lokasi dan jadwal
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="event-location">Nama lokasi</Label>
            <Input
              id="event-location"
              name="locationName"
              maxLength={200}
              defaultValue={event?.locationName}
              required
              aria-invalid={fieldErrors.locationName ? true : undefined}
            />
            {fieldErrors.locationName ? (
              <FieldError>{fieldErrors.locationName[0]}</FieldError>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="event-address">Alamat lengkap</Label>
            <Input
              id="event-address"
              name="address"
              maxLength={300}
              defaultValue={event?.address}
              required
              aria-invalid={fieldErrors.address ? true : undefined}
            />
            {fieldErrors.address ? (
              <FieldError>{fieldErrors.address[0]}</FieldError>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-city">Kota</Label>
            <Input
              id="event-city"
              name="city"
              maxLength={80}
              defaultValue={event?.city}
              required
              aria-invalid={fieldErrors.city ? true : undefined}
            />
            {fieldErrors.city ? (
              <FieldError>{fieldErrors.city[0]}</FieldError>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-province">Provinsi</Label>
            <Select
              id="event-province"
              name="province"
              defaultValue={event?.province ?? ""}
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

          <div className="space-y-2">
            <Label htmlFor="event-starts">Mulai</Label>
            <Input
              id="event-starts"
              name="startsAt"
              type="datetime-local"
              defaultValue={
                event ? toJakartaInputValue(event.startsAt) : undefined
              }
              required
              aria-invalid={fieldErrors.startsAt ? true : undefined}
            />
            {fieldErrors.startsAt ? (
              <FieldError>{fieldErrors.startsAt[0]}</FieldError>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-ends">Selesai</Label>
            <Input
              id="event-ends"
              name="endsAt"
              type="datetime-local"
              defaultValue={event ? toJakartaInputValue(event.endsAt) : undefined}
              required
              aria-invalid={fieldErrors.endsAt ? true : undefined}
            />
            {fieldErrors.endsAt ? (
              <FieldError>{fieldErrors.endsAt[0]}</FieldError>
            ) : null}
          </div>

        </div>
      </section>

      <section
        aria-labelledby="persyaratan-aksesibilitas"
        className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6"
      >
        <h2
          id="persyaratan-aksesibilitas"
          className="text-lg font-semibold tracking-tight text-ink"
        >
          Persyaratan dan aksesibilitas
        </h2>

        <div className="mt-4 grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-requirements">Persyaratan peserta</Label>
            <Textarea
              id="event-requirements"
              name="requirements"
              rows={4}
              maxLength={2000}
              defaultValue={event?.requirements}
              aria-describedby="requirements-hint"
              aria-invalid={fieldErrors.requirements ? true : undefined}
            />
            <FieldHint id="requirements-hint">
              Tulis satu persyaratan per baris agar mudah dibaca.
            </FieldHint>
            {fieldErrors.requirements ? (
              <FieldError>{fieldErrors.requirements[0]}</FieldError>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-accessibility">Catatan aksesibilitas</Label>
            <Textarea
              id="event-accessibility"
              name="accessibilityNotes"
              rows={4}
              maxLength={2000}
              defaultValue={event?.accessibilityNotes}
              aria-invalid={
                fieldErrors.accessibilityNotes ? true : undefined
              }
            />
            <FieldHint>
              Informasi ramp, toilet aksesibel, juru bahasa isyarat, area
              istirahat, atau dukungan lain di lokasi.
            </FieldHint>
            {fieldErrors.accessibilityNotes ? (
              <FieldError>{fieldErrors.accessibilityNotes[0]}</FieldError>
            ) : null}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="cover-kegiatan"
        className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6"
      >
        <h2
          id="cover-kegiatan"
          className="text-lg font-semibold tracking-tight text-ink"
        >
          Cover kegiatan
        </h2>

        {event?.coverPreviewUrl ? (
          <div className="mt-4">
            <p className="text-xs text-ink-muted">Cover saat ini</p>
            <div
              role="img"
              aria-label={event.coverAlt || "Cover kegiatan saat ini"}
              className="mt-2 h-32 w-full rounded-input bg-cover bg-center"
              style={{ backgroundImage: `url(${event.coverPreviewUrl})` }}
            />
          </div>
        ) : null}

        <input type="hidden" name="coverUrl" defaultValue={event?.coverUrl ?? ""} />

        <div className="mt-4">
          <FileField
            id="event-cover"
            name="cover"
            label="Unggah cover baru"
            hint="JPEG, PNG, atau WebP maksimal 5 MB."
            onFileChange={setCoverFile}
          />
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="event-cover-alt">Teks alternatif cover</Label>
          <Input
            id="event-cover-alt"
            name="coverAlt"
            maxLength={200}
            defaultValue={event?.coverAlt}
            aria-describedby="cover-alt-hint"
            aria-invalid={fieldErrors.coverAlt ? true : undefined}
          />
          <FieldHint id="cover-alt-hint">
            Wajib bila cover diunggah. Deskripsikan isi gambar untuk pembaca
            layar.
          </FieldHint>
          {fieldErrors.coverAlt ? (
            <FieldError>{fieldErrors.coverAlt[0]}</FieldError>
          ) : null}
        </div>
      </section>

      {message ? (
        <p
          role="alert"
          className="rounded-input border border-line bg-surface-muted p-3.5 text-sm leading-relaxed text-ink"
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          size="md"
          disabled={isPending}
          onClick={() => {
            if (intentRef.current) intentRef.current.value = "DRAFT";
          }}
        >
          {isPending ? "Menyimpan…" : "Simpan draft"}
        </Button>

        {canSubmitForReview ? (
          <Button
            type="submit"
            variant="secondary"
            size="md"
            disabled={isPending}
            onClick={() => {
              if (intentRef.current) intentRef.current.value = "PENDING";
            }}
          >
            Ajukan untuk terbit
          </Button>
        ) : null}

        <ButtonLink
          href="/dashboard/kegiatan"
          variant="ghost"
          size="md"
          className="sm:ml-auto"
        >
          Batal
        </ButtonLink>
      </div>
    </form>
  );
}
