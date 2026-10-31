import { CameraIcon } from "@/components/ui/icons";
import type { PlaceCategory } from "@/types/place";
import { PlaceMedia } from "./place-media";

export function PlaceGallery({
  category,
  name,
}: {
  category: PlaceCategory;
  name: string;
}) {
  return (
    <figure>
      <div className="grid gap-2 sm:grid-cols-[1.65fr_1fr]">
        <PlaceMedia
          category={category}
          className="min-h-60 rounded-sheet border border-line sm:min-h-80"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          <PlaceMedia
            category={category}
            compact
            className="min-h-28 rounded-card border border-line sm:min-h-0"
          />
          <PlaceMedia
            category={category}
            compact
            className="min-h-28 rounded-card border border-line sm:min-h-0"
          />
        </div>
      </div>
      <figcaption className="mt-2.5 flex items-start gap-1.5 text-xs text-ink-muted">
        <CameraIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Galeri foto contoh untuk {name}. Foto dari kontributor akan tampil di
        sini setelah fitur unggah tersambung.
      </figcaption>
    </figure>
  );
}
