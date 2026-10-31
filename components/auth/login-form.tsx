"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";
import { AlertIcon, CheckIcon } from "@/components/ui/icons";
import { signInAction } from "@/server/auth/actions";
import type { AuthFormState } from "@/types/auth";

const initialState: AuthFormState = { status: "idle" };

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />

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
          autoComplete="current-password"
          placeholder="Masukkan kata sandi"
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
        {isPending ? "Memeriksa..." : "Masuk"}
      </Button>
    </form>
  );
}
