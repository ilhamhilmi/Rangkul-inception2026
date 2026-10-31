import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { SearchIcon, XIcon } from "@/components/ui/icons";
import { PLACE_CATEGORIES } from "@/lib/constants/places";
import { cn } from "@/lib/utils/cn";

export type FilterValues = {
  q: string;
  kategori: string;
};

function buildHref(values: Partial<FilterValues>) {
  const params = new URLSearchParams();
  if (values.q) params.set("q", values.q);
  if (values.kategori && values.kategori !== "semua") {
    params.set("kategori", values.kategori);
  }
  const query = params.toString();
  return query ? `/jelajahi?${query}` : "/jelajahi";
}

export function PlaceFilters({ values }: { values: FilterValues }) {
  const hasFilter =
    values.q.length > 0 ||
    (values.kategori !== "" && values.kategori !== "semua");

  const activeCategory = values.kategori || "semua";

  return (
    <div className="rounded-sheet border border-line bg-surface p-4 shadow-xs sm:p-5">
      <form action="/jelajahi" method="get" role="search" aria-label="Cari tempat">
        {activeCategory !== "semua" ? (
          <input type="hidden" name="kategori" value={activeCategory} />
        ) : null}

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Label htmlFor="q" className="sr-only">
              Kata kunci nama tempat
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
              placeholder="Cari nama tempat, misalnya Taman Sari"
              className="h-14 pl-11"
            />
          </div>
          <Button type="submit" size="lg" className="md:px-8">
            <SearchIcon className="h-4 w-4" />
            Cari
          </Button>
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
              href={buildHref({ q: values.q })}
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
                  href={buildHref({ q: values.q, kategori: category.value })}
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
