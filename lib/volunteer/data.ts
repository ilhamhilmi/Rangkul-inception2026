import "server-only";

import {
  EventStatus,
  type Prisma,
  type Profile,
  RegistrationStatus,
  UserRole,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { getPublicEnv } from "@/lib/env";
import { categoryLabel } from "@/lib/volunteer/categories";
import type { VolunteerEvent } from "@/types/volunteer";

const DEFAULT_COVER = "/images/volunteer/event-1.svg";

const publicEventInclude = {
  organizer: {
    select: { id: true, name: true, avatarUrl: true, role: true },
  },
} satisfies Prisma.VolunteerEventInclude;

export type PublicEventRecord = Prisma.VolunteerEventGetPayload<{
  include: typeof publicEventInclude;
}>;

const managedEventInclude = {
  organizer: {
    select: { id: true, name: true, email: true },
  },
  _count: {
    select: {
      registrations: {
        where: { status: RegistrationStatus.CONFIRMED },
      },
    },
  },
} satisfies Prisma.VolunteerEventInclude;

export type ManagedEventRecord = Prisma.VolunteerEventGetPayload<{
  include: typeof managedEventInclude;
}>;

export const PUBLIC_EVENT_WHERE = {
  status: EventStatus.PUBLISHED,
  archivedAt: null,
} satisfies Prisma.VolunteerEventWhereInput;

/** URL publik untuk cover. Nilai yang disimpan boleh berupa path storage. */
export function coverUrlFor(value: string | null | undefined) {
  if (!value) return DEFAULT_COVER;
  if (/^https?:\/\//.test(value) || value.startsWith("/")) return value;

  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const encodedPath = value
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-covers/${encodedPath}`;
}

export function toVolunteerEvent(event: PublicEventRecord): VolunteerEvent {
  return {
    slug: event.slug,
    title: event.title,
    category: categoryLabel(event.category),
    city: event.city,
    location: event.locationName,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    organizer: event.organizer.name,
    registeredCount: event.registeredCount,
    slots: event.slots,
    description: event.description,
    requirements: event.requirements ?? "",
    accessibilityNotes: event.accessibilityNotes ?? "",
    coverImage: coverUrlFor(event.coverUrl),
    coverAlt: event.coverAlt ?? `Ilustrasi kegiatan ${event.title}`,
  };
}

export type PublishedEventsResult =
  | { status: "ready"; events: VolunteerEvent[] }
  | { status: "unavailable" }
  | { status: "error" };

/**
 * Cek keberadaan tabel Volunteer sebelum query. Tujuannya agar database
 * bersama yang belum menerapkan migration Volunteer tidak menghasilkan
 * Prisma error/stack trace, dan halaman dapat menampilkan pesan yang tepat.
 */
export async function isVolunteerSchemaReady() {
  // `to_regclass` mengembalikan NULL bila tabel belum ada, sehingga tabel yang
  // belum dimigrasikan tidak melempar error. Error koneksi/query sengaja
  // dibiarkan naik agar halaman membedakannya dari "migration belum diterapkan".
  const rows = await prisma.$queryRaw<
    Array<{ events: string | null; registrations: string | null }>
  >`SELECT
      to_regclass('public.volunteer_events')::text AS events,
      to_regclass('public.event_registrations')::text AS registrations`;

  const row = rows[0];
  return Boolean(row?.events && row?.registrations);
}

export async function listPublishedEvents(): Promise<PublishedEventsResult> {
  if (!(await isVolunteerSchemaReady())) {
    return { status: "unavailable" };
  }

  try {
    const events = await prisma.volunteerEvent.findMany({
      where: PUBLIC_EVENT_WHERE,
      include: publicEventInclude,
      orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
      take: 100,
    });

    return { status: "ready", events: events.map(toVolunteerEvent) };
  } catch {
    return { status: "error" };
  }
}

export async function getPublishedEventBySlug(slug: string) {
  return prisma.volunteerEvent.findFirst({
    where: { ...PUBLIC_EVENT_WHERE, slug },
    include: publicEventInclude,
  });
}

/**
 * Kegiatan dapat menerima pendaftaran bila terbit, belum diarsipkan, dan
 * belum berakhir. Dipakai di server agar pengecekan waktu tidak terjadi
 * langsung di badan komponen.
 */
export function isEventOpen(event: {
  status: EventStatus;
  archivedAt: Date | null;
  endsAt: Date;
}) {
  return (
    event.status === EventStatus.PUBLISHED &&
    event.archivedAt === null &&
    event.endsAt.getTime() > Date.now()
  );
}

export function canManageEvent(
  profile: Pick<Profile, "id" | "role">,
  event: { organizerId: string },
) {
  return profile.role === UserRole.ADMIN || event.organizerId === profile.id;
}

export async function listManagedEvents(
  profile: Pick<Profile, "id" | "role">,
): Promise<ManagedEventRecord[]> {
  return prisma.volunteerEvent.findMany({
    where:
      profile.role === UserRole.ADMIN ? {} : { organizerId: profile.id },
    include: managedEventInclude,
    orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export async function getManagedEvent(
  id: string,
  profile: Pick<Profile, "id" | "role">,
): Promise<ManagedEventRecord | null> {
  const event = await prisma.volunteerEvent.findUnique({
    where: { id },
    include: managedEventInclude,
  });

  if (!event || !canManageEvent(profile, event)) return null;
  return event;
}

export async function listEventRegistrations(
  eventId: string,
  profile: Pick<Profile, "id" | "role">,
) {
  const event = await prisma.volunteerEvent.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, organizerId: true, slug: true },
  });

  if (!event || !canManageEvent(profile, event)) return null;

  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId },
    orderBy: [{ createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      accessibilityNeeds: true,
      status: true,
      createdAt: true,
      cancelledAt: true,
    },
  });

  return { event, registrations };
}

export function getRegistrationForUser(eventId: string, userId: string) {
  return prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId } },
    select: {
      id: true,
      status: true,
      cancelledAt: true,
      createdAt: true,
    },
  });
}

export function getLatestOrganizerVerification(userId: string) {
  return prisma.verificationRequest.findFirst({
    where: { userId, type: "ORGANIZER" },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      status: true,
      reviewNote: true,
      submittedAt: true,
      reviewedAt: true,
    },
  });
}

export function countActiveRegistrations(eventId: string) {
  return prisma.eventRegistration.count({
    where: {
      eventId,
      status: {
        in: [RegistrationStatus.PENDING, RegistrationStatus.CONFIRMED],
      },
    },
  });
}
