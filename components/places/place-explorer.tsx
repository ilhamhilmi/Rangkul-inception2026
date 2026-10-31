"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { PlaceFeedEmpty } from "@/components/places/place-feed-states";
import { PlaceFilters } from "@/components/places/place-filters";
import { PostCard } from "@/components/places/post-card";
import { ThumbsUpIcon } from "@/components/ui/icons";
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

function sortPlaces(places: PlaceSummary[]) {
  return [...places].sort((a, b) => {
    if (b.likeCount !== a.likeCount) {
      return b.likeCount - a.likeCount;
    }

    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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

    return sortPlaces(matches);
  }, [places, deferredQuery, deferredCategory]);

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
        <p className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-muted">
          <ThumbsUpIcon className="h-3.5 w-3.5" />
          Diurutkan dari yang paling membantu
        </p>
      </div>

      {filtered.length > 0 ? (
        <ol
          className={[
            "mt-5 grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3",
            isFiltering ? "opacity-60" : "opacity-100",
          ].join(" ")}
          aria-busy={isFiltering}
        >
          {filtered.map((place) => (
            <li key={place.id} className="flex">
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
