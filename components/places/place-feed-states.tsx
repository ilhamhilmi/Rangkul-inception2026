import { ButtonLink } from "@/components/ui/button";
import { SearchIcon, XIcon } from "@/components/ui/icons";

export function PlaceFeedSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Memuat daftar tempat…</span>
      <div className="space-y-5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="overflow-hidden rounded-sheet border border-line bg-surface"
          >
            <div className="flex flex-col md:flex-row">
              <div className="h-44 w-full animate-pulse bg-surface-muted md:h-auto md:w-60 md:min-h-64" />
              <div className="flex-1 space-y-3 p-5 sm:p-6">
                <div className="h-5 w-24 animate-pulse rounded-full bg-surface-muted" />
                <div className="h-7 w-2/3 animate-pulse rounded bg-surface-muted" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-surface-muted" />
                <div className="flex gap-2 pt-2">
                  {[0, 1, 2].map((chip) => (
                    <div
                      key={chip}
                      className="h-7 w-20 animate-pulse rounded-full bg-surface-muted"
                    />
                  ))}
                </div>
              </div>
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
        Belum ada tempat yang cocok
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
        {query
          ? `Tidak ada hasil untuk “${query}” dengan filter yang dipilih. Coba kata kunci lain atau longgarkan filter fasilitas.`
          : "Tidak ada tempat dengan filter yang dipilih. Coba longgarkan filter fasilitas atau pilih kategori lain."}
      </p>
      <ButtonLink href={onResetHref} variant="secondary" size="sm" className="mt-6">
        <XIcon className="h-4 w-4" />
        Reset semua filter
      </ButtonLink>
    </div>
  );
}
