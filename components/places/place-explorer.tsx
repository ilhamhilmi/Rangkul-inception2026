"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { PlaceFeedEmpty } from "@/components/places/place-feed-states";
import { PlaceFilters } from "@/components/places/place-filters";
import { PostCard } from "@/components/places/post-card";
import type { PlaceSummary } from "@/types/place";

type PlaceExplorerProps = {
  places: PlaceSummary[];
  totalCount: number;
  isAuthenticated: boolean;
  initialQuery: string;
  initialCategory: string;
};

function normalize(value: string) {
  return value.toLocaleLowerCase("id-ID");
}

type SortOrder = "terbaru" | "terlama" | "membantu";

const SORT_OPTIONS: Array<{ value: SortOrder; label: string }> = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlama", label: "Terlama" },
  { value: "membantu", label: "Paling membantu" },
];

function sortPlaces(places: PlaceSummary[], sort: SortOrder) {
  return [...places].sort((a, b) => {
    if (sort === "membantu" && b.likeCount !== a.likeCount) {
      return b.likeCount - a.likeCount;
    }

    const diff =
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    return sort === "terlama" ? -diff : diff;
  });
}

export function PlaceExplorer({
  places,
  totalCount,
  isAuthenticated,
  initialQuery,
  initialCategory,
}: PlaceExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory || "semua");
  const [sort, setSort] = useState<SortOrder>("terbaru");

  const deferredQuery = useDeferredValue(query);
  const deferredCategory = useDeferredValue(category);
  const isFiltering = query !== deferredQuery || category !== deferredCategory;

  const filtered = useMemo(() => {
    const keyword = normalize(deferredQuery.trim());
    const activeCategory =
      deferredCategory && deferredCategory !== "semua"
        ? normalize(deferredCategory)
        : "";

    const matches = places.filter((place) => {
      if (activeCategory && normalize(place.category) !== activeCategory) {
        return false;
      }

      if (!keyword) return true;

      return [place.name, place.city ?? "", place.address ?? ""]
        .map(normalize)
        .some((value) => value.includes(keyword));
    });

    return sortPlaces(matches, sort);
  }, [places, deferredQuery, deferredCategory, sort]);

  useEffect(() => {
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    if (trimmedQuery) params.set("q", trimmedQuery);
    if (category && category !== "semua") params.set("kategori", category);

    const queryString = params.toString();
    window.history.replaceState(
      null,
      "",
      queryString ? `/jelajahi?${queryString}` : "/jelajahi",
    );
  }, [query, category]);

  function resetFilters() {
    setQuery("");
    setCategory("semua");
  }

  const trimmedQuery = query.trim();
  const summary = `Menampilkan ${filtered.length} dari ${totalCount} postingan${
    trimmedQuery ? ` untuk kata kunci “${trimmedQuery}”` : ""
  }.`;

  return (
    <>
      <PlaceFilters
        values={{ q: query, kategori: category }}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
        onReset={resetFilters}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <p
          role="status"
          aria-live="polite"
          aria-busy={isFiltering}
          className="text-sm text-ink-muted"
        >
          {isFiltering ? "Memuat hasil pencarian…" : summary}
        </p>
        <label className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted">
          Urutkan
          <select
            value={sort}
            onChange={(event) =>
              setSort(event.currentTarget.value as SortOrder)
            }
            className="h-9 rounded-full border border-line bg-surface pl-3 pr-8 text-xs font-medium text-ink shadow-xs transition-colors focus:border-primary-600"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length > 0 ? (
        <ol
          className={[
            "mt-5 grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 sm:gap-5 lg:grid-cols-3",
            isFiltering ? "opacity-60" : "opacity-100",
          ].join(" ")}
          aria-busy={isFiltering}
        >
          {filtered.map((place) => (
            <li key={place.id} className="flex min-w-0">
              <PostCard place={place} isAuthenticated={isAuthenticated} />
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-5">
          <PlaceFeedEmpty query={trimmedQuery} onReset={resetFilters} />
        </div>
      )}
    </>
  );
}
