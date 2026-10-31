import type { VolunteerEvent, VolunteerFilters } from "@/types/volunteer";

function normalize(value: string) {
  return value.toLocaleLowerCase("id-ID");
}

export function filterVolunteerEvents(
  events: VolunteerEvent[],
  filters: VolunteerFilters,
): VolunteerEvent[] {
  const query = normalize(filters.query.trim());

  return events.filter((event) => {
    const searchableValues = [
      event.title,
      event.location,
      event.city,
      event.organizer,
    ];

    const matchesQuery =
      query.length === 0 ||
      searchableValues.some((value) => normalize(value).includes(query));
    const matchesCategory =
      filters.category === "all" || event.category === filters.category;
    const matchesLocation =
      filters.location === "all" || event.city === filters.location;
    const matchesTime =
      filters.time === "all" || event.startsAt.startsWith(filters.time);

    return (
      matchesQuery && matchesCategory && matchesLocation && matchesTime
    );
  });
}
