import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { SearchIcon, SlidersIcon, XIcon } from "@/components/ui/icons";
import {
  ACCESSIBILITY_FEATURES,
  PLACE_CATEGORIES,
} from "@/lib/mock/places";
import { cn } from "@/lib/utils/cn";

export type FilterValues = {
  q: string;
  kategori: string;
  fasilitas: string;
};

function buildHref(values: Partial<FilterValues>) {
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.kategori && values.kategori !== "semua") {
    params.set("kategori", values.kategori);
  }
  if (values.fasilitas && values.fasilitas !== "semua") {
    params.set("fasilitas", values.fasilitas);
  }
  const query = params.toString();
  return query ? `/jelajahi?${query}` : "/jelajahi";
}

export function PlaceFilters({ values }: { values: FilterValues }) {
  const hasFilter =
    values.q.length > 0 ||
    (values.kategori !== "" && values.kategori !== "semua") ||
    (values.fasilitas !== "" && values.fasilitas !== "semua");

  const activeCategory = values.kategori || "semua";

  return (
    <div className="rounded-sheet border border-line bg-surface p-4 shadow-xs sm:p-5">
      <form action="/jelajahi" method="get" role="search" aria-label="Cari tempat">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Label htmlFor="q" className="sr-only">
              Kata kunci pencarian
            </Label>
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
            />
            <Input
              id="q"
              name="q"
              type="search"
              defaultValue={values.q}
              placeholder="Cari nama tempat, kota, atau alamat"
              className="h-14 pl-11"
            />
          </div>
          <Button type="submit" size="lg" className="md:px-8">
            <SearchIcon className="h-4 w-4" />
            Cari
          </Button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="kategori" className="text-xs text-ink-muted">
              Kategori
            </Label>
            <Select
              id="kategori"
              name="kategori"
              defaultValue={activeCategory}
              className="h-11 text-sm"
            >
              <option value="semua">Semua kategori</option>
              {PLACE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="fasilitas"
              className="flex items-center gap-1.5 text-xs text-ink-muted"
            >
              <SlidersIcon className="h-3.5 w-3.5" />
              Fasilitas aksesibilitas
            </Label>
            <Select
              id="fasilitas"
              name="fasilitas"
              defaultValue={values.fasilitas || "semua"}
              className="h-11 text-sm"
            >
              <option value="semua">Semua fasilitas</option>
              {ACCESSIBILITY_FEATURES.map((feature) => (
                <option key={feature.key} value={feature.key}>
                  {feature.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </form>

      <div className="mt-4 border-t border-line pt-4">
        <p id="filter-kategori-label" className="sr-only">
          Filter kategori tempat
        </p>
        <ul
          aria-labelledby="filter-kategori-label"
          className="flex flex-wrap items-center gap-2"
        >
          <li>
            <Link
              href={buildHref({ q: values.q, fasilitas: values.fasilitas })}
              aria-current={activeCategory === "semua" ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                activeCategory === "semua"
                  ? "border-primary-700 bg-primary-700 text-white"
                  : "border-line bg-surface text-ink-muted hover:border-primary-300 hover:text-ink",
              )}
            >
              Semua
            </Link>
          </li>
          {PLACE_CATEGORIES.map((category) => {
            const active = activeCategory === category.value;
            return (
              <li key={category.value}>
                <Link
                  href={buildHref({
                    q: values.q,
                    kategori: category.value,
                    fasilitas: values.fasilitas,
                  })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                    active
                      ? "border-primary-700 bg-primary-700 text-white"
                      : "border-line bg-surface text-ink-muted hover:border-primary-300 hover:text-ink",
                  )}
                >
                  {category.label}
                </Link>
              </li>
            );
          })}

          {hasFilter ? (
            <li className="sm:ml-auto">
              <Link
                href="/jelajahi"
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary-800 underline-offset-4 hover:underline"
              >
                <XIcon className="h-4 w-4" />
                Reset filter
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
