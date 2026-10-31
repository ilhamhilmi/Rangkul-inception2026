-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PlaceCategory" AS ENUM ('WISATA', 'KULINER', 'TRANSPORTASI', 'IBADAH', 'KESEHATAN');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FeatureValue" AS ENUM ('AVAILABLE', 'NOT_AVAILABLE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "avatar_url" TEXT,
    "bio" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "PlaceCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',
    "created_by" UUID NOT NULL,
    "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "default_origin_label" TEXT,
    "default_origin_latitude" DECIMAL(9,6),
    "default_origin_longitude" DECIMAL(9,6),
    "published_at" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrances" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "place_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "notes" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "photo_url" TEXT,
    "route_distance_m" INTEGER,
    "route_duration_min" INTEGER,
    "route_condition" TEXT,
    "route_steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "entrances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessibility_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "short_label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accessibility_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrance_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entrance_id" UUID NOT NULL,
    "feature_id" UUID NOT NULL,
    "value" "FeatureValue" NOT NULL DEFAULT 'UNKNOWN',
    "notes" TEXT,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "entrance_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "place_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "place_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "body" TEXT NOT NULL,
    "accessibility_note" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "published_at" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "places_slug_key" ON "places"("slug");

-- CreateIndex
CREATE INDEX "places_status_category_idx" ON "places"("status", "category");

-- CreateIndex
CREATE INDEX "places_province_city_idx" ON "places"("province", "city");

-- CreateIndex
CREATE INDEX "places_latitude_longitude_idx" ON "places"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "entrances_place_id_idx" ON "entrances"("place_id");

-- CreateIndex
CREATE INDEX "entrances_latitude_longitude_idx" ON "entrances"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "accessibility_features_key_key" ON "accessibility_features"("key");

-- CreateIndex
CREATE INDEX "accessibility_features_is_active_sort_order_idx" ON "accessibility_features"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "entrance_features_feature_id_value_idx" ON "entrance_features"("feature_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "entrance_features_entrance_id_feature_id_key" ON "entrance_features"("entrance_id", "feature_id");

-- CreateIndex
CREATE INDEX "place_photos_place_id_sort_order_idx" ON "place_photos"("place_id", "sort_order");

-- CreateIndex
CREATE INDEX "reviews_place_id_status_published_at_idx" ON "reviews"("place_id", "status", "published_at");

-- CreateIndex
CREATE INDEX "reviews_author_id_idx" ON "reviews"("author_id");

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrances" ADD CONSTRAINT "entrances_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrance_features" ADD CONSTRAINT "entrance_features_entrance_id_fkey" FOREIGN KEY ("entrance_id") REFERENCES "entrances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrance_features" ADD CONSTRAINT "entrance_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "accessibility_features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrance_features" ADD CONSTRAINT "entrance_features_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_photos" ADD CONSTRAINT "place_photos_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_photos" ADD CONSTRAINT "place_photos_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==========================================================================
-- Aturan tambahan yang tidak bisa diekspresikan di schema.prisma
-- ==========================================================================

-- Pencarian nama tempat berbasis trigram
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_places_name_trgm
  ON "places" USING GIN ("name" gin_trgm_ops);

-- Satu email unik tanpa memandang kapitalisasi
CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_email_lower
  ON "profiles" (lower("email"));

-- Satu pintu utama per tempat
CREATE UNIQUE INDEX IF NOT EXISTS uq_entrances_one_main
  ON "entrances" ("place_id") WHERE "is_main";

-- Satu review aktif per pengguna per tempat
CREATE UNIQUE INDEX IF NOT EXISTS uq_reviews_place_author
  ON "reviews" ("place_id", "author_id") WHERE "archived_at" IS NULL;

-- Validasi nilai
ALTER TABLE "places"
  ADD CONSTRAINT chk_places_latitude CHECK ("latitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT chk_places_longitude CHECK ("longitude" BETWEEN -180 AND 180),
  ADD CONSTRAINT chk_places_rating_avg CHECK ("rating_avg" BETWEEN 0 AND 5),
  ADD CONSTRAINT chk_places_review_count CHECK ("review_count" >= 0),
  ADD CONSTRAINT chk_places_default_origin CHECK (
    ("default_origin_latitude" IS NULL AND "default_origin_longitude" IS NULL)
    OR ("default_origin_latitude" BETWEEN -90 AND 90 AND "default_origin_longitude" BETWEEN -180 AND 180)
  );

ALTER TABLE "entrances"
  ADD CONSTRAINT chk_entrances_latitude CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90),
  ADD CONSTRAINT chk_entrances_longitude CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180),
  ADD CONSTRAINT chk_entrances_route_distance CHECK ("route_distance_m" IS NULL OR "route_distance_m" > 0),
  ADD CONSTRAINT chk_entrances_route_duration CHECK ("route_duration_min" IS NULL OR "route_duration_min" > 0);

ALTER TABLE "reviews"
  ADD CONSTRAINT chk_reviews_rating CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "place_photos"
  ADD CONSTRAINT chk_place_photos_sort_order CHECK ("sort_order" >= 0);

ALTER TABLE "accessibility_features"
  ADD CONSTRAINT chk_accessibility_features_sort_order CHECK ("sort_order" >= 0);

-- updated_at otomatis
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updated_at" = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON "profiles"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_places_updated_at
  BEFORE UPDATE ON "places"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_entrances_updated_at
  BEFORE UPDATE ON "entrances"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_entrance_features_updated_at
  BEFORE UPDATE ON "entrance_features"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON "reviews"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Agregat rating tempat
CREATE OR REPLACE FUNCTION refresh_place_rating(target_place_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE "places" p
  SET "rating_avg" = COALESCE((
        SELECT round(avg(r."rating")::numeric, 2)
        FROM "reviews" r
        WHERE r."place_id" = target_place_id
          AND r."status" = 'PUBLISHED'
          AND r."archived_at" IS NULL
      ), 0),
      "review_count" = (
        SELECT count(*)
        FROM "reviews" r
        WHERE r."place_id" = target_place_id
          AND r."status" = 'PUBLISHED'
          AND r."archived_at" IS NULL
      )
  WHERE p."id" = target_place_id;
END;
$$;

CREATE OR REPLACE FUNCTION reviews_refresh_place_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM refresh_place_rating(OLD."place_id");
    RETURN NULL;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW."place_id" <> OLD."place_id" THEN
    PERFORM refresh_place_rating(OLD."place_id");
  END IF;

  PERFORM refresh_place_rating(NEW."place_id");
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reviews_refresh_place_rating
  AFTER INSERT OR UPDATE OR DELETE ON "reviews"
  FOR EACH ROW EXECUTE FUNCTION reviews_refresh_place_rating();
