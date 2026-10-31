import { ButtonLink } from "@/components/ui/button";
import { SearchIcon, XIcon } from "@/components/ui/icons";

export function PlaceFeedSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Memuat postingan…</span>
      <div className="space-y-5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="overflow-hidden rounded-sheet border border-line bg-surface"
          >
            <div className="flex items-center gap-3 px-5 pt-5 sm:px-6">
              <div className="h-11 w-11 animate-pulse rounded-full bg-surface-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
              </div>
            </div>
            <div className="space-y-3 px-5 py-4 sm:px-6">
              <div className="h-6 w-2/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-surface-muted" />
            </div>
            <div className="flex items-center justify-between border-t border-line px-5 py-3 sm:px-6">
              <div className="h-11 w-40 animate-pulse rounded-button bg-surface-muted" />
              <div className="h-11 w-48 animate-pulse rounded-button bg-surface-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlaceFeedEmpty({
  query,
  onResetHref = "/jelajahi",
}: {
  query?: string;
  onResetHref?: string;
}) {
  return (
    <div className="rounded-sheet border border-dashed border-line-strong/40 bg-surface px-6 py-14 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-50 text-primary-700">
        <SearchIcon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-xl font-semibold text-ink">
        Belum ada postingan yang cocok
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        {query
          ? `Tidak ada postingan untuk “${query}” dengan kategori yang dipilih. Coba kata kunci lain atau ganti kategori.`
          : "Belum ada postingan untuk kategori ini. Coba pilih kategori lain atau bagikan pengalamanmu sendiri."}
      </p>
      <ButtonLink href={onResetHref} variant="secondary" size="sm" className="mt-6">
        <XIcon className="h-4 w-4" />
        Reset semua filter
      </ButtonLink>
    </div>
  );
}
