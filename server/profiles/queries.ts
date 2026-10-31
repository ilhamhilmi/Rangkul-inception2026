import "server-only";

import { connection } from "next/server";

import { getPrisma } from "@/lib/db/prisma";
import { coverUrlFor, isVolunteerSchemaReady } from "@/lib/volunteer/data";
import {
  placeSummaryInclude,
  toPlaceSummary,
} from "@/server/places/mappers";
import type {
  ProfileOverview,
  ProfilePost,
  ProfileVolunteerRegistration,
} from "@/types/profile";

export async function getProfileOverview(
  userId: string,
): Promise<ProfileOverview> {
  await connection();

  const places = await getPrisma().place.findMany({
    where: { createdById: userId },
    include: placeSummaryInclude,
    orderBy: [{ createdAt: "desc" }],
  });

  const posts: ProfilePost[] = places.map((place) => {
    const summary = toPlaceSummary(place);

    return {
      ...summary,
      status: place.status,
      detailHref:
        place.status === "PUBLISHED" && !place.archivedAt
          ? `/jelajahi/${place.slug}`
          : null,
    };
  });

  let registrations: ProfileVolunteerRegistration[] = [];
  let volunteerSchemaReady = true;

  try {
    if (await isVolunteerSchemaReady()) {
      const rows = await getPrisma().eventRegistration.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            include: {
              organizer: { select: { name: true } },
            },
          },
        },
      });

      registrations = rows.map((registration) => ({
        id: registration.id,
        status: registration.status,
        createdAt: registration.createdAt.toISOString(),
        event: {
          slug: registration.event.slug,
          title: registration.event.title,
          city: registration.event.city,
          locationName: registration.event.locationName,
          startsAt: registration.event.startsAt.toISOString(),
          endsAt: registration.event.endsAt.toISOString(),
          coverImage: coverUrlFor(registration.event.coverUrl),
          organizer:
            registration.event.organizer?.name ?? "Penyelenggara Rangkul",
          status: registration.event.status,
        },
      }));
    } else {
      volunteerSchemaReady = false;
    }
  } catch {
    volunteerSchemaReady = false;
  }

  return { posts, registrations, volunteerSchemaReady };
}
