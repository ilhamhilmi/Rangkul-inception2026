"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Checkbox,
  FieldError,
  FieldHint,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/field";
import {
  CameraIcon,
  CheckIcon,
  InfoIcon,
  MapPinIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  XIcon,
} from "@/components/ui/icons";
import { PLACE_CATEGORIES } from "@/lib/mock/places";

type FormValues = {
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  province: string;
  lat: string;
  lng: string;
  photoAlt: string;
  rating: string;
};

type EntranceDraft = {
  id: string;
  label: string;
  notes: string;
  isMain: boolean;
  ramp: boolean;
  automaticDoor: boolean;
  wideEntrance: boolean;
};

const initialValues: FormValues = {
  name: "",
  category: "",
  description: "",
  address: "",
  city: "",
  province: "",
  lat: "",
  lng: "",
  photoAlt: "",
  rating: "",
};

const initialEntrance: EntranceDraft = {
  id: "pintu-1",
  label: "",
  notes: "",
  isMain: true,
  ramp: false,
  automaticDoor: false,
  wideEntrance: false,
};

const errorTargets: Record<string, string> = {
  name: "field-name",
  category: "field-category",
  description: "field-description",
  address: "field-address",
  city: "field-city",
  province: "field-province",
  entrances: "pintu-masuk",
};

const ratingOptions = [
  { value: "5", label: "5 — Sangat mudah" },
  { value: "4", label: "4 — Mudah" },
  { value: "3", label: "3 — Cukup" },
  { value: "2", label: "2 — Sulit" },
  { value: "1", label: "1 — Sangat sulit" },
];

function StepHeading({
  step,
  title,
  description,
  id,
}: {
  step: number;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span
        aria-hidden="true"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-800"
      >
        {step}
      </span>
      <div>
        <h2 id={id} className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

export function PostingForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [entrances, setEntrances] = useState<EntranceDraft[]>([
    initialEntrance,
  ]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const entranceCounter = useRef(1);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[key];
        return next;
      });
    }
  }

  function updateEntrance(id: string, patch: Partial<EntranceDraft>) {
    setEntrances((previous) =>
      previous.map((entrance) =>
        entrance.id === id ? { ...entrance, ...patch } : entrance,
      ),
    );
    if (errors.entrances) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next.entrances;
        return next;
      });
    }
  }

  function addEntrance() {
    entranceCounter.current += 1;
    setEntrances((previous) => [
      ...previous,
      {
        ...initialEntrance,
        id: `pintu-${entranceCounter.current}`,
        isMain: previous.every((entrance) => !entrance.isMain),
      },
    ]);
  }

  function removeEntrance(id: string) {
    setEntrances((previous) => {
      if (previous.length === 1) return previous;
      const next = previous.filter((entrance) => entrance.id !== id);
      if (!next.some((entrance) => entrance.isMain)) {
        next[0] = { ...next[0], isMain: true };
      }
      return next;
    });
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setPhotos((previous) => [...previous, ...files]);
    event.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((previous) => previous.filter((_, i) => i !== index));
  }

  function validate() {
    const next: Record<string, string> = {};

    if (!values.name.trim()) next.name = "Nama tempat wajib diisi.";
    if (!values.category) next.category = "Pilih salah satu kategori.";
    if (values.description.trim().length < 40) {
      next.description =
        "Ceritakan tempatnya minimal 40 karakter agar kontribusi berguna.";
    }
    if (!values.address.trim()) next.address = "Alamat wajib diisi.";
    if (!values.city.trim()) next.city = "Kota wajib diisi.";
    if (!values.province.trim()) next.province = "Provinsi wajib diisi.";

    if (entrances.every((entrance) => !entrance.label.trim())) {
      next.entrances = "Tambahkan minimal satu pintu masuk dengan label.";
    }

    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstKey = Object.keys(nextErrors)[0];
      const target = errorTargets[firstKey];
      if (target) {
        document.getElementById(target)?.focus();
      }
      return;
    }

    setErrors({});
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setValues(initialValues);
    setEntrances([{ ...initialEntrance }]);
    entranceCounter.current = 1;
    setPhotos([]);
    setErrors({});
    setSubmitted(false);
  }

  const errorEntries = Object.entries(errors);

  if (submitted) {
    const categoryLabel =
      PLACE_CATEGORIES.find((item) => item.value === values.category)?.label ??
      "Belum dipilih";

    return (
      <div
        role="status"
        className="mx-auto max-w-2xl rounded-sheet border border-success-600/30 bg-surface p-6 shadow-card sm:p-8"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-success-50 text-success-700">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink">
          Terima kasih, {values.name.trim()} sudah dikirim
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Pada versi final, data akan masuk ke antrean moderasi sebelum tayang.
          Karena backend belum tersambung, isian ini <strong>belum disimpan</strong>{" "}
          ke database.
        </p>

        <dl className="mt-5 grid gap-3 rounded-card border border-line bg-surface-muted/60 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-muted">Kategori</dt>
            <dd className="mt-0.5 font-medium text-ink">{categoryLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Lokasi</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {values.city}, {values.province}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Pintu masuk</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {entrances.length} pintu
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Foto disiapkan</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {photos.length > 0 ? `${photos.length} file` : "Belum ada"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/jelajahi" size="md" className="flex-1">
            Lihat halaman jelajahi
          </ButtonLink>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={resetForm}
            className="flex-1"
          >
            Isi form lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start"
    >
      <div className="order-1 space-y-5">
        {errorEntries.length > 0 ? (
          <div
            role="alert"
            className="rounded-sheet border border-danger-600/30 bg-danger-50 p-4"
          >
            <p className="text-sm font-semibold text-danger-700">
              Ada {errorEntries.length} isian yang perlu diperiksa
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-danger-700">
              {errorEntries.map(([key, message]) => (
                <li key={key}>
                  <a
                    href={`#${errorTargets[key] ?? "form-posting"}`}
                    className="underline underline-offset-2"
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <section
          aria-labelledby="step-info"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <StepHeading
            id="step-info"
            step={1}
            title="Informasi tempat"
            description="Mulai dari hal yang paling dicari orang: nama, kategori, dan gambaran tempatnya."
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-name">
                Nama tempat <span className="text-danger-700">*</span>
              </Label>
              <Input
                id="field-name"
                name="name"
                value={values.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="Contoh: Taman Kota Menteng"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "error-name" : undefined}
                required
              />
              {errors.name ? (
                <FieldError id="error-name">{errors.name}</FieldError>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="field-category">
                Kategori <span className="text-danger-700">*</span>
              </Label>
              <Select
                id="field-category"
                name="category"
                value={values.category}
                onChange={(event) => update("category", event.target.value)}
                aria-invalid={errors.category ? true : undefined}
                aria-describedby={errors.category ? "error-category" : undefined}
                required
              >
                <option value="">Pilih kategori</option>
                {PLACE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label} — {category.description}
                  </option>
                ))}
              </Select>
              {errors.category ? (
                <FieldError id="error-category">{errors.category}</FieldError>
              ) : (
                <FieldHint>Pilih yang paling mendekati fungsi utama tempat.</FieldHint>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="field-description">
                  Deskripsi <span className="text-danger-700">*</span>
                </Label>
                <span className="text-xs text-ink-muted">
                  {values.description.trim().length}/40 karakter minimum
                </span>
              </div>
              <Textarea
                id="field-description"
                name="description"
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Jelaskan suasana, jalur masuk, dan hal yang perlu diketahui pengunjung."
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={
                  errors.description ? "error-description" : "hint-description"
                }
                rows={4}
                required
              />
              {errors.description ? (
                <FieldError id="error-description">
                  {errors.description}
                </FieldError>
              ) : (
                <FieldHint id="hint-description">
                  Sebutkan kondisi nyata, bukan hanya label “ramah disabilitas”.
                </FieldHint>
              )}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="step-location"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <StepHeading
            id="step-location"
            step={2}
            title="Lokasi"
            description="Alamat lengkap dan titik peta membantu orang menemukan pintu yang tepat."
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field-address">
                Alamat lengkap <span className="text-danger-700">*</span>
              </Label>
              <Input
                id="field-address"
                name="address"
                value={values.address}
                onChange={(event) => update("address", event.target.value)}
                placeholder="Jl. Contoh No. 12, Kelurahan, Kecamatan"
                aria-invalid={errors.address ? true : undefined}
                aria-describedby={errors.address ? "error-address" : undefined}
                required
              />
              {errors.address ? (
                <FieldError id="error-address">{errors.address}</FieldError>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="field-city">
                  Kota / kabupaten <span className="text-danger-700">*</span>
                </Label>
                <Input
                  id="field-city"
                  name="city"
                  value={values.city}
                  onChange={(event) => update("city", event.target.value)}
                  placeholder="Contoh: Bandung"
                  aria-invalid={errors.city ? true : undefined}
                  aria-describedby={errors.city ? "error-city" : undefined}
                  required
                />
                {errors.city ? (
                  <FieldError id="error-city">{errors.city}</FieldError>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-province">
                  Provinsi <span className="text-danger-700">*</span>
                </Label>
                <Input
                  id="field-province"
                  name="province"
                  value={values.province}
                  onChange={(event) => update("province", event.target.value)}
                  placeholder="Contoh: Jawa Barat"
                  aria-invalid={errors.province ? true : undefined}
                  aria-describedby={
                    errors.province ? "error-province" : undefined
                  }
                  required
                />
                {errors.province ? (
                  <FieldError id="error-province">
                    {errors.province}
                  </FieldError>
                ) : null}
              </div>
            </div>

            <div className="rounded-card border border-line bg-surface-muted/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <MapPinIcon className="h-4 w-4 text-primary-700" />
                    Titik peta
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    Peta masih ilustrasi. Masukkan koordinat perkiraan; pemilih
                    peta interaktif menyusul bersama Leaflet.
                  </p>
                </div>
                <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink-muted">
                  Opsional
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="field-lat" className="text-xs text-ink-muted">
                    Latitude
                  </Label>
                  <Input
                    id="field-lat"
                    name="lat"
                    inputMode="decimal"
                    value={values.lat}
                    onChange={(event) => update("lat", event.target.value)}
                    placeholder="-6.2088"
                    className="h-11 bg-surface text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="field-lng" className="text-xs text-ink-muted">
                    Longitude
                  </Label>
                  <Input
                    id="field-lng"
                    name="lng"
                    inputMode="decimal"
                    value={values.lng}
                    onChange={(event) => update("lng", event.target.value)}
                    placeholder="106.8456"
                    className="h-11 bg-surface text-sm"
                  />
                </div>
              </div>

              <div
                aria-hidden="true"
                className="relative mt-3 h-28 overflow-hidden rounded-card border border-line bg-primary-50"
              >
                <svg viewBox="0 0 400 120" className="h-full w-full">
                  <rect width="400" height="120" fill="var(--color-primary-50)" />
                  <g fill="var(--color-primary-100)">
                    <rect x="16" y="14" width="90" height="34" rx="6" />
                    <rect x="290" y="18" width="94" height="40" rx="6" />
                    <rect x="40" y="76" width="110" height="34" rx="6" />
                    <rect x="270" y="76" width="100" height="32" rx="6" />
                  </g>
                  <g stroke="var(--color-surface)" strokeWidth="14" fill="none">
                    <path d="M0 60h400" />
                    <path d="M200 0v120" />
                  </g>
                  <circle cx="214" cy="56" r="16" fill="var(--color-primary-600)" opacity="0.18" />
                  <circle cx="214" cy="56" r="7" fill="var(--color-primary-600)" stroke="var(--color-surface)" strokeWidth="3" />
                </svg>
                <span className="absolute bottom-2 left-2 rounded-full bg-surface/95 px-2 py-1 text-xs font-medium text-ink-muted">
                  Peta contoh
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="step-facilities"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <StepHeading
            id="step-facilities"
            step={3}
            title="Fasilitas umum"
            description="Centang fasilitas yang tersedia di area tempat. Detail per pintu diisi di langkah berikutnya."
          />

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Fasilitas umum yang tersedia</legend>
            {[
              { key: "parking", label: "Parkir aksesibel", hint: "Slot lebar dekat pintu" },
              { key: "toilet", label: "Toilet aksesibel", hint: "Pegangan dan ruang manuver" },
              { key: "lift", label: "Lift aksesibel", hint: "Tombol rendah, pintu lebar" },
              { key: "guiding-block", label: "Guiding block", hint: "Ubin pemandu taktil" },
            ].map((facility) => (
              <label
                key={facility.key}
                htmlFor={`facility-${facility.key}`}
                className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-surface p-3.5 transition-colors hover:border-primary-300 hover:bg-surface-muted/50 has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
              >
                <Checkbox
                  id={`facility-${facility.key}`}
                  name={facility.key}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">
                    {facility.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {facility.hint}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        </section>

        <section
          id="pintu-masuk"
          aria-labelledby="step-entrances"
          tabIndex={-1}
          className="scroll-mt-24 rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <StepHeading
            id="step-entrances"
            step={4}
            title="Pintu masuk"
            description="Ini pembeda utama Rangkul. Catat setiap pintu dan kondisinya, lalu tandai satu sebagai pintu utama."
          />

          {errors.entrances ? (
            <div className="mb-4">
              <FieldError>{errors.entrances}</FieldError>
            </div>
          ) : null}

          <ol className="space-y-4">
            {entrances.map((entrance, index) => (
              <li
                key={entrance.id}
                className="rounded-card border border-line bg-surface-muted/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    Pintu {index + 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`${entrance.id}-main`}
                      className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-medium text-ink"
                    >
                      <input
                        type="radio"
                        id={`${entrance.id}-main`}
                        name="pintu-utama"
                        checked={entrance.isMain}
                        onChange={() =>
                          setEntrances((previous) =>
                            previous.map((item) => ({
                              ...item,
                              isMain: item.id === entrance.id,
                            })),
                          )
                        }
                        className="h-3.5 w-3.5 accent-primary-600"
                      />
                      Pintu utama
                    </label>
                    <button
                      type="button"
                      onClick={() => removeEntrance(entrance.id)}
                      disabled={entrances.length === 1}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition-colors hover:border-danger-600 hover:text-danger-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Hapus pintu ${index + 1}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label
                      htmlFor={`${entrance.id}-label`}
                      className="text-xs text-ink-muted"
                    >
                      Label pintu <span className="text-danger-700">*</span>
                    </Label>
                    <Input
                      id={`${entrance.id}-label`}
                      value={entrance.label}
                      onChange={(event) =>
                        updateEntrance(entrance.id, { label: event.target.value })
                      }
                      placeholder="Contoh: Pintu Utara"
                      className="h-11 bg-surface text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label
                      htmlFor={`${entrance.id}-notes`}
                      className="text-xs text-ink-muted"
                    >
                      Catatan kondisi
                    </Label>
                    <Textarea
                      id={`${entrance.id}-notes`}
                      value={entrance.notes}
                      onChange={(event) =>
                        updateEntrance(entrance.id, { notes: event.target.value })
                      }
                      placeholder="Ramp landai, pintu otomatis, lebar 90 cm, jalur ke lift sekitar 15 meter."
                      className="min-h-20 bg-surface text-sm"
                      rows={2}
                    />
                  </div>

                  <fieldset className="sm:col-span-2">
                    <legend className="text-xs font-medium text-ink-muted">
                      Fasilitas di pintu ini
                    </legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {[
                        { key: "ramp" as const, label: "Ramp landai" },
                        {
                          key: "automaticDoor" as const,
                          label: "Pintu otomatis",
                        },
                        {
                          key: "wideEntrance" as const,
                          label: "Pintu lebar (≥ 90 cm)",
                        },
                      ].map((facility) => (
                        <label
                          key={facility.key}
                          htmlFor={`${entrance.id}-${facility.key}`}
                          className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-input border border-line bg-surface px-3 text-sm text-ink"
                        >
                          <Checkbox
                            id={`${entrance.id}-${facility.key}`}
                            checked={entrance[facility.key]}
                            onChange={(event) =>
                              updateEntrance(entrance.id, {
                                [facility.key]: event.target.checked,
                              })
                            }
                          />
                          {facility.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </li>
            ))}
          </ol>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addEntrance}
            className="mt-4"
          >
            <PlusIcon className="h-4 w-4" />
            Tambah pintu
          </Button>
        </section>

        <section
          aria-labelledby="step-photo"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <StepHeading
            id="step-photo"
            step={5}
            title="Foto"
            description="Foto membantu orang mengenali kondisi pintu dan jalur. Upload belum aktif di versi UI ini."
          />

          <div className="rounded-card border border-dashed border-line-strong/50 bg-surface-muted/40 p-4">
            <label
              htmlFor="field-photos"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-input px-4 py-8 text-center transition-colors hover:bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-700"
            >
              <input
                id="field-photos"
                name="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="sr-only"
              />
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-50 text-primary-700">
                <CameraIcon className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-ink">
                Pilih foto dari perangkat
              </span>
              <span className="text-xs text-ink-muted">
                JPG, PNG, atau WebP. Bisa lebih dari satu file.
              </span>
            </label>
          </div>

          {photos.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {photos.map((photo, index) => (
                <li
                  key={`${photo.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-input border border-line bg-surface px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
                    <CameraIcon className="h-4 w-4 shrink-0 text-primary-700" />
                    <span className="truncate">{photo.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted hover:text-danger-700"
                    aria-label={`Hapus foto ${photo.name}`}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4 space-y-2">
            <Label htmlFor="field-photo-alt" className="text-xs text-ink-muted">
              Teks alternatif foto
            </Label>
            <Input
              id="field-photo-alt"
              name="photoAlt"
              value={values.photoAlt}
              onChange={(event) => update("photoAlt", event.target.value)}
              placeholder="Contoh: Ramp landai di sisi kanan Pintu Utara"
              className="h-11 text-sm"
            />
            <FieldHint>
              Deskripsikan isi foto untuk pengguna pembaca layar.
            </FieldHint>
          </div>
        </section>

        <section
          aria-labelledby="step-rating"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <StepHeading
            id="step-rating"
            step={6}
            title="Rating aksesibilitas"
            description="Opsional. Beri nilai seberapa mudah tempat ini diakses sesuai pengalamanmu."
          />

          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              Seberapa mudah diakses?
            </legend>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              {ratingOptions.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`rating-${option.value}`}
                  className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-input border border-line bg-surface px-3 text-sm text-ink has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
                >
                  <input
                    type="radio"
                    id={`rating-${option.value}`}
                    name="rating"
                    value={option.value}
                    checked={values.rating === option.value}
                    onChange={() => update("rating", option.value)}
                    className="h-4 w-4 accent-primary-600"
                  />
                  {option.label}
                </label>
              ))}
              <label
                htmlFor="rating-none"
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-input border border-line bg-surface px-3 text-sm text-ink-muted has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
              >
                <input
                  type="radio"
                  id="rating-none"
                  name="rating"
                  value=""
                  checked={values.rating === ""}
                  onChange={() => update("rating", "")}
                  className="h-4 w-4 accent-primary-600"
                />
                Lewati rating
              </label>
            </div>
          </fieldset>
        </section>
      </div>

      <aside className="order-2 space-y-4 lg:sticky lg:top-24">
        <div className="rounded-sheet border border-primary-200 bg-primary-50 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary-900">
            <InfoIcon className="h-4 w-4" />
            Sebelum mengirim
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-primary-800">
            {[
              "Tulis kondisi apa adanya, termasuk hambatan yang masih ada.",
              "Bedakan fasilitas per pintu masuk, jangan digabung.",
              "Sertakan foto pintu dan jalur jika memungkinkan.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-sheet border border-line bg-surface p-5 shadow-xs">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ShieldCheckIcon className="h-4 w-4 text-primary-700" />
            Ditinjau sebelum tayang
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
            Kontribusi akan melewati moderasi. Pada versi UI ini, data hanya
            ditampilkan di panel sukses dan tidak dikirim ke mana pun.
          </p>
          <Button type="submit" size="lg" className="mt-4 w-full">
            Kirim untuk ditinjau
          </Button>
          <p className="mt-2 text-center text-xs text-ink-muted">
            Wajib: nama, kategori, deskripsi, alamat, kota, provinsi, dan satu
            pintu masuk.
          </p>
        </div>
      </aside>
    </form>
  );
}
