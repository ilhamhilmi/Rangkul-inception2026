"use client";

import { useActionState } from "react";

import { adminSignInAction } from "@/server/admin/auth-actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";
import { AlertIcon, ShieldCheckIcon } from "@/components/ui/icons";
import type { AdminLoginState } from "@/types/admin";

const initialState: AdminLoginState = { status: "idle" };

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, isPending] = useActionState(
    adminSignInAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />

      <div className="flex items-start gap-3 rounded-card border border-line bg-surface-muted/60 p-4 text-sm text-ink-muted">
        <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
        <p>
          Area ini hanya untuk admin Rangkul. Akun non-admin yang mencoba masuk
          akan otomatis dikeluarkan.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email admin</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@rangkul.id"
          required
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
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
          autoComplete="current-password"
          placeholder="Masukkan kata sandi admin"
          required
          aria-invalid={state.fieldErrors?.password ? true : undefined}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
        />
        {state.fieldErrors?.password?.[0] ? (
          <FieldError id="password-error">
            {state.fieldErrors.password[0]}
          </FieldError>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-input border border-danger-600/30 bg-danger-50 px-3.5 py-3 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? "Memeriksa akses..." : "Masuk ke dashboard admin"}
      </Button>
    </form>
  );
}
