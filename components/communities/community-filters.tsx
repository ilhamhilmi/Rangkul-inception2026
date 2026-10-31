import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
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
};

function buildHref({
  query,
  province,
  focus,
}: {
  query: string;
  province: string;
  focus: string;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (province) params.set("wilayah", province);
  if (focus) params.set("fokus", focus);

  const queryString = params.toString();
  return queryString ? `/komunitas?${queryString}` : "/komunitas";
}

export function CommunityFilters({
  query,
  province,
  focus,
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

      <form
        action="/komunitas"
        method="get"
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
                defaultValue={query}
                placeholder="Nama, kota, atau fokus"
                className="pl-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wilayah">Wilayah</Label>
            <Select id="wilayah" name="wilayah" defaultValue={province}>
              <option value="">Semua wilayah</option>
              {communityProvinceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <Button type="submit" className="w-full sm:w-auto">
              Terapkan
            </Button>
            {hasFilter ? (
              <ButtonLink
                href="/komunitas"
                variant="ghost"
                className="w-full sm:w-auto"
              >
                Hapus filter
              </ButtonLink>
            ) : null}
          </div>
        </div>

        {focus ? (
          <input type="hidden" name="fokus" value={focus} />
        ) : null}

        <fieldset className="mt-5 border-t border-line pt-4">
          <legend className="text-sm font-medium text-ink">
            Fokus komunitas
          </legend>
          <ul className="mt-3 flex flex-wrap gap-2">
            {communityFocusOptions.map((option) => {
              const active = focus === option;
              const href = buildHref({
                query,
                province,
                focus: active ? "" : option,
              });

              return (
                <li key={option}>
                  <Link
                    href={href}
                    aria-label={
                      active
                        ? `Fokus ${option} aktif. Klik untuk menghapus filter.`
                        : `Filter fokus ${option}.`
                    }
                    className={[
                      "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary-700 bg-primary-700 text-white hover:bg-primary-800"
                        : "border-line-strong/60 bg-surface text-ink hover:bg-surface-muted",
                    ].join(" ")}
                  >
                    {active ? <CheckIcon className="h-3.5 w-3.5" /> : null}
                    {option}
                  </Link>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </form>
    </section>
  );
}
