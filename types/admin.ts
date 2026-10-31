export type AdminLoginState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export type AdminActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };
