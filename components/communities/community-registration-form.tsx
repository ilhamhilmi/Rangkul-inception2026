"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/field";
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
import { createCommunityAction } from "@/server/communities/actions";
import type { CommunityFormState } from "@/types/community";

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
  | "instagram"
  | "website"
  | "consent";

type FormErrors = Partial<Record<FieldKey, string>>;

const initialActionState: CommunityFormState = { status: "idle" };

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
  instagram: "instagram",
  website: "website",
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

export function CommunityRegistrationForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const [state, formAction, isPending] = useActionState(
    createCommunityAction,
    initialActionState,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [descriptionLength, setDescriptionLength] = useState(0);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const serverErrors: FormErrors = {};
  for (const [key, messages] of Object.entries(state.fieldErrors ?? {})) {
    if (messages[0]) serverErrors[key as FieldKey] = messages[0];
  }

  const combinedErrors: FormErrors = { ...serverErrors, ...errors };
  const errorCount = Object.keys(combinedErrors).length;

  useEffect(() => {
    if (state.status === "success") successHeadingRef.current?.focus();
  }, [state.status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    const channel = read("channel");
    if (!channel) {
      nextErrors.channel = "Tautan grup atau kanal wajib diisi.";
    } else if (!/^https?:\/\/\S+$/i.test(channel)) {
      nextErrors.channel = "Tulis tautan lengkap yang diawali https://";
    }

    const website = read("website");
    if (website && !/^https?:\/\/\S+$/i.test(website)) {
      nextErrors.website = "Tulis tautan lengkap yang diawali https://";
    }

    if (!data.get("consent")) {
      nextErrors.consent =
        "Kamu perlu menyetujui pernyataan verifikasi sebelum mengajukan.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      const firstError = (Object.keys(nextErrors) as FieldKey[])[0];
      const target = document.getElementById(focusTargets[firstError]);
      target?.focus();
      target?.scrollIntoView({ block: "center" });
    }
  }

  function clearError(key: FieldKey) {
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  }

  if (state.status === "success") {
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
          Pendaftaran diterima
        </h2>
        <p className="mt-2 max-w-xl leading-relaxed text-ink-muted">
          Terima kasih, {state.submittedName}. Data komunitasmu sudah masuk
          antrean verifikasi admin. Profil akan tampil di direktori setelah
          disetujui.
        </p>

        <ol className="mt-5 space-y-3 rounded-card border border-success-600/20 bg-surface p-4 text-sm">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
              1
            </span>
            <span className="text-ink-muted">
              Admin memeriksa data pengurus dan profil komunitas.
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

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/komunitas">Kembali ke direktori</ButtonLink>
          <ButtonLink href="/komunitas/daftar" variant="secondary">
            Daftarkan komunitas lain
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4"
    >
      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="rounded-card border border-danger-600/30 bg-danger-50 p-4 text-sm text-danger-700"
        >
          <p className="flex items-start gap-2">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.message}</span>
          </p>
        </div>
      ) : null}

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
              defaultValue={defaultName}
              placeholder="Nama kamu"
              required
              aria-invalid={combinedErrors.picName ? true : undefined}
              aria-describedby={describedBy(
                "picName-hint",
                combinedErrors.picName && "picName-error",
              )}
              onChange={() => clearError("picName")}
            />
            <FieldHint id="picName-hint">
              Nama orang yang bisa dihubungi admin.
            </FieldHint>
            {combinedErrors.picName ? (
              <FieldError id="picName-error">
                {combinedErrors.picName}
              </FieldError>
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
              aria-invalid={combinedErrors.picPhone ? true : undefined}
              aria-describedby={describedBy(
                "picPhone-hint",
                combinedErrors.picPhone && "picPhone-error",
              )}
              onChange={() => clearError("picPhone")}
            />
            <FieldHint id="picPhone-hint">
              Nomor aktif WhatsApp agar admin bisa menghubungi.
            </FieldHint>
            {combinedErrors.picPhone ? (
              <FieldError id="picPhone-error">
                {combinedErrors.picPhone}
              </FieldError>
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
            defaultValue={defaultEmail}
            placeholder="nama@email.com"
            required
            aria-invalid={combinedErrors.picEmail ? true : undefined}
            aria-describedby={describedBy(
              "picEmail-hint",
              combinedErrors.picEmail && "picEmail-error",
            )}
            onChange={() => clearError("picEmail")}
          />
          <FieldHint id="picEmail-hint">
            Email untuk korespondensi verifikasi dan kontak publik komunitas.
          </FieldHint>
          {combinedErrors.picEmail ? (
            <FieldError id="picEmail-error">
              {combinedErrors.picEmail}
            </FieldError>
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
            aria-invalid={combinedErrors.name ? true : undefined}
            aria-describedby={combinedErrors.name ? "name-error" : undefined}
            onChange={() => clearError("name")}
          />
          {combinedErrors.name ? (
            <FieldError id="name-error">{combinedErrors.name}</FieldError>
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
            maxLength={3000}
            onChange={(event) => {
              setDescriptionLength(event.currentTarget.value.length);
              clearError("description");
            }}
            aria-invalid={combinedErrors.description ? true : undefined}
            aria-describedby={describedBy(
              "description-hint",
              combinedErrors.description && "description-error",
            )}
          />
          <FieldHint id="description-hint">
            Minimal 40 karakter. {descriptionLength}/3000 karakter.
          </FieldHint>
          {combinedErrors.description ? (
            <FieldError id="description-error">
              {combinedErrors.description}
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
              aria-invalid={combinedErrors.province ? true : undefined}
              aria-describedby={
                combinedErrors.province ? "province-error" : undefined
              }
              onChange={() => clearError("province")}
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
            {combinedErrors.province ? (
              <FieldError id="province-error">
                {combinedErrors.province}
              </FieldError>
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
              aria-invalid={combinedErrors.city ? true : undefined}
              aria-describedby={combinedErrors.city ? "city-error" : undefined}
              onChange={() => clearError("city")}
            />
            {combinedErrors.city ? (
              <FieldError id="city-error">{combinedErrors.city}</FieldError>
            ) : null}
          </div>
        </div>

        <fieldset
          aria-invalid={combinedErrors.focus ? true : undefined}
          aria-describedby={
            combinedErrors.focus ? "focus-error" : "focus-hint"
          }
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
                  onChange={() => clearError("focus")}
                />
                {option}
              </label>
            ))}
          </div>
          {combinedErrors.focus ? (
            <FieldError id="focus-error">{combinedErrors.focus}</FieldError>
          ) : null}
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="channel">
            Tautan grup atau kanal
            <span className="ml-1 text-danger-700" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="channel"
            name="channel"
            type="url"
            inputMode="url"
            placeholder="https://chat.whatsapp.com/..."
            required
            aria-invalid={combinedErrors.channel ? true : undefined}
            aria-describedby={describedBy(
              "channel-hint",
              combinedErrors.channel && "channel-error",
            )}
            onChange={() => clearError("channel")}
          />
          <FieldHint id="channel-hint">
            Tautan lengkap grup atau kanal tempat anggota baru bergabung.
          </FieldHint>
          {combinedErrors.channel ? (
            <FieldError id="channel-error">
              {combinedErrors.channel}
            </FieldError>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram (opsional)</Label>
            <Input
              id="instagram"
              name="instagram"
              placeholder="@nama_komunitas"
              aria-invalid={combinedErrors.instagram ? true : undefined}
              aria-describedby={
                combinedErrors.instagram ? "instagram-error" : undefined
              }
              onChange={() => clearError("instagram")}
            />
            {combinedErrors.instagram ? (
              <FieldError id="instagram-error">
                {combinedErrors.instagram}
              </FieldError>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Situs web (opsional)</Label>
            <Input
              id="website"
              name="website"
              type="url"
              inputMode="url"
              placeholder="https://contoh.id"
              aria-invalid={combinedErrors.website ? true : undefined}
              aria-describedby={
                combinedErrors.website ? "website-error" : undefined
              }
              onChange={() => clearError("website")}
            />
            {combinedErrors.website ? (
              <FieldError id="website-error">
                {combinedErrors.website}
              </FieldError>
            ) : null}
          </div>
        </div>
      </FormSection>

      <FormSection
        step={3}
        title="Pernyataan pengurus"
        description="Pastikan data benar dan kamu berwenang mewakili komunitas."
      >
        <div className="flex items-start gap-2.5 rounded-input bg-surface-muted p-3.5 text-sm text-ink-muted">
          <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
          <p>
            Data pengurus dipakai admin untuk verifikasi. Email pengurus menjadi
            kontak publik komunitas, sedangkan nomor telepon tidak ditampilkan.
          </p>
        </div>

        <div>
          <div className="flex items-start gap-2.5">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-line-strong accent-primary-600"
              aria-invalid={combinedErrors.consent ? true : undefined}
              aria-describedby={
                combinedErrors.consent ? "consent-error" : undefined
              }
              onChange={() => clearError("consent")}
            />
            <label htmlFor="consent" className="text-sm leading-5 text-ink-muted">
              Saya menyatakan data ini benar dan bersedia dihubungi admin untuk
              verifikasi.
              <span className="ml-1 text-danger-700" aria-hidden="true">
                *
              </span>
            </label>
          </div>
          {combinedErrors.consent ? (
            <FieldError id="consent-error" className="mt-2">
              {combinedErrors.consent}
            </FieldError>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
            Pengajuan akan masuk antrean verifikasi admin sebelum tampil di
            direktori.
          </p>
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? "Mengirim..." : "Ajukan komunitas"}
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
