import type { PlaceSummary } from "@/types/place";

export type ProfilePostStatus =
  | "PENDING"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export type ProfilePost = PlaceSummary & {
  status: ProfilePostStatus;
  detailHref: string | null;
};

export type ProfileRegistrationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type ProfileVolunteerRegistration = {
  id: string;
  status: ProfileRegistrationStatus;
  createdAt: string;
  event: {
    slug: string;
    title: string;
    city: string;
    locationName: string;
    startsAt: string;
    endsAt: string;
    coverImage: string;
    organizer: string;
    status: "DRAFT" | "PENDING" | "PUBLISHED" | "CLOSED" | "REJECTED";
  };
};

export type ProfileOverview = {
  posts: ProfilePost[];
  registrations: ProfileVolunteerRegistration[];
  volunteerSchemaReady: boolean;
};

export type ProfileFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};
