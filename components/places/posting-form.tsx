"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { LocationPicker } from "@/components/map/location-picker";
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
  NavigationIcon,
  ShieldCheckIcon,
  XIcon,
} from "@/components/ui/icons";
import { PLACE_CATEGORIES } from "@/lib/constants/places";

type FormValues = {
  name: string;
  category: string;
  description: string;
  lat: string;
  lng: string;
  photoAlt: string;
  rating: string;
};

const initialValues: FormValues = {
  name: "",
  category: "",
  description: "",
  lat: "",
  lng: "",
  photoAlt: "",
  rating: "",
};

const errorTargets: Record<string, string> = {
  name: "field-name",
  category: "field-category",
  description: "field-description",
  location: "field-lat",
  lat: "field-lat",
  lng: "field-lng",
};

function parseCoordinate(value: string, min: number, max: number) {
  if (!value.trim()) return null;

  const parsed = Number(value.replace(",", "."));

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null;
  }

  return parsed;
}

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
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const latitude = parseCoordinate(values.lat, -90, 90);
  const longitude = parseCoordinate(values.lng, -180, 180);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));

    if (key === "lat" || key === "lng") {
      setLocationNotice(null);
    }

    setErrors((previous) => {
      const clearsCoordinate =
        (key === "lat" || key === "lng") && Boolean(previous.location);
      if (!previous[key] && !clearsCoordinate) return previous;

      const next = { ...previous };
      delete next[key];
      if (key === "lat" || key === "lng") delete next.location;
      return next;
    });
  }

  function setCoordinate(lat: number, lng: number) {
    setValues((previous) => ({
      ...previous,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }));
    setErrors((previous) => {
      if (!previous.location && !previous.lat && !previous.lng) {
        return previous;
      }

      const next = { ...previous };
      delete next.location;
      delete next.lat;
      delete next.lng;
      return next;
    });
    setLocationNotice(null);
  }

  function useCurrentLocation() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationNotice(
        "Browser ini tidak menyediakan lokasi perangkat. Klik peta atau isi koordinat manual.",
      );
      return;
    }

    setLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinate(position.coords.latitude, position.coords.longitude);
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setLocationNotice(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Klik peta atau isi koordinat manual."
            : "Lokasi tidak berhasil dibaca. Klik peta atau isi koordinat manual.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
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

    const lat = parseCoordinate(values.lat, -90, 90);
    const lng = parseCoordinate(values.lng, -180, 180);

    if (!values.lat.trim() && !values.lng.trim()) {
      next.location = "Tentukan titik lokasi di peta atau isi koordinat.";
    } else {
      if (lat === null) next.lat = "Latitude harus angka antara -90 dan 90.";
      if (lng === null) next.lng = "Longitude harus angka antara -180 dan 180.";
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
    setPhotos([]);
    setErrors({});
    setSubmitted(false);
    setLocating(false);
    setLocationNotice(null);
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
            <dt className="text-xs text-ink-muted">Titik peta</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {values.lat}, {values.lng}
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
            description="Tandai titik tempat langsung di peta. Klik peta atau geser penanda; koordinat bisa diisi manual jika perlu."
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <MapPinIcon className="h-4 w-4 text-primary-700" />
                Titik peta <span className="text-danger-700">*</span>
              </p>
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onChange={({ latitude: nextLat, longitude: nextLng }) =>
                  setCoordinate(nextLat, nextLng)
                }
              />
              {errors.location ? (
                <FieldError id="error-location">{errors.location}</FieldError>
              ) : (
                <FieldHint>
                  Klik peta untuk menaruh titik. Penanda bisa digeser untuk
                  memperbaiki posisi.
                </FieldHint>
              )}
            </div>

            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={useCurrentLocation}
                disabled={locating}
              >
                <NavigationIcon className="h-4 w-4" />
                {locating ? "Mencari lokasi…" : "Gunakan lokasi saya saat ini"}
              </Button>
            </div>

            {locationNotice ? (
              <p
                role="alert"
                className="rounded-card border border-warning-600/30 bg-warning-50 px-3.5 py-3 text-sm leading-relaxed text-warning-700"
              >
                {locationNotice}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="field-lat" className="text-xs text-ink-muted">
                  Latitude <span className="text-danger-700">*</span>
                </Label>
                <Input
                  id="field-lat"
                  name="lat"
                  inputMode="decimal"
                  value={values.lat}
                  onChange={(event) => update("lat", event.target.value)}
                  placeholder="-6.2088"
                  aria-invalid={errors.lat ? true : undefined}
                  aria-describedby={errors.lat ? "error-lat" : undefined}
                  className="h-11 bg-surface text-sm"
                  required
                />
                {errors.lat ? (
                  <FieldError id="error-lat">{errors.lat}</FieldError>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-lng" className="text-xs text-ink-muted">
                  Longitude <span className="text-danger-700">*</span>
                </Label>
                <Input
                  id="field-lng"
                  name="lng"
                  inputMode="decimal"
                  value={values.lng}
                  onChange={(event) => update("lng", event.target.value)}
                  placeholder="106.8456"
                  aria-invalid={errors.lng ? true : undefined}
                  aria-describedby={errors.lng ? "error-lng" : undefined}
                  className="h-11 bg-surface text-sm"
                  required
                />
                {errors.lng ? (
                  <FieldError id="error-lng">{errors.lng}</FieldError>
                ) : null}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-ink-muted">
              Lokasi perangkat hanya dipakai untuk mengisi titik peta, tidak
              disimpan terpisah.
            </p>
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
            description="Centang fasilitas yang tersedia di area tempat. Kamu bisa menambahkan catatan di deskripsi bila ada detail penting."
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
          aria-labelledby="step-photo"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <StepHeading
            id="step-photo"
            step={4}
            title="Foto"
            description="Foto membantu orang mengenali kondisi tempat dan jalur masuk. Upload belum aktif di versi UI ini."
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
            step={5}
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
              "Tandai titik peta sedekat mungkin dengan lokasi sebenarnya.",
              "Sertakan foto tempat dan jalur masuk jika memungkinkan.",
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
            Wajib: nama, kategori, deskripsi, dan titik peta.
          </p>
        </div>
      </aside>
    </form>
  );
}
