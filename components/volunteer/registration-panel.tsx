"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { RegistrationStatus } from "@prisma/client";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AccessibilityIcon,
  CheckIcon,
  InfoIcon,
  UsersIcon,
} from "@/components/ui/icons";
import {
  cancelRegistrationAction,
  registerForEventAction,
} from "@/lib/volunteer/actions";
import { REGISTRATION_STATUS_META } from "@/lib/volunteer/status";
import type { VolunteerFieldErrors } from "@/lib/volunteer/action-state";

type RegistrationPanelProps = {
  eventId: string;
  slug: string;
  eventTitle: string;
  isAuthenticated: boolean;
  registrationStatus: RegistrationStatus | null;
  isOpen: boolean;
  isFull: boolean;
  defaults: { name: string; email: string };
};

export function RegistrationPanel({
  eventId,
  slug,
  eventTitle,
  isAuthenticated,
  registrationStatus,
  isOpen,
  isFull,
  defaults,
}: RegistrationPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<VolunteerFieldErrors>({});

  const activeRegistration =
    registrationStatus === "PENDING" || registrationStatus === "CONFIRMED";

  function handleRegister(formData: FormData) {
    setMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await registerForEventAction(formData);

      if (!result.ok) {
        setMessage(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setMessage(
        "Pendaftaran diterima. Status awal adalah menunggu konfirmasi penyelenggara.",
      );
      router.refresh();
    });
  }

  function handleCancel(formData: FormData) {
    setMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await cancelRegistrationAction(formData);

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      setMessage("Pendaftaranmu sudah dibatalkan.");
      router.refresh();
    });
  }

  return (
    <section
      aria-labelledby="pendaftaran-title"
      className="rounded-card border border-line bg-surface p-5 shadow-xs sm:p-6"
    >
      <h2
        id="pendaftaran-title"
        className="text-lg font-semibold tracking-tight text-ink"
      >
        Pendaftaran volunteer
      </h2>

      {!isAuthenticated ? (
        <div className="mt-3">
          <p className="text-sm leading-relaxed text-ink-muted">
            Masuk ke akun Rangkul untuk mendaftar sebagai volunteer pada{" "}
            <span className="font-medium text-ink">{eventTitle}</span>.
          </p>
          <ButtonLink
            href={`/masuk?next=/volunteer/${slug}`}
            size="md"
            className="mt-4"
          >
            Masuk untuk mendaftar
          </ButtonLink>
        </div>
      ) : activeRegistration && registrationStatus ? (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={REGISTRATION_STATUS_META[registrationStatus].tone}>
              {REGISTRATION_STATUS_META[registrationStatus].label}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {REGISTRATION_STATUS_META[registrationStatus].description}
          </p>
          <p className="mt-3 flex items-start gap-2 rounded-input bg-surface-muted p-3.5 text-xs leading-relaxed text-ink-muted">
            <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-700" />
            Pembatalan bersifat final. Kamu dapat mendaftar ulang selama kuota
            masih tersedia.
          </p>
          <form action={handleCancel} className="mt-4">
            <input type="hidden" name="eventId" value={eventId} />
            <input type="hidden" name="slug" value={slug} />
            <Button
              type="submit"
              variant="secondary"
              size="md"
              disabled={isPending}
            >
              {isPending ? "Memproses…" : "Batalkan pendaftaran"}
            </Button>
          </form>
        </div>
      ) : !isOpen ? (
        <p className="mt-3 rounded-input bg-surface-muted p-3.5 text-sm leading-relaxed text-ink-muted">
          Pendaftaran untuk kegiatan ini sudah ditutup.
        </p>
      ) : isFull ? (
        <p className="mt-3 flex items-start gap-2 rounded-input bg-warning-50 p-3.5 text-sm leading-relaxed text-ink-muted">
          <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning-700" />
          Kuota kegiatan ini sudah penuh. Pantau kembali bila ada peserta yang
          membatalkan pendaftaran.
        </p>
      ) : (
        <form action={handleRegister} className="mt-4 space-y-4">
          <input type="hidden" name="eventId" value={eventId} />

          <div className="space-y-2">
            <Label htmlFor="registration-name">Nama lengkap</Label>
            <Input
              id="registration-name"
              name="name"
              autoComplete="name"
              defaultValue={defaults.name}
              required
              aria-invalid={fieldErrors.name ? true : undefined}
            />
            {fieldErrors.name ? (
              <FieldError>{fieldErrors.name[0]}</FieldError>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration-email">Email</Label>
            <Input
              id="registration-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={defaults.email}
              required
              aria-invalid={fieldErrors.email ? true : undefined}
            />
            {fieldErrors.email ? (
              <FieldError>{fieldErrors.email[0]}</FieldError>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration-phone">Nomor telepon</Label>
            <Input
              id="registration-phone"
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
            <Label htmlFor="registration-accessibility">
              Kebutuhan aksesibilitas
            </Label>
            <Textarea
              id="registration-accessibility"
              name="accessibilityNeeds"
              rows={3}
              placeholder="Contoh: pengguna kursi roda, membutuhkan juru bahasa isyarat, atau kebutuhan lain."
              aria-describedby="registration-accessibility-hint"
              aria-invalid={
                fieldErrors.accessibilityNeeds ? true : undefined
              }
            />
            <FieldHint id="registration-accessibility-hint">
              Informasi ini hanya dibagikan kepada penyelenggara agar kebutuhanmu
              dapat dipersiapkan.
            </FieldHint>
            {fieldErrors.accessibilityNeeds ? (
              <FieldError>{fieldErrors.accessibilityNeeds[0]}</FieldError>
            ) : null}
          </div>

          <p className="flex items-start gap-2 rounded-input bg-primary-50 p-3.5 text-xs leading-relaxed text-primary-900">
            <AccessibilityIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Jumlah peserta pada halaman ini hanya menghitung pendaftaran yang
            sudah dikonfirmasi penyelenggara.
          </p>

          {message ? (
            <p role="alert" className="text-sm text-danger-700">
              {message}
            </p>
          ) : null}

          <Button type="submit" size="md" disabled={isPending}>
            <CheckIcon className="h-4 w-4" />
            {isPending ? "Mengirim pendaftaran…" : "Daftar sebagai volunteer"}
          </Button>
        </form>
      )}

      {isAuthenticated && message ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-4 rounded-input border border-line bg-surface-muted p-3.5 text-sm leading-relaxed text-ink"
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
