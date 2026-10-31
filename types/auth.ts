export type AuthFormState = {
  status: "idle" | "error" | "notice";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};
