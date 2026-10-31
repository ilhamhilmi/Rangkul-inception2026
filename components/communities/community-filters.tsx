"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import {
  CheckIcon,
  SearchIcon,
  SlidersIcon,
} from "@/components/ui/icons";
import {
  communityFocusOptions,
  communityProvinceOptions,
} from "@/lib/constants/communities";

type CommunityFiltersProps = {
  query: string;
  province: string;
  focus: string;
  onQueryChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onFocusChange: (value: string) => void;
  onReset: () => void;
};

export function CommunityFilters({
  query,
  province,
  focus,
  onQueryChange,
  onProvinceChange,
  onFocusChange,
  onReset,
}: CommunityFiltersProps) {
  const hasFilter = Boolean(query || province || focus);

  return (
    <section
      aria-labelledby="filter-komunitas"
      className="rounded-card border border-line bg-surface p-4 shadow-xs sm:p-5"
    >
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-button bg-primary-50 text-primary-700">
          <SlidersIcon className="h-4 w-4" />
        </span>
        <h2
          id="filter-komunitas"
          className="text-base font-semibold text-ink"
        >
          Cari dan filter komunitas
        </h2>
      </div>

      <div
        role="search"
        aria-label="Filter direktori komunitas"
        className="mt-4"
      >
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem] lg:grid-cols-[minmax(0,1fr)_15rem_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="q">Cari komunitas</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="q"
                name="q"
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.currentTarget.value)}
                placeholder="Nama, kota, atau fokus"
                className="pl-11"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wilayah">Wilayah</Label>
            <Select
              id="wilayah"
              name="wilayah"
              value={province}
              onChange={(event) => onProvinceChange(event.currentTarget.value)}
            >
              <option value="">Semua wilayah</option>
              {communityProvinceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          {hasFilter ? (
            <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={onReset}
              >
                Hapus filter
              </Button>
            </div>
          ) : null}
        </div>

        <fieldset className="mt-5 border-t border-line pt-4">
          <legend className="text-sm font-medium text-ink">
            Fokus komunitas
          </legend>
          <ul className="mt-3 flex flex-wrap gap-2">
            {communityFocusOptions.map((option) => {
              const active = focus === option;

              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() =>
                      onFocusChange(active ? "" : option)
                    }
                    aria-pressed={active}
                    aria-label={
                      active
                        ? `Fokus ${option} aktif. Klik untuk menghapus filter.`
                        : `Filter fokus ${option}.`
                    }
                    className={[
                      "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus",
                      active
                        ? "border-primary-700 bg-primary-700 text-white hover:bg-primary-800"
                        : "border-line-strong/60 bg-surface text-ink hover:bg-surface-muted",
                    ].join(" ")}
                  >
                    {active ? <CheckIcon className="h-3.5 w-3.5" /> : null}
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </div>
    </section>
  );
}
