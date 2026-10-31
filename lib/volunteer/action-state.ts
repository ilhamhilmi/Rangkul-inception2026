export type VolunteerFieldErrors = Record<string, string[]>;

export type VolunteerActionCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "ALREADY_REGISTERED"
  | "ALREADY_PENDING"
  | "ALREADY_ORGANIZER"
  | "FULL"
  | "EVENT_CLOSED"
  | "INVALID_STATUS"
  | "CONFIG"
  | "RETRY"
  | "UNKNOWN";

export type VolunteerActionResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: VolunteerActionCode;
      message: string;
      fieldErrors?: VolunteerFieldErrors;
    };

export function actionError(
  code: VolunteerActionCode,
  message: string,
  fieldErrors?: VolunteerFieldErrors,
): VolunteerActionResult<never> {
  return { ok: false, code, message, fieldErrors };
}
