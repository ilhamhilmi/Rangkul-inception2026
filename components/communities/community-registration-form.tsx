"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/field";
import { FileField } from "@/components/ui/file-field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertIcon,
  CheckIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import {
  communityFocusOptions,
  communityProvinceOptions,
} from "@/lib/constants/communities";

type FieldKey =
  | "picName"
  | "picPhone"
  | "picEmail"
  | "name"
  | "description"
  | "province"
  | "city"
  | "focus"
  | "channel"
  | "ktp"
  | "consent";

type FormErrors = Partial<Record<FieldKey, string>>;

const focusTargets: Record<FieldKey, string> = {
  picName: "picName",
  picPhone: "picPhone",
  picEmail: "picEmail",
  name: "name",
  description: "description",
  province: "province",
  city: "city",
  focus: "fokus-0",
  channel: "channel",
  ktp: "ktp",
  consent: "consent",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function describedBy(...ids: Array<string | false | undefined>) {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6">
      <div className="flex items-start gap-3 border-b border-line pb-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-700 text-sm font-semibold text-white">
          {step}
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function CommunityRegistrationForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [descriptionLength, setDescriptionLength] = useState(0);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const errorCount = Object.keys(errors).length;

  useEffect(() => {
    if (submitted) successHeadingRef.current?.focus();
  }, [submitted]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (key: string) => String(data.get(key) ?? "").trim();

    const nextErrors: FormErrors = {};

    const picName = read("picName");
    if (!picName) {
      nextErrors.picName = "Nama pengurus wajib diisi.";
    }

    const picPhone = read("picPhone");
    const phoneDigits = picPhone.replace(/\D/g, "");
    if (!picPhone) {
      nextErrors.picPhone = "Nomor telepon wajib diisi.";
    } else if (
      phoneDigits.length < 9 ||
      phoneDigits.length > 15 ||
      !/^(0|62)/.test(phoneDigits)
    ) {
      nextErrors.picPhone =
        "Gunakan nomor Indonesia yang valid, misalnya 0812-3456-7890.";
    }

    const picEmail = read("picEmail");
    if (!picEmail) {
      nextErrors.picEmail = "Email wajib diisi.";
    } else if (!emailPattern.test(picEmail)) {
      nextErrors.picEmail = "Format email belum benar, misalnya nama@email.com.";
    }

    const name = read("name");
    if (!name) {
      nextErrors.name = "Nama komunitas wajib diisi.";
    } else if (name.length < 3) {
      nextErrors.name = "Nama komunitas minimal 3 karakter.";
    }

    const description = read("description");
    if (!description) {
      nextErrors.description = "Deskripsi komunitas wajib diisi.";
    } else if (description.length < 40) {
      nextErrors.description = "Deskripsi minimal 40 karakter.";
    }

    if (!read("province")) {
      nextErrors.province = "Pilih provinsi komunitas.";
    }

    if (!read("city")) {
      nextErrors.city = "Kota atau kabupaten wajib diisi.";
    }

    if (data.getAll("focus").length === 0) {
      nextErrors.focus = "Pilih minimal satu fokus komunitas.";
    }

    if (!read("channel")) {
      nextErrors.channel = "Nama grup WA atau saluran wajib diisi.";
    }

    const ktpInput = form.elements.namedItem("ktp");
    const ktpFiles =
      ktpInput instanceof HTMLInputElement ? ktpInput.files : null;
    if (!ktpFiles || ktpFiles.length === 0) {
      nextErrors.ktp = "Foto KTP wajib diunggah untuk verifikasi.";
    }

    if (!data.get("consent")) {
      nextErrors.consent =
        "Kamu perlu menyetujui pernyataan verifikasi sebelum mengajukan.";
    }

    setErrors(nextErrors);

    const firstError = (Object.keys(nextErrors) as FieldKey[])[0];
    if (firstError) {
      const target = document.getElementById(focusTargets[firstError]);
      target?.focus();
      target?.scrollIntoView({ block: "center" });
      return;
    }

    setSubmittedName(name);
    setSubmitted(true);
  }

  function clearError(key: FieldKey) {
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  function handleReset() {
    setErrors({});
    setSubmitted(false);
    setSubmittedName("");
    setDescriptionLength(0);
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-sheet border border-success-600/30 bg-success-50 p-6 shadow-xs sm:p-8"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-surface text-success-700 shadow-xs">
          <CheckIcon className="h-7 w-7" />
        </span>

        <h2
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-5 text-2xl font-bold tracking-tight text-ink outline-none"
        >
          Pendaftaran diterima (simulasi)
        </h2>
        <p className="mt-2 max-w-xl leading-relaxed text-ink-muted">
          Terima kasih, {submittedName}. Data komunitasmu akan diperiksa admin
          sebelum tampil di direktori publik.
        </p>

        <ol className="mt-5 space-y-3 rounded-card border border-success-600/20 bg-surface p-4 text-sm">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
              1
            </span>
            <span className="text-ink-muted">
              Admin memeriksa data pengurus, profil komunitas, dan foto KTP.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
              2
            </span>
            <span className="text-ink-muted">
              Kamu akan dihubungi lewat email atau WhatsApp bila ada data yang
              perlu dilengkapi.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
              3
            </span>
            <span className="text-ink-muted">
              Setelah disetujui, profil komunitas tampil di direktori dan bisa
              menerima anggota baru.
            </span>
          </li>
        </ol>

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" />
          Catatan: pengiriman data belum tersambung pada versi UI ini. Tidak ada
          data yang benar-benar dikirim atau disimpan.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/komunitas">Kembali ke direktori</ButtonLink>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Isi formulir lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errorCount > 0 ? (
        <div
          role="alert"
          className="rounded-card border border-danger-600/30 bg-danger-50 p-4 text-sm text-danger-700"
        >
          <p className="flex items-start gap-2">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Formulir belum lengkap. Periksa {errorCount} kolom yang ditandai
              di bawah.
            </span>
          </p>
        </div>
      ) : null}

      <FormSection
        step={1}
        title="Data pengurus"
        description="Kami memakai data ini untuk menghubungi penanggung jawab komunitas."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="picName">
              Nama lengkap pengurus
              <span className="ml-1 text-danger-700" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id="picName"
              name="picName"
              autoComplete="name"
              placeholder="Nama kamu"
              required
              aria-invalid={errors.picName ? true : undefined}
              aria-describedby={describedBy(
                "picName-hint",
                errors.picName && "picName-error",
              )}
            />
            <FieldHint id="picName-hint">
              Nama orang yang bisa dihubungi admin.
            </FieldHint>
            {errors.picName ? (
              <FieldError id="picName-error">{errors.picName}</FieldError>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="picPhone">
              Nomor telepon
              <span className="ml-1 text-danger-700" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id="picPhone"
              name="picPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0812-3456-7890"
              required
              aria-invalid={errors.picPhone ? true : undefined}
              aria-describedby={describedBy(
                "picPhone-hint",
                errors.picPhone && "picPhone-error",
              )}
            />
            <FieldHint id="picPhone-hint">
              Nomor aktif WhatsApp agar admin bisa menghubungi.
            </FieldHint>
            {errors.picPhone ? (
              <FieldError id="picPhone-error">{errors.picPhone}</FieldError>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="picEmail">
            Email
            <span className="ml-1 text-danger-700" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="picEmail"
            name="picEmail"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            required
            aria-invalid={errors.picEmail ? true : undefined}
            aria-describedby={describedBy(
              "picEmail-hint",
              errors.picEmail && "picEmail-error",
            )}
          />
          <FieldHint id="picEmail-hint">
            Email untuk korespondensi verifikasi.
          </FieldHint>
          {errors.picEmail ? (
            <FieldError id="picEmail-error">{errors.picEmail}</FieldError>
          ) : null}
        </div>
      </FormSection>

      <FormSection
        step={2}
        title="Profil komunitas"
        description="Informasi ini akan tampil di direktori setelah diverifikasi admin."
      >
        <div className="space-y-2">
          <Label htmlFor="name">
            Nama komunitas
            <span className="ml-1 text-danger-700" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Contoh: Gerak Bersama"
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name ? (
            <FieldError id="name-error">{errors.name}</FieldError>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Deskripsi komunitas
            <span className="ml-1 text-danger-700" aria-hidden="true">
              *
            </span>
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Ceritakan siapa yang kamu dampingi, kegiatan rutin, dan hal yang membuat komunitas ini unik."
            required
            maxLength={600}
            onChange={(event) =>
              setDescriptionLength(event.currentTarget.value.length)
            }
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={describedBy(
              "description-hint",
              errors.description && "description-error",
            )}
          />
          <FieldHint id="description-hint">
            Minimal 40 karakter. {descriptionLength}/600 karakter.
          </FieldHint>
          {errors.description ? (
            <FieldError id="description-error">
              {errors.description}
            </FieldError>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="province">
              Provinsi
              <span className="ml-1 text-danger-700" aria-hidden="true">
                *
              </span>
            </Label>
            <Select
              id="province"
              name="province"
              defaultValue=""
              required
              aria-invalid={errors.province ? true : undefined}
              aria-describedby={errors.province ? "province-error" : undefined}
            >
              <option value="" disabled>
                Pilih provinsi
              </option>
              {communityProvinceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            {errors.province ? (
              <FieldError id="province-error">{errors.province}</FieldError>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">
              Kota atau kabupaten
              <span className="ml-1 text-danger-700" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id="city"
              name="city"
              autoComplete="address-level2"
              placeholder="Contoh: Bandung"
              required
              aria-invalid={errors.city ? true : undefined}
              aria-describedby={errors.city ? "city-error" : undefined}
            />
            {errors.city ? (
              <FieldError id="city-error">{errors.city}</FieldError>
            ) : null}
          </div>
        </div>

        <fieldset
          aria-invalid={errors.focus ? true : undefined}
          aria-describedby={errors.focus ? "focus-error" : "focus-hint"}
        >
          <legend className="text-sm font-medium text-ink">
            Fokus komunitas
            <span className="ml-1 text-danger-700" aria-hidden="true">
              *
            </span>
          </legend>
          <p id="focus-hint" className="mt-1 text-sm text-ink-muted">
            Pilih minimal satu, boleh lebih dari satu.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {communityFocusOptions.map((option, index) => (
              <label
                key={option}
                htmlFor={`fokus-${index}`}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-input border border-line-strong/60 bg-surface px-3 py-2.5 text-sm text-ink has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
              >
                <input
                  id={`fokus-${index}`}
                  name="focus"
                  type="checkbox"
                  value={option}
                  className="h-4 w-4 shrink-0 rounded border-line-strong accent-primary-600"
                />
                {option}
              </label>
            ))}
          </div>
          {errors.focus ? (
            <FieldError id="focus-error">{errors.focus}</FieldError>
          ) : null}
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="channel">
            Grup WA atau saluran
            <span className="ml-1 text-danger-700" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="channel"
            name="channel"
            placeholder="Tautan grup atau @nama_saluran"
            required
            aria-invalid={errors.channel ? true : undefined}
            aria-describedby={describedBy(
              "channel-hint",
              errors.channel && "channel-error",
            )}
          />
          <FieldHint id="channel-hint">
            Tautan grup atau nama saluran tempat anggota baru bergabung.
          </FieldHint>
          {errors.channel ? (
            <FieldError id="channel-error">{errors.channel}</FieldError>
          ) : null}
        </div>
      </FormSection>

      <FormSection
        step={3}
        title="Verifikasi dan media"
        description="KTP hanya dilihat admin. Sampul akan tampil di kartu komunitas."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <FileField
            id="ktp"
            name="ktp"
            label="Foto KTP pengurus"
            required
            hint="Digunakan hanya untuk verifikasi admin, tidak ditampilkan di profil publik."
            error={errors.ktp}
            onFileChange={() => clearError("ktp")}
          />

          <FileField
            id="cover"
            name="cover"
            label="Sampul komunitas"
            hint="Tampil sebagai sampul di direktori. Rasio mendatar paling optimal."
          />
        </div>

        <div className="flex items-start gap-2.5 rounded-input bg-surface-muted p-3.5 text-sm text-ink-muted">
          <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
          <p>
            Data KTP disimpan terbatas untuk verifikasi. Jangan mengunggah foto
            KTP orang lain tanpa izin.
          </p>
        </div>

        <div>
          <div className="flex items-start gap-2.5">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-line-strong accent-primary-600"
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={
                errors.consent ? "consent-error" : undefined
              }
            />
            <label htmlFor="consent" className="text-sm leading-5 text-ink-muted">
              Saya menyatakan data ini benar dan bersedia dihubungi admin untuk
              verifikasi.
              <span className="ml-1 text-danger-700" aria-hidden="true">
                *
              </span>
            </label>
          </div>
          {errors.consent ? (
            <FieldError id="consent-error" className="mt-2">
              {errors.consent}
            </FieldError>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
            Pengajuan akan masuk antrean verifikasi admin sebelum tampil di
            direktori.
          </p>
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Ajukan komunitas
          </Button>
        </div>
      </FormSection>

      <p className="text-center text-sm text-ink-muted">
        Sudah punya akun?{" "}
        <Link
          href="/masuk"
          className="font-semibold text-primary-700 underline-offset-4 hover:text-primary-800 hover:underline"
        >
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
