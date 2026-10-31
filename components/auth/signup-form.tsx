"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/field";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";
import { signUpAction } from "@/server/auth/actions";
import type { AuthFormState } from "@/types/auth";

const initialState: AuthFormState = { status: "idle" };

export function SignupForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />

      <div className="space-y-2">
        <Label htmlFor="name">Nama lengkap</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Nama kamu"
          required
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
        />
        {state.fieldErrors?.name?.[0] ? (
          <FieldError id="name-error">{state.fieldErrors.name[0]}</FieldError>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          required
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
        />
        {state.fieldErrors?.email?.[0] ? (
          <FieldError id="email-error">{state.fieldErrors.email[0]}</FieldError>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Kata sandi</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Buat kata sandi"
          aria-describedby="password-hint"
          aria-invalid={state.fieldErrors?.password ? true : undefined}
          minLength={8}
          required
        />
        <FieldHint id="password-hint">
          Minimal 8 karakter. Gunakan kombinasi huruf dan angka.
        </FieldHint>
        {state.fieldErrors?.password?.[0] ? (
          <FieldError>{state.fieldErrors.password[0]}</FieldError>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi kata sandi</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          aria-invalid={state.fieldErrors?.confirmPassword ? true : undefined}
          aria-describedby={
            state.fieldErrors?.confirmPassword
              ? "confirm-password-error"
              : undefined
          }
          minLength={8}
          required
        />
        {state.fieldErrors?.confirmPassword?.[0] ? (
          <FieldError id="confirm-password-error">
            {state.fieldErrors.confirmPassword[0]}
          </FieldError>
        ) : null}
      </div>

      <div className="flex items-start gap-2.5">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-line-strong accent-primary-600"
          aria-invalid={state.fieldErrors?.terms ? true : undefined}
          aria-describedby={state.fieldErrors?.terms ? "terms-error" : undefined}
          required
        />
        <label htmlFor="terms" className="text-sm leading-5 text-ink-muted">
          Saya memahami bahwa data komunitas dan kegiatan akan diverifikasi
          admin sebelum tampil.
        </label>
      </div>
      {state.fieldErrors?.terms?.[0] ? (
        <FieldError id="terms-error">{state.fieldErrors.terms[0]}</FieldError>
      ) : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-input border border-danger-600/30 bg-danger-50 px-3.5 py-3 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </p>
      ) : null}

      {state.status === "notice" && state.message ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-input border border-success-600/30 bg-success-50 px-3.5 py-3 text-sm text-success-700"
        >
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Membuat akun..." : "Buat akun"}
      </Button>
    </form>
  );
}
