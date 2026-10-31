"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function LoginForm() {
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Autentikasi belum tersambung pada versi UI ini.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          required
        />
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
        />
      </div>

      <div className="flex items-center gap-2.5">
        <input
          id="remember"
          name="remember"
          type="checkbox"
          className="h-4 w-4 rounded border-line-strong accent-primary-600"
        />
        <label htmlFor="remember" className="text-sm text-ink-muted">
          Ingat saya di perangkat ini
        </label>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-input border border-info-600/30 bg-info-50 px-3.5 py-3 text-sm text-info-700"
        >
          {notice}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full">
        Masuk
      </Button>
    </form>
  );
}
