"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/field";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setNotice(null);
      setError("Konfirmasi kata sandi belum sama. Periksa kembali.");
      return;
    }

    setError(null);
    setNotice("Autentikasi belum tersambung pada versi UI ini.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nama lengkap</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Nama kamu"
          required
        />
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
        />
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
          minLength={8}
          required
        />
        <FieldHint id="password-hint">
          Minimal 8 karakter. Gunakan kombinasi huruf dan angka.
        </FieldHint>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi kata sandi</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "confirm-password-error" : undefined}
          minLength={8}
          required
        />
        {error ? (
          <FieldError id="confirm-password-error">{error}</FieldError>
        ) : null}
      </div>

      <div className="flex items-start gap-2.5">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-line-strong accent-primary-600"
          required
        />
        <label htmlFor="terms" className="text-sm leading-5 text-ink-muted">
          Saya memahami bahwa data komunitas dan kegiatan akan diverifikasi
          admin sebelum tampil.
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
        Buat akun
      </Button>
    </form>
  );
}
