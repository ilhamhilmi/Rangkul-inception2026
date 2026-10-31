"use server";

import {
  EventStatus,
  Prisma,
  RegistrationStatus,
  UserRole,
  type Profile,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionError,
  type VolunteerActionResult,
  type VolunteerFieldErrors,
} from "@/lib/volunteer/action-state";
import {
  getLatestOrganizerVerification,
  canManageEvent,
} from "@/lib/volunteer/data";
import { prisma } from "@/lib/db/prisma";
import { getAuthorizedProfile } from "@/lib/auth/guards";
import {
  createSignedUploadUrl,
  STORAGE_BUCKETS,
  type StorageBucket,
} from "@/lib/supabase/storage";
import {
  eventFormSchema,
  organizerApplicationSchema,
  registrationSchema,
  registrationStatusSchema,
  uploadRequestSchema,
} from "@/lib/volunteer/schemas";

const uuidSchema = z.string().uuid();

function fieldErrorsFromZod(error: z.ZodError): VolunteerFieldErrors {
  const result: VolunteerFieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    result[key] ??= [];
    result[key].push(issue.message);
  }

  return result;
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function requireRole(roles: UserRole[]) {
  const result = await getAuthorizedProfile(roles);

  if (!result.allowed) {
    return {
      profile: null,
      error: actionError(
        result.reason === "UNAUTHENTICATED" ? "UNAUTHENTICATED" : "FORBIDDEN",
        result.reason === "UNAUTHENTICATED"
          ? "Silakan masuk terlebih dahulu."
          : "Akun ini tidak memiliki akses ke tindakan tersebut.",
      ),
    } as const;
  }

  return { profile: result.profile, error: null } as const;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || `kegiatan-${Date.now()}`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${Math.random().toString(36).slice(2, 6)}`;
    const candidate = `${base.slice(0, 80 - suffix.length)}${suffix}`;
    const existing = await prisma.volunteerEvent.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }

  return `${base.slice(0, 60)}-${Date.now().toString(36)}`;
}

function revalidateVolunteerPaths(slug?: string) {
  revalidatePath("/volunteer");
  revalidatePath("/dashboard/kegiatan");
  if (slug) revalidatePath(`/volunteer/${slug}`);
}

function mapMutationError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return actionError(
        "ALREADY_REGISTERED",
        "Data ini sudah pernah dibuat. Muat ulang halaman lalu coba lagi.",
      );
    }
    if (error.code === "P2034") {
      return actionError(
        "RETRY",
        "Permintaan bertabrakan dengan proses lain. Coba lagi.",
      );
    }
  }

  return actionError(
    "UNKNOWN",
    "Terjadi kesalahan. Coba lagi beberapa saat lagi.",
  );
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOCUMENT_TYPES = new Set([...IMAGE_TYPES, "application/pdf"]);

function extensionFor(contentType: string) {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "pdf";
  }
}

async function createUpload(
  profile: Profile,
  bucket: StorageBucket,
  prefix: string,
  input: unknown,
  allowedTypes: Set<string>,
) {
  const parsed = uploadRequestSchema.safeParse(input);

  if (!parsed.success) {
    return actionError(
      "VALIDATION",
      "File tidak valid. Gunakan JPEG, PNG, WebP, atau PDF maksimal 5 MB.",
      fieldErrorsFromZod(parsed.error),
    );
  }

  if (!allowedTypes.has(parsed.data.contentType)) {
    return actionError("VALIDATION", "Tipe file tidak diizinkan untuk unggahan ini.");
  }

  try {
    const path = `${prefix}/${profile.id}/${crypto.randomUUID()}.${extensionFor(
      parsed.data.contentType,
    )}`;
    const data = await createSignedUploadUrl(bucket, path);
    return {
      ok: true as const,
      data: { path, token: data.token, signedUrl: data.signedUrl },
    };
  } catch {
    return actionError(
      "CONFIG",
      "Fitur unggah belum siap. Hubungi admin: konfigurasi penyimpanan belum lengkap.",
    );
  }
}

export async function createEventCoverUploadAction(input: {
  fileName: string;
  contentType: string;
  size: number;
}): Promise<VolunteerActionResult<{ path: string; token: string; signedUrl: string }>> {
  const { profile, error } = await requireRole([UserRole.ORGANIZER, UserRole.ADMIN]);
  if (!profile) return error;

  return createUpload(
    profile,
    STORAGE_BUCKETS.eventCovers,
    "events",
    { ...input, contentType: input.contentType },
    IMAGE_TYPES,
  );
}

export async function createVerificationDocumentUploadAction(input: {
  fileName: string;
  contentType: string;
  size: number;
}): Promise<VolunteerActionResult<{ path: string; token: string; signedUrl: string }>> {
  const { profile, error } = await requireRole([]);
  if (!profile) return error;

  if (profile.role !== UserRole.USER) {
    return actionError("ALREADY_ORGANIZER", "Akun ini sudah memiliki akses penyelenggara.");
  }

  const pending = await prisma.verificationRequest.findFirst({
    where: { userId: profile.id, type: "ORGANIZER", status: "PENDING" },
    select: { id: true },
  });

  if (pending) {
    return actionError("ALREADY_PENDING", "Pengajuanmu masih menunggu verifikasi admin.");
  }

  return createUpload(
    profile,
    STORAGE_BUCKETS.verificationDocs,
    "organizer",
    { ...input, contentType: input.contentType },
    DOCUMENT_TYPES,
  );
}

// ---------------------------------------------------------------------------
// Pengajuan penyelenggara
// ---------------------------------------------------------------------------

export async function submitOrganizerApplicationAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ id: string }>> {
  const { profile, error } = await requireRole([]);
  if (!profile) return error;

  if (profile.role !== UserRole.USER) {
    return actionError("ALREADY_ORGANIZER", "Akun ini sudah memiliki akses penyelenggara.");
  }

  const parsed = organizerApplicationSchema.safeParse({
    organizationName: readString(formData, "organizationName"),
    contactName: readString(formData, "contactName"),
    phone: readString(formData, "phone"),
    city: readString(formData, "city"),
    province: readString(formData, "province"),
    experience: readString(formData, "experience"),
    documentPath: readString(formData, "documentPath"),
  });

  if (!parsed.success) {
    return actionError(
      "VALIDATION",
      "Periksa kembali data pengajuan.",
      fieldErrorsFromZod(parsed.error),
    );
  }

  const expectedPrefix = `organizer/${profile.id}/`;
  if (
    !parsed.data.documentPath.startsWith(expectedPrefix) ||
    parsed.data.documentPath.includes("..") ||
    !/^[a-zA-Z0-9._/-]+$/.test(parsed.data.documentPath)
  ) {
    return actionError("VALIDATION", "Dokumen verifikasi tidak valid.");
  }

  const latest = await getLatestOrganizerVerification(profile.id);
  if (latest?.status === "PENDING") {
    return actionError("ALREADY_PENDING", "Pengajuanmu masih menunggu verifikasi admin.");
  }

  try {
    const request = await prisma.$transaction(
      async (tx) => {
        const pending = await tx.verificationRequest.findFirst({
          where: {
            userId: profile.id,
            type: "ORGANIZER",
            status: "PENDING",
          },
          select: { id: true },
        });

        if (pending) return null;

        return tx.verificationRequest.create({
          data: {
            userId: profile.id,
            type: "ORGANIZER",
            status: "PENDING",
            documentUrl: parsed.data.documentPath,
            payload: {
              organizationName: parsed.data.organizationName,
              contactName: parsed.data.contactName,
              phone: parsed.data.phone,
              city: parsed.data.city,
              province: parsed.data.province,
              experience: parsed.data.experience,
            },
          },
          select: { id: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if (!request) {
      return actionError(
        "ALREADY_PENDING",
        "Pengajuanmu masih menunggu verifikasi admin.",
      );
    }

    revalidatePath("/volunteer/jadi-penyelenggara");
    revalidatePath("/dashboard/kegiatan");
    return { ok: true, data: { id: request.id } };
  } catch (mutationError) {
    if (
      mutationError instanceof Prisma.PrismaClientKnownRequestError &&
      mutationError.code === "P2002"
    ) {
      return actionError(
        "ALREADY_PENDING",
        "Pengajuanmu masih menunggu verifikasi admin.",
      );
    }
    return mapMutationError(mutationError);
  }
}

// ---------------------------------------------------------------------------
// Kegiatan
// ---------------------------------------------------------------------------

type EventNotificationRecipient = { userId: string };

function eventDetailsChanged(
  existing: {
    title: string;
    description: string;
    category: string;
    locationName: string;
    address: string;
    city: string;
    province: string;
    startsAt: Date;
    endsAt: Date;
    requirements: string | null;
    accessibilityNotes: string | null;
    slots: number;
    coverUrl: string | null;
    coverAlt: string | null;
  },
  next: {
    title: string;
    description: string;
    category: string;
    locationName: string;
    address: string;
    city: string;
    province: string;
    startsAt: Date;
    endsAt: Date;
    requirements: string | null;
    accessibilityNotes: string | null;
    slots: number;
    coverUrl: string | null;
    coverAlt: string | null;
  },
) {
  return (
    existing.title !== next.title ||
    existing.description !== next.description ||
    existing.category !== next.category ||
    existing.locationName !== next.locationName ||
    existing.address !== next.address ||
    existing.city !== next.city ||
    existing.province !== next.province ||
    existing.startsAt.getTime() !== next.startsAt.getTime() ||
    existing.endsAt.getTime() !== next.endsAt.getTime() ||
    existing.requirements !== next.requirements ||
    existing.accessibilityNotes !== next.accessibilityNotes ||
    existing.slots !== next.slots ||
    existing.coverUrl !== next.coverUrl ||
    existing.coverAlt !== next.coverAlt
  );
}

function eventUpdateNotifications(
  event: { id: string; slug: string; title: string },
  recipients: EventNotificationRecipient[],
  excludedUserIds: string[],
) {
  const excluded = new Set(excludedUserIds);
  const userIds = [
    ...new Set(
      recipients
        .map((recipient) => recipient.userId)
        .filter((userId) => !excluded.has(userId)),
    ),
  ];

  return userIds.map((userId) => ({
    userId,
    eventId: event.id,
    type: "EVENT_UPDATED" as const,
    title: "Detail kegiatan diperbarui",
    body: `Penyelenggara memperbarui detail kegiatan "${event.title}". Periksa jadwal, lokasi, dan informasi terbaru sebelum berangkat.`,
    href: `/volunteer/${event.slug}`,
  }));
}

export async function saveEventAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ id: string; slug: string }>> {
  const { profile, error } = await requireRole([UserRole.ORGANIZER, UserRole.ADMIN]);
  if (!profile) return error;

  const eventId = readString(formData, "eventId");
  if (eventId) {
    const parsedId = uuidSchema.safeParse(eventId);
    if (!parsedId.success) return actionError("VALIDATION", "ID kegiatan tidak valid.");
  }

  const parsed = eventFormSchema.safeParse({
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    category: readString(formData, "category"),
    locationName: readString(formData, "locationName"),
    address: readString(formData, "address"),
    city: readString(formData, "city"),
    province: readString(formData, "province"),
    startsAt: readString(formData, "startsAt"),
    endsAt: readString(formData, "endsAt"),
    requirements: readString(formData, "requirements"),
    accessibilityNotes: readString(formData, "accessibilityNotes"),
    slots: readString(formData, "slots"),
    coverUrl: readString(formData, "coverUrl"),
    coverAlt: readString(formData, "coverAlt"),
    intent: readString(formData, "intent") || "DRAFT",
  });

  if (!parsed.success) {
    return actionError(
      "VALIDATION",
      "Periksa kembali data kegiatan.",
      fieldErrorsFromZod(parsed.error),
    );
  }

  const data = parsed.data;
  const isStoragePath =
    data.coverUrl !== "" &&
    !data.coverUrl.startsWith("/") &&
    !/^https?:\/\//.test(data.coverUrl);

  if (
    isStoragePath &&
    (data.coverUrl.includes("..") ||
      !data.coverUrl.startsWith(`events/${profile.id}/`))
  ) {
    return actionError("VALIDATION", "Path cover kegiatan tidak valid.");
  }

  const baseData = {
    title: data.title,
    description: data.description,
    category: data.category,
    locationName: data.locationName,
    address: data.address,
    city: data.city,
    province: data.province,
    startsAt: new Date(data.startsAt),
    endsAt: new Date(data.endsAt),
    requirements: data.requirements || null,
    accessibilityNotes: data.accessibilityNotes || null,
    slots: data.slots,
    coverUrl: data.coverUrl || null,
    coverAlt: data.coverUrl ? data.coverAlt : null,
  };

  try {
    if (eventId) {
      const existing = await prisma.volunteerEvent.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          category: true,
          locationName: true,
          address: true,
          city: true,
          province: true,
          startsAt: true,
          endsAt: true,
          requirements: true,
          accessibilityNotes: true,
          slots: true,
          coverUrl: true,
          coverAlt: true,
          status: true,
          archivedAt: true,
          organizerId: true,
          registrations: {
            where: {
              status: {
                in: [RegistrationStatus.PENDING, RegistrationStatus.CONFIRMED],
              },
            },
            select: { userId: true },
          },
        },
      });

      if (!existing) return actionError("NOT_FOUND", "Kegiatan tidak ditemukan.");
      if (!canManageEvent(profile, existing)) {
        return actionError("FORBIDDEN", "Kamu hanya dapat mengubah kegiatan milikmu.");
      }
      if (existing.archivedAt) {
        return actionError("INVALID_STATUS", "Kegiatan yang diarsipkan tidak dapat diubah.");
      }

      const nextStatus =
        existing.status === EventStatus.DRAFT || existing.status === EventStatus.REJECTED
          ? data.intent
          : existing.status;

      const detailsChanged = eventDetailsChanged(existing, baseData);
      const shouldNotify =
        detailsChanged &&
        !existing.archivedAt &&
        (existing.status === EventStatus.PUBLISHED ||
          existing.status === EventStatus.CLOSED) &&
        existing.registrations.length > 0;

      const updated = await prisma.$transaction(async (tx) => {
        const saved = await tx.volunteerEvent.update({
          where: { id: eventId },
          data: { ...baseData, status: nextStatus },
          select: { id: true, slug: true, title: true },
        });

        if (shouldNotify) {
          const notifications = eventUpdateNotifications(
            saved,
            existing.registrations,
            [existing.organizerId, profile.id],
          );

          if (notifications.length > 0) {
            await tx.notification.createMany({ data: notifications });
          }
        }

        return saved;
      });

      revalidateVolunteerPaths(updated.slug);
      return { ok: true, data: { id: updated.id, slug: updated.slug } };
    }

    const slug = await uniqueSlug(data.title);
    const created = await prisma.volunteerEvent.create({
      data: {
        ...baseData,
        slug,
        organizerId: profile.id,
        status: data.intent,
        registeredCount: 0,
      },
      select: { id: true, slug: true },
    });

    revalidateVolunteerPaths(created.slug);
    return { ok: true, data: created };
  } catch (mutationError) {
    return mapMutationError(mutationError);
  }
}

async function loadOwnedEvent(eventId: string, profile: Profile) {
  const parsed = uuidSchema.safeParse(eventId);
  if (!parsed.success) return { event: null, error: actionError("VALIDATION", "ID kegiatan tidak valid.") };

  const event = await prisma.volunteerEvent.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      slug: true,
      status: true,
      archivedAt: true,
      organizerId: true,
    },
  });

  if (!event) return { event: null, error: actionError("NOT_FOUND", "Kegiatan tidak ditemukan.") };
  if (!canManageEvent(profile, event)) {
    return { event: null, error: actionError("FORBIDDEN", "Kamu hanya dapat mengelola kegiatan milikmu.") };
  }

  return { event, error: null } as const;
}

export async function submitEventAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ id: string }>> {
  const { profile, error } = await requireRole([UserRole.ORGANIZER, UserRole.ADMIN]);
  if (!profile) return error;

  const { event, error: loadError } = await loadOwnedEvent(readString(formData, "eventId"), profile);
  if (!event) return loadError;

  if (event.status !== EventStatus.DRAFT && event.status !== EventStatus.REJECTED) {
    return actionError("INVALID_STATUS", "Hanya draft atau kegiatan yang ditolak yang dapat diajukan.");
  }

  await prisma.volunteerEvent.update({
    where: { id: event.id },
    data: { status: EventStatus.PENDING },
  });

  revalidateVolunteerPaths(event.slug);
  return { ok: true, data: { id: event.id } };
}

export async function closeEventAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ id: string }>> {
  const { profile, error } = await requireRole([UserRole.ORGANIZER, UserRole.ADMIN]);
  if (!profile) return error;

  const { event, error: loadError } = await loadOwnedEvent(readString(formData, "eventId"), profile);
  if (!event) return loadError;

  if (event.status !== EventStatus.PUBLISHED) {
    return actionError("INVALID_STATUS", "Hanya kegiatan yang sudah terbit yang dapat ditutup.");
  }

  await prisma.volunteerEvent.update({
    where: { id: event.id },
    data: { status: EventStatus.CLOSED },
  });

  revalidateVolunteerPaths(event.slug);
  return { ok: true, data: { id: event.id } };
}

export async function archiveEventAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ id: string }>> {
  const { profile, error } = await requireRole([UserRole.ORGANIZER, UserRole.ADMIN]);
  if (!profile) return error;

  const { event, error: loadError } = await loadOwnedEvent(readString(formData, "eventId"), profile);
  if (!event) return loadError;

  if (event.archivedAt) {
    return { ok: true, data: { id: event.id } };
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.volunteerEvent.findUnique({
      where: { id: event.id },
      select: {
        id: true,
        slug: true,
        title: true,
        organizerId: true,
        registrations: {
          where: {
            status: {
              in: [RegistrationStatus.PENDING, RegistrationStatus.CONFIRMED],
            },
          },
          select: { userId: true },
        },
      },
    });

    if (!existing) return;

    await tx.volunteerEvent.update({
      where: { id: existing.id },
      data: { archivedAt: new Date() },
    });

    const userIds = [
      ...new Set(
        existing.registrations
          .map((registration) => registration.userId)
          .filter(
            (userId) =>
              userId !== existing.organizerId && userId !== profile.id,
          ),
      ),
    ];

    if (userIds.length > 0) {
      await tx.notification.createMany({
        data: userIds.map((userId) => ({
          userId,
          eventId: existing.id,
          type: "EVENT_ARCHIVED" as const,
          title: "Kegiatan diarsipkan",
          body: `Kegiatan "${existing.title}" telah diarsipkan oleh penyelenggara. Hubungi penyelenggara bila kamu masih membutuhkan informasi lanjutan.`,
          href: "/volunteer",
        })),
      });
    }
  });

  revalidateVolunteerPaths(event.slug);
  return { ok: true, data: { id: event.id } };
}

export async function cancelEventAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ id: string }>> {
  const { profile, error } = await requireRole([UserRole.ORGANIZER, UserRole.ADMIN]);
  if (!profile) return error;

  const { event, error: loadError } = await loadOwnedEvent(
    readString(formData, "eventId"),
    profile,
  );
  if (!event) return loadError;

  if (event.archivedAt || event.status === EventStatus.CANCELLED) {
    return { ok: true, data: { id: event.id } };
  }

  if (
    event.status !== EventStatus.PUBLISHED &&
    event.status !== EventStatus.CLOSED
  ) {
    return actionError(
      "INVALID_STATUS",
      "Hanya kegiatan terbit atau ditutup yang dapat dibatalkan.",
    );
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.volunteerEvent.findUnique({
      where: { id: event.id },
      select: {
        id: true,
        slug: true,
        title: true,
        organizerId: true,
        registrations: {
          where: {
            status: {
              in: [RegistrationStatus.PENDING, RegistrationStatus.CONFIRMED],
            },
          },
          select: { userId: true },
        },
      },
    });

    if (!existing) return;

    await tx.volunteerEvent.update({
      where: { id: existing.id },
      data: { status: EventStatus.CANCELLED },
    });

    await tx.eventRegistration.updateMany({
      where: {
        eventId: existing.id,
        status: {
          in: [RegistrationStatus.PENDING, RegistrationStatus.CONFIRMED],
        },
      },
      data: { status: RegistrationStatus.CANCELLED, cancelledAt: new Date() },
    });

    const userIds = [
      ...new Set(
        existing.registrations
          .map((registration) => registration.userId)
          .filter(
            (userId) =>
              userId !== existing.organizerId && userId !== profile.id,
          ),
      ),
    ];

    if (userIds.length > 0) {
      await tx.notification.createMany({
        data: userIds.map((userId) => ({
          userId,
          eventId: existing.id,
          type: "EVENT_CANCELLED" as const,
          title: "Kegiatan dibatalkan penyelenggara",
          body: `Kegiatan "${existing.title}" dibatalkan oleh penyelenggara. Pendaftaranmu ikut dibatalkan. Hubungi penyelenggara bila kamu masih membutuhkan informasi lanjutan.`,
          href: "/profil",
        })),
      });
    }
  });

  revalidateVolunteerPaths(event.slug);
  return { ok: true, data: { id: event.id } };
}

export async function deleteEventAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ id: string }>> {
  const { profile, error } = await requireRole([UserRole.ORGANIZER, UserRole.ADMIN]);
  if (!profile) return error;

  const { event, error: loadError } = await loadOwnedEvent(
    readString(formData, "eventId"),
    profile,
  );
  if (!event) return loadError;

  if (event.status !== EventStatus.CANCELLED) {
    return actionError(
      "INVALID_STATUS",
      "Hanya kegiatan yang sudah dibatalkan yang dapat dihapus.",
    );
  }

  // shortcut: file cover di storage tidak dihapus, bersihkan manual bila perlu.
  await prisma.volunteerEvent.delete({ where: { id: event.id } });

  revalidateVolunteerPaths(event.slug);
  revalidatePath("/profil");
  return { ok: true, data: { id: event.id } };
}

/** Titik integrasi untuk dashboard admin global. Jangan dipakai UI Volunteer. */
export async function adminModerateEventAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ id: string }>> {
  const { profile, error } = await requireRole([UserRole.ADMIN]);
  if (!profile) return error;

  const eventId = readString(formData, "eventId");
  const nextStatus = readString(formData, "status");
  const note = readString(formData, "note");
  const parsedId = uuidSchema.safeParse(eventId);
  const parsedStatus = z
    .enum(["PUBLISHED", "REJECTED", "PENDING"])
    .safeParse(nextStatus);

  if (!parsedId.success || !parsedStatus.success) {
    return actionError("VALIDATION", "Data moderasi tidak valid.");
  }

  if (parsedStatus.data === "REJECTED" && note.length < 3) {
    return actionError(
      "VALIDATION",
      "Tulis alasan penolakan minimal 3 karakter.",
    );
  }

  if (note.length > 500) {
    return actionError("VALIDATION", "Catatan moderasi maksimal 500 karakter.");
  }

  const event = await prisma.volunteerEvent.findUnique({
    where: { id: eventId },
    select: { id: true, slug: true, status: true, publishedAt: true },
  });

  if (!event) return actionError("NOT_FOUND", "Kegiatan tidak ditemukan.");

  if (
    (parsedStatus.data === "PUBLISHED" && event.status !== EventStatus.PENDING) ||
    (parsedStatus.data === "REJECTED" && event.status !== EventStatus.PENDING && event.status !== EventStatus.PUBLISHED)
  ) {
    return actionError("INVALID_STATUS", "Transisi status kegiatan tidak diizinkan.");
  }

  await prisma.volunteerEvent.update({
    where: { id: event.id },
    data: {
      status: parsedStatus.data,
      moderationNote: parsedStatus.data === "REJECTED" ? note : null,
      publishedAt:
        parsedStatus.data === "PUBLISHED" ? event.publishedAt ?? new Date() : event.publishedAt,
    },
  });

  revalidateVolunteerPaths(event.slug);
  revalidatePath("/admin");
  revalidatePath("/admin/kegiatan");
  return { ok: true, data: { id: event.id } };
}

// ---------------------------------------------------------------------------
// Pendaftaran peserta
// ---------------------------------------------------------------------------

export async function registerForEventAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ registrationId: string; status: RegistrationStatus }>> {
  const { profile, error } = await requireRole([]);
  if (!profile) return error;

  const eventId = readString(formData, "eventId");
  const parsedEventId = uuidSchema.safeParse(eventId);
  if (!parsedEventId.success) return actionError("VALIDATION", "ID kegiatan tidak valid.");

  const parsed = registrationSchema.safeParse({
    name: readString(formData, "name"),
    email: readString(formData, "email"),
    phone: readString(formData, "phone"),
    accessibilityNeeds: readString(formData, "accessibilityNeeds"),
  });

  if (!parsed.success) {
    return actionError(
      "VALIDATION",
      "Periksa kembali data pendaftaran.",
      fieldErrorsFromZod(parsed.error),
    );
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const locked = await tx.$queryRaw<
          Array<{
            id: string;
            slots: number;
            status: string;
            archived_at: Date | null;
            ends_at: Date;
            slug: string;
          }>
        >`
          SELECT id, slots, status::text AS status, archived_at, ends_at, slug
          FROM public.volunteer_events
          WHERE id = ${eventId}::uuid
          FOR UPDATE
        `;

        const event = locked[0];
        if (!event) return { error: actionError("NOT_FOUND", "Kegiatan tidak ditemukan.") } as const;

        if (event.status !== "PUBLISHED" || event.archived_at || event.ends_at <= new Date()) {
          return {
            error: actionError("EVENT_CLOSED", "Kegiatan ini sudah ditutup atau telah berakhir."),
          } as const;
        }

        const existing = await tx.eventRegistration.findUnique({
          where: { eventId_userId: { eventId, userId: profile.id } },
          select: { id: true, status: true },
        });

        if (existing && existing.status !== RegistrationStatus.CANCELLED) {
          return {
            error: actionError("ALREADY_REGISTERED", "Kamu sudah terdaftar pada kegiatan ini."),
          } as const;
        }

        const activeCount = await tx.eventRegistration.count({
          where: {
            eventId,
            status: { in: [RegistrationStatus.PENDING, RegistrationStatus.CONFIRMED] },
          },
        });

        if (activeCount >= event.slots) {
          return {
            error: actionError("FULL", "Kuota kegiatan ini sudah penuh."),
          } as const;
        }

        const payload = {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          accessibilityNeeds: parsed.data.accessibilityNeeds || null,
          status: RegistrationStatus.PENDING,
          cancelledAt: null,
        };

        const registration = existing
          ? await tx.eventRegistration.update({
              where: { id: existing.id },
              data: payload,
              select: { id: true, status: true },
            })
          : await tx.eventRegistration.create({
              data: { ...payload, eventId, userId: profile.id },
              select: { id: true, status: true },
            });

        return { registration, slug: event.slug } as const;
      },
      { timeout: 15000 },
    );

    if ("error" in result && result.error) return result.error;

    revalidateVolunteerPaths(result.slug);
    revalidatePath(`/dashboard/kegiatan/${eventId}/pendaftar`);
    return {
      ok: true,
      data: { registrationId: result.registration.id, status: result.registration.status },
    };
  } catch (mutationError) {
    return mapMutationError(mutationError);
  }
}

export async function cancelRegistrationAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ id: string }>> {
  const { profile, error } = await requireRole([]);
  if (!profile) return error;

  const eventId = readString(formData, "eventId");
  if (!uuidSchema.safeParse(eventId).success) {
    return actionError("VALIDATION", "ID kegiatan tidak valid.");
  }

  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId: profile.id } },
    select: { id: true, status: true },
  });

  if (!existing) return actionError("NOT_FOUND", "Pendaftaran tidak ditemukan.");
  if (existing.status === RegistrationStatus.CANCELLED) {
    return { ok: true, data: { id: existing.id } };
  }

  await prisma.eventRegistration.update({
    where: { id: existing.id },
    data: { status: RegistrationStatus.CANCELLED, cancelledAt: new Date() },
  });

  revalidateVolunteerPaths();
  revalidatePath(`/volunteer/${readString(formData, "slug")}`);
  return { ok: true, data: { id: existing.id } };
}

export async function updateRegistrationStatusAction(
  formData: FormData,
): Promise<VolunteerActionResult<{ id: string }>> {
  const { profile, error } = await requireRole([UserRole.ORGANIZER, UserRole.ADMIN]);
  if (!profile) return error;

  const registrationId = readString(formData, "registrationId");
  const parsedStatus = registrationStatusSchema.safeParse(readString(formData, "status"));

  if (!uuidSchema.safeParse(registrationId).success || !parsedStatus.success) {
    return actionError("VALIDATION", "Data pendaftaran tidak valid.");
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const registration = await tx.eventRegistration.findUnique({
          where: { id: registrationId },
          include: {
            event: { select: { id: true, slug: true, title: true, organizerId: true, slots: true } },
          },
        });

        if (!registration) {
          return { error: actionError("NOT_FOUND", "Pendaftaran tidak ditemukan.") } as const;
        }

        if (!canManageEvent(profile, registration.event)) {
          return {
            error: actionError("FORBIDDEN", "Kamu hanya dapat mengelola pendaftar kegiatan milikmu."),
          } as const;
        }

        if (registration.status === RegistrationStatus.CANCELLED) {
          return {
            error: actionError("INVALID_STATUS", "Pendaftaran yang dibatalkan tidak dapat diaktifkan kembali."),
          } as const;
        }

        if (parsedStatus.data === "CONFIRMED") {
          if (registration.status !== RegistrationStatus.PENDING) {
            return {
              error: actionError("INVALID_STATUS", "Hanya pendaftaran PENDING yang dapat dikonfirmasi."),
            } as const;
          }

          const locked = await tx.$queryRaw<Array<{ slots: number }>>`
            SELECT slots FROM public.volunteer_events WHERE id = ${registration.event.id}::uuid FOR UPDATE
          `;

          const confirmedCount = await tx.eventRegistration.count({
            where: {
              eventId: registration.event.id,
              status: RegistrationStatus.CONFIRMED,
            },
          });

          if (confirmedCount >= (locked[0]?.slots ?? registration.event.slots)) {
            return {
              error: actionError("FULL", "Kuota terkonfirmasi sudah penuh."),
            } as const;
          }
        }

        const updated = await tx.eventRegistration.update({
          where: { id: registration.id },
          data: {
            status: parsedStatus.data,
            cancelledAt: parsedStatus.data === "CANCELLED" ? new Date() : null,
          },
          select: { id: true },
        });

        if (parsedStatus.data === "CONFIRMED") {
          await tx.notification.create({
            data: {
              userId: registration.userId,
              eventId: registration.event.id,
              type: "REGISTRATION_CONFIRMED",
              title: "Pendaftaran volunteer dikonfirmasi",
              body: `Pendaftaranmu untuk kegiatan "${registration.event.title}" telah dikonfirmasi penyelenggara. Buka detail kegiatan untuk melihat informasi terbaru.`,
              href: `/volunteer/${registration.event.slug}`,
            },
          });
        }

        return { updated, slug: registration.event.slug, eventId: registration.event.id } as const;
      },
      { timeout: 15000 },
    );

    if ("error" in result && result.error) return result.error;

    revalidatePath(`/dashboard/kegiatan/${result.eventId}/pendaftar`);
    revalidatePath(`/volunteer/${result.slug}`);
    return { ok: true, data: { id: result.updated.id } };
  } catch (mutationError) {
    return mapMutationError(mutationError);
  }
}
