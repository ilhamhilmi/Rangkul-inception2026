"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeAdminNextPath } from "@/lib/utils/redirect";
import type { AdminLoginState } from "@/types/admin";

const schema = z.object({
  email: z.string().trim().email("Format email belum benar."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

function toFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }

  return fieldErrors;
}

export async function adminSignInAction(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = schema.safeParse({
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
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return {
      status: "error",
      message: "Email atau kata sandi belum cocok. Coba lagi.",
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { id: data.user.id },
    select: { role: true },
  });

  if (profile?.role !== "ADMIN") {
    await supabase.auth.signOut();

    return {
      status: "error",
      message:
        "Akun ini tidak memiliki akses admin. Gunakan akun admin yang sudah terdaftar.",
    };
  }

  redirect(safeAdminNextPath(formData.get("next")));
}
