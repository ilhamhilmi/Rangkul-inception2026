"use client";

import {
  useActionState,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { LocationPicker } from "@/components/map/location-picker";
import { PhotoInput } from "@/components/places/photo-input";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  FieldError,
  FieldHint,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/field";
import {
  CheckIcon,
  InfoIcon,
  MapPinIcon,
  NavigationIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import { PLACE_PHOTO_MAX_COUNT } from "@/lib/constants/photos";
import { PLACE_CATEGORIES } from "@/lib/constants/places";
import { createPlacePostAction } from "@/server/places/actions";
import type { PlacePostFormState } from "@/lib/validation/post";

type FormValues = {
  name: string;
  category: string;
  description: string;
  lat: string;
  lng: string;
};

const initialValues: FormValues = {
  name: "",
  category: "",
  description: "",
  lat: "",
  lng: "",
};

const initialActionState: PlacePostFormState = { status: "idle" };

const errorTargets: Record<string, string> = {
  name: "field-name",
  category: "field-category",
  description: "field-description",
  photos: "field-photos",
  location: "field-lat",
  lat: "field-lat",
  longitude: "field-lng",
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

export function PostingForm({
  moderationEnabled = false,
}: {
  moderationEnabled?: boolean;
}) {
  const [state, formAction] = useActionState(
    createPlacePostAction,
    initialActionState,
  );
  const [isSubmitting, startTransition] = useTransition();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState<string | null>(null);

  const latitude = parseCoordinate(values.lat, -90, 90);
  const longitude = parseCoordinate(values.lng, -180, 180);

  const serverErrors: Record<string, string> = {};
  for (const [key, messages] of Object.entries(state.fieldErrors ?? {})) {
    const normalized = key === "latitude" ? "lat" : key === "longitude" ? "lng" : key;
    if (messages[0] && !serverErrors[normalized]) {
      serverErrors[normalized] = messages[0];
    }
  }

  const combinedErrors = { ...serverErrors, ...errors };
  const errorEntries = Object.entries(combinedErrors);
  const successKey =
    state.status === "success"
      ? `${state.result?.slug ?? ""}|${state.message ?? ""}`
      : null;
  const showSuccess = successKey !== null && successKey !== acknowledged;

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

  function validate() {
    const next: Record<string, string> = {};

    if (values.name.trim().length < 3) {
      next.name = "Nama tempat minimal 3 karakter.";
    }
    if (!values.category) next.category = "Pilih salah satu kategori.";
    if (values.description.trim().length < 40) {
      next.description =
        "Ceritakan tempatnya minimal 40 karakter agar kontribusi berguna.";
    }
    if (photos.length === 0) {
      next.photos = "Lampirkan minimal satu foto tempat.";
    } else if (photos.length > PLACE_PHOTO_MAX_COUNT) {
      next.photos = `Maksimal ${PLACE_PHOTO_MAX_COUNT} foto per postingan.`;
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

    const formData = new FormData(event.currentTarget);
    formData.delete("photos-input");
    formData.delete("photos");

    for (const photo of photos) {
      formData.append("photos", photo);
    }

    startTransition(() => {
      formAction(formData);
    });
  }

  function resetForm() {
    setValues(initialValues);
    setPhotos([]);
    setErrors({});
    setAcknowledged(successKey);
    setLocating(false);
    setLocationNotice(null);
  }

  if (showSuccess) {
    const result = state.result;
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
          {result?.tayang
            ? "Postinganmu sudah tayang"
            : "Postinganmu sudah dikirim"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {state.message}
        </p>

        <dl className="mt-5 grid gap-3 rounded-card border border-line bg-surface-muted/60 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-muted">Nama tempat</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {result?.name ?? values.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Kategori</dt>
            <dd className="mt-0.5 font-medium text-ink">{categoryLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Foto terlampir</dt>
            <dd className="mt-0.5 font-medium text-ink">{photos.length} foto</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Titik peta</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {values.lat}, {values.lng}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {result?.tayang ? (
            <ButtonLink href={`/jelajahi/${result.slug}`} size="md" className="flex-1">
              Lihat postingan
            </ButtonLink>
          ) : (
            <ButtonLink href="/jelajahi" size="md" className="flex-1">
              Lihat halaman jelajahi
            </ButtonLink>
          )}
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={resetForm}
            className="flex-1"
          >
            Bagikan tempat lain
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
        {state.status === "error" && state.message ? (
          <div
            role="alert"
            className="rounded-sheet border border-danger-600/30 bg-danger-50 p-4"
          >
            <p className="text-sm font-semibold text-danger-700">
              {state.message}
            </p>
          </div>
        ) : null}

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
            title="Ceritakan tempatnya"
            description="Mulai dari nama tempat, kategori, dan pengalaman aksesibilitas yang kamu temui."
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
                aria-invalid={combinedErrors.name ? true : undefined}
                aria-describedby={combinedErrors.name ? "error-name" : undefined}
                required
              />
              {combinedErrors.name ? (
                <FieldError id="error-name">{combinedErrors.name}</FieldError>
              ) : (
                <FieldHint>
                  Nama yang sama boleh diposting lebih dari sekali oleh pengguna
                  berbeda.
                </FieldHint>
              )}
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
                aria-invalid={combinedErrors.category ? true : undefined}
                aria-describedby={
                  combinedErrors.category ? "error-category" : undefined
                }
                required
              >
                <option value="">Pilih kategori</option>
                {PLACE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label} — {category.description}
                  </option>
                ))}
              </Select>
              {combinedErrors.category ? (
                <FieldError id="error-category">
                  {combinedErrors.category}
                </FieldError>
              ) : (
                <FieldHint>Pilih yang paling mendekati fungsi utama tempat.</FieldHint>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="field-description">
                  Cerita aksesibilitas <span className="text-danger-700">*</span>
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
                placeholder="Jelaskan jalur masuk, kondisi ramp, toilet, atau hal yang perlu diketahui pengunjung."
                aria-invalid={combinedErrors.description ? true : undefined}
                aria-describedby={
                  combinedErrors.description
                    ? "error-description"
                    : "hint-description"
                }
                rows={5}
                required
              />
              {combinedErrors.description ? (
                <FieldError id="error-description">
                  {combinedErrors.description}
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
          aria-labelledby="step-photos"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <StepHeading
            id="step-photos"
            step={2}
            title="Lampirkan foto"
            description="Foto membantu orang lain mengenali kondisi tempat dan pintu masuknya."
          />

          <PhotoInput
            files={photos}
            onChange={setPhotos}
            error={combinedErrors.photos}
          />
        </section>

        <section
          aria-labelledby="step-location"
          className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
        >
          <StepHeading
            id="step-location"
            step={3}
            title="Tandai lokasi"
            description="Klik peta atau geser penanda. Koordinat bisa diisi manual jika perlu."
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
              {combinedErrors.location ? (
                <FieldError id="error-location">
                  {combinedErrors.location}
                </FieldError>
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
                  aria-invalid={combinedErrors.lat ? true : undefined}
                  aria-describedby={combinedErrors.lat ? "error-lat" : undefined}
                  className="h-11 bg-surface text-sm"
                  required
                />
                {combinedErrors.lat ? (
                  <FieldError id="error-lat">{combinedErrors.lat}</FieldError>
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
                  aria-invalid={combinedErrors.lng ? true : undefined}
                  aria-describedby={combinedErrors.lng ? "error-lng" : undefined}
                  className="h-11 bg-surface text-sm"
                  required
                />
                {combinedErrors.lng ? (
                  <FieldError id="error-lng">{combinedErrors.lng}</FieldError>
                ) : null}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-ink-muted">
              Lokasi perangkat hanya dipakai untuk mengisi titik peta, tidak
              disimpan terpisah.
            </p>
          </div>
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
              "Gunakan bahasa yang sopan dan relevan dengan aksesibilitas.",
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
            {moderationEnabled ? "Moderasi otomatis" : "Langsung tayang"}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
            {moderationEnabled
              ? "Postingan diperiksa AI sebelum tayang. Yang aman langsung muncul di Jelajahi; yang meragukan ditahan untuk ditinjau."
              : "Postingan langsung muncul di Jelajahi setelah dikirim. Pastikan nama, cerita, foto, dan titik peta sudah benar."}
          </p>
          <Button type="submit" size="lg" className="mt-4 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Mengirim…" : "Kirim postingan"}
          </Button>
          <p className="mt-2 text-center text-xs text-ink-muted">
            Wajib login. Isian wajib: nama, kategori, cerita, foto, dan titik
            peta.
          </p>
        </div>
      </aside>
    </form>
  );
}
