"use client";

import { useState } from "react";
import { StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

const STARS = [1, 2, 3, 4, 5] as const;

export function RatingInput({
  value,
  onChange,
  describedBy,
  invalid = false,
}: {
  value: number;
  onChange: (value: number) => void;
  describedBy?: string;
  invalid?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="text-sm font-semibold text-ink">
        Rating aksesibilitas <span className="text-danger-700">*</span>
      </legend>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        Nilai seberapa ramah tempat ini bagi pengguna disabilitas. Rating 4–5
        akan menampilkan badge “Ramah Disabilitas” di detail postingan.
      </p>

      <div
        role="radiogroup"
        aria-label="Rating aksesibilitas dari 1 sampai 5 bintang"
        aria-invalid={invalid || undefined}
        className="mt-3 flex items-center gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {STARS.map((star) => (
          <label
            key={star}
            onMouseEnter={() => setHovered(star)}
            className="cursor-pointer rounded-button p-1 focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-1"
          >
            <input
              type="radio"
              name="rating"
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="sr-only"
              aria-label={`${star} dari 5 bintang`}
              required
            />
            <StarIcon
              className={cn(
                "h-8 w-8 transition-colors",
                star <= active ? "text-secondary-500" : "text-line",
              )}
            />
          </label>
        ))}
      </div>

      <p className="mt-1.5 text-xs font-medium text-ink-muted" aria-live="polite">
        {value > 0 ? `${value} dari 5 bintang` : "Belum ada rating dipilih"}
      </p>
    </fieldset>
  );
}
