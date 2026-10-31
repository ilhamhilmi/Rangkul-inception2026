"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureProfileForAuthUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/env/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils/redirect";
import type { AuthFormState } from "@/types/auth";

const signInSchema = z.object({
  email: z.string().trim().email("Format email belum benar."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80),
  email: z.string().trim().email("Format email belum benar."),
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
  confirmPassword: z.string().min(8, "Konfirmasi kata sandi wajib diisi."),
  terms: z.literal(true, {
    error: "Kamu perlu menyetujui pernyataan sebelum mendaftar.",
  }),
});

function toFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }

  return fieldErrors;
}

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali email dan kata sandi.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: "error",
      message: "Email atau kata sandi belum cocok. Coba lagi.",
    };
  }

  redirect(safeNextPath(formData.get("next"), "/komunitas"));
}

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    terms: formData.get("terms") === "on",
  };

  const parsed = signUpSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali data pendaftaran.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return {
      status: "error",
      message: "Konfirmasi kata sandi belum sama.",
      fieldErrors: { confirmPassword: ["Konfirmasi kata sandi belum sama."] },
    };
  }

  const nextPath = safeNextPath(formData.get("next"), "/komunitas/daftar");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
      emailRedirectTo: `${publicEnv.siteUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) {
    const duplicate = error.message.toLowerCase().includes("already");
    return {
      status: "error",
      message: duplicate
        ? "Email ini sudah terdaftar. Silakan masuk."
        : "Pendaftaran belum berhasil. Coba lagi beberapa saat.",
    };
  }

  if (data.user && data.session) {
    await ensureProfileForAuthUser(data.user);
    redirect(nextPath);
  }

  return {
    status: "notice",
    message:
      "Akun dibuat. Cek email untuk mengonfirmasi, lalu masuk kembali ke Rangkul.",
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
