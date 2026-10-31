"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/components/ui/field";
import { CheckIcon, InfoIcon, UserIcon } from "@/components/ui/icons";
import { updateProfileAction } from "@/server/profiles/actions";
import type { ProfileFormState } from "@/types/profile";

const initialState: ProfileFormState = { status: "idle" };

export function ProfileForm({
  defaultName,
  defaultBio,
}: {
  defaultName: string;
  defaultBio: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [bioLength, setBioLength] = useState(defaultBio.length);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state.status, router]);

  const nameError = state.fieldErrors?.name?.[0];
  const bioError = state.fieldErrors?.bio?.[0];

  return (
    <section
      aria-labelledby="edit-profil"
      className="rounded-sheet border border-line bg-surface p-5 shadow-xs sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700"
        >
          <UserIcon className="h-5 w-5" />
        </span>
        <div>
          <h2
            id="edit-profil"
            className="text-lg font-semibold tracking-tight text-ink"
          >
            Edit profil
          </h2>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
            Nama tampil di postingan dan pendaftaran volunteermu. Bio membantu
            komunitas mengenalmu.
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-5 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="profile-name">
            Nama tampilan <span className="text-danger-700">*</span>
          </Label>
          <Input
            id="profile-name"
            name="name"
            defaultValue={defaultName}
            autoComplete="name"
            maxLength={80}
            required
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? "profile-name-error" : undefined}
          />
          {nameError ? (
            <FieldError id="profile-name-error">{nameError}</FieldError>
          ) : (
            <FieldHint>2–80 karakter, boleh nama panggilan.</FieldHint>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="profile-bio">Bio singkat</Label>
            <span className="text-xs text-ink-muted">
              {bioLength}/280 karakter
            </span>
          </div>
          <Textarea
            id="profile-bio"
            name="bio"
            defaultValue={defaultBio}
            maxLength={280}
            rows={4}
            placeholder="Ceritakan minatmu, komunitas yang kamu ikuti, atau pengalaman aksesibilitas."
            onChange={(event) => setBioLength(event.currentTarget.value.length)}
            aria-invalid={bioError ? true : undefined}
            aria-describedby={bioError ? "profile-bio-error" : "profile-bio-hint"}
          />
          {bioError ? (
            <FieldError id="profile-bio-error">{bioError}</FieldError>
          ) : (
            <FieldHint id="profile-bio-hint">
              Opsional. Jangan cantumkan nomor telepon atau alamat rumah.
            </FieldHint>
          )}
        </div>

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-input border border-danger-600/30 bg-danger-50 px-3.5 py-3 text-sm text-danger-700"
          >
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.message}</span>
          </p>
        ) : null}

        {state.status === "success" && state.message ? (
          <p
            role="status"
            className="flex items-start gap-2 rounded-input border border-success-600/30 bg-success-50 px-3.5 py-3 text-sm text-success-700"
          >
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.message}</span>
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Menyimpan…" : "Simpan profil"}
          </Button>
        </div>
      </form>
    </section>
  );
}
