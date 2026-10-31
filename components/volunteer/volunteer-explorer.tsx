"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label } from "@/components/ui/field";
import { VOLUNTEER_CATEGORIES, VOLUNTEER_TIME_FILTERS } from "@/lib/volunteer/constants";
import { filterVolunteerEvents } from "@/lib/volunteer/filter-events";
import type {
  VolunteerCategoryFilter,
  VolunteerEvent,
  VolunteerTimeFilter,
} from "@/types/volunteer";
import { VolunteerDetailDialog } from "@/components/volunteer/volunteer-detail-dialog";
import { VolunteerEventCard } from "@/components/volunteer/volunteer-event-card";
import { SearchIcon, SlidersIcon } from "@/components/volunteer/volunteer-icons";

type VolunteerExplorerProps = {
  events: VolunteerEvent[];
  locations: string[];
};

const selectClassName =
  "h-12 w-full rounded-input border border-line-strong bg-surface py-0 pl-3.5 pr-10 text-base text-ink shadow-xs transition-colors focus:border-primary-600 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted";

export function VolunteerExplorer({
  events,
  locations,
}: VolunteerExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VolunteerCategoryFilter>("all");
  const [location, setLocation] = useState("all");
  const [time, setTime] = useState<VolunteerTimeFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEvent | null>(
    null,
  );

  const filteredEvents = useMemo(
    () =>
      filterVolunteerEvents(events, {
        query,
        category,
        location,
        time,
      }),
    [events, query, category, location, time],
  );

  const hasFilters =
    query.trim().length > 0 ||
    category !== "all" ||
    location !== "all" ||
    time !== "all";

  const resetFilters = useCallback(() => {
    setQuery("");
    setCategory("all");
    setLocation("all");
    setTime("all");
    document.getElementById("volunteer-search")?.focus();
  }, []);

  const closeDialog = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  return (
    <>
      <div
        role="search"
        aria-label="Cari dan filter kegiatan volunteer"
        className="rounded-sheet border border-line bg-surface p-4 shadow-card sm:p-6"
      >
        <div className="flex items-center gap-2 border-b border-line pb-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-50 text-primary-700">
            <SlidersIcon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-ink">
              Cari kegiatan yang cocok
            </h3>
            <p className="text-sm text-ink-muted">
              Gunakan kata kunci atau pilih filter di bawah.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-2">
            <Label htmlFor="volunteer-search">Cari kegiatan</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="volunteer-search"
                name="volunteer-search"
                type="search"
                value={query}
                onChange={(changeEvent) => setQuery(changeEvent.target.value)}
                placeholder="Nama kegiatan, kota, atau penyelenggara"
                aria-describedby="volunteer-search-hint"
                className="pl-11"
              />
            </div>
            <FieldHint id="volunteer-search-hint">
              Contoh: pendataan aksesibilitas, Jakarta, atau nama komunitas.
            </FieldHint>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteer-category">Kategori</Label>
            <select
              id="volunteer-category"
              name="volunteer-category"
              value={category}
              onChange={(changeEvent) =>
                setCategory(
                  changeEvent.target.value as VolunteerCategoryFilter,
                )
              }
              className={selectClassName}
            >
              <option value="all">Semua kategori</option>
              {VOLUNTEER_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteer-location">Lokasi</Label>
            <select
              id="volunteer-location"
              name="volunteer-location"
              value={location}
              onChange={(changeEvent) => setLocation(changeEvent.target.value)}
              className={selectClassName}
            >
              <option value="all">Semua lokasi</option>
              {locations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volunteer-time">Waktu</Label>
            <select
              id="volunteer-time"
              name="volunteer-time"
              value={time}
              onChange={(changeEvent) =>
                setTime(changeEvent.target.value as VolunteerTimeFilter)
              }
              className={selectClassName}
            >
              {VOLUNTEER_TIME_FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-ink-muted"
          >
            Menampilkan{" "}
            <span className="font-semibold text-ink">
              {filteredEvents.length}
            </span>{" "}
            dari {events.length} kegiatan
          </p>
          {hasFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
            >
              Reset filter
            </Button>
          ) : null}
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <li key={event.slug} className="h-full">
              <VolunteerEventCard
                event={event}
                onViewDetail={() => setSelectedEvent(event)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-card border border-line bg-surface p-8 text-center shadow-xs">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-50 text-primary-700">
            <SearchIcon className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
            Belum ada kegiatan yang cocok
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            Coba kata kunci lain, pilih kategori yang berbeda, atau reset filter
            untuk melihat semua kegiatan.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={resetFilters}
            className="mt-5"
          >
            Reset filter
          </Button>
        </div>
      )}

      <VolunteerDetailDialog event={selectedEvent} onClose={closeDialog} />
    </>
  );
}
