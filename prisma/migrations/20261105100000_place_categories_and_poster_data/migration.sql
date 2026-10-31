-- Revisi Jelajahi: kategori baru, rating dari pemosting, dan fasilitas yang
-- dicentang saat membuat postingan.

ALTER TYPE "PlaceCategory" ADD VALUE IF NOT EXISTS 'FASILITAS_UMUM';
ALTER TYPE "PlaceCategory" ADD VALUE IF NOT EXISTS 'LAINNYA';

ALTER TABLE "places" ADD COLUMN "poster_rating" SMALLINT;
ALTER TABLE "places"
  ADD COLUMN "facilities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Rating hanya diisi pemosting dengan skala 1-5.
ALTER TABLE "places"
  ADD CONSTRAINT "chk_places_poster_rating"
  CHECK ("poster_rating" IS NULL OR "poster_rating" BETWEEN 1 AND 5);

-- Fasilitas dibatasi ke key yang dikenal aplikasi agar data tetap konsisten.
ALTER TABLE "places"
  ADD CONSTRAINT "chk_places_facilities"
  CHECK (
    "facilities" <@ ARRAY[
      'ramp',
      'lift',
      'accessible-toilet',
      'guiding-block',
      'accessible-parking',
      'automatic-door',
      'wide-entrance'
    ]::TEXT[]
  );
