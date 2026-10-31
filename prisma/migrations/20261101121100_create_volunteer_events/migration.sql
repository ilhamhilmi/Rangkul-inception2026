-- Tabel kegiatan Volunteer Rangkul.
--
-- Sifat: ADDITIVE.
-- Tabel "profiles" sudah ada dan tidak dibuat ulang. Hanya menambah FK baru
-- ke "profiles"("id").
--
-- "community_id" sengaja nullable dan BELUM memiliki FK. Relasi ke tabel
-- "communities" ditunda sampai bentuk relasinya disepakati dengan pemilik
-- fitur Komunitas.

CREATE TABLE "volunteer_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "organizer_id" UUID NOT NULL,
    "community_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL,
    "location_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "requirements" TEXT,
    "accessibility_notes" TEXT,
    "slots" INTEGER NOT NULL,
    "registered_count" INTEGER NOT NULL DEFAULT 0,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "cover_url" TEXT,
    "cover_alt" TEXT,
    "published_at" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteer_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_volunteer_events_slug_format" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT "chk_volunteer_events_title_length" CHECK (char_length("title") BETWEEN 5 AND 150),
    CONSTRAINT "chk_volunteer_events_description_length" CHECK (char_length("description") BETWEEN 20 AND 5000),
    CONSTRAINT "chk_volunteer_events_location_nonempty" CHECK (
        char_length(btrim("location_name")) > 0
        AND char_length(btrim("address")) > 0
        AND char_length(btrim("city")) > 0
        AND char_length(btrim("province")) > 0
    ),
    CONSTRAINT "chk_volunteer_events_requirements_length" CHECK (
        "requirements" IS NULL OR char_length("requirements") <= 2000
    ),
    CONSTRAINT "chk_volunteer_events_accessibility_notes_length" CHECK (
        "accessibility_notes" IS NULL OR char_length("accessibility_notes") <= 2000
    ),
    CONSTRAINT "chk_volunteer_events_slots_positive" CHECK ("slots" > 0),
    CONSTRAINT "chk_volunteer_events_registered_count_range" CHECK (
        "registered_count" >= 0 AND "registered_count" <= "slots"
    ),
    CONSTRAINT "chk_volunteer_events_time_order" CHECK ("ends_at" > "starts_at"),
    CONSTRAINT "chk_volunteer_events_latitude" CHECK (
        "latitude" IS NULL OR ("latitude" >= -90 AND "latitude" <= 90)
    ),
    CONSTRAINT "chk_volunteer_events_longitude" CHECK (
        "longitude" IS NULL OR ("longitude" >= -180 AND "longitude" <= 180)
    ),
    CONSTRAINT "chk_volunteer_events_cover_alt" CHECK (
        "cover_url" IS NULL OR ("cover_alt" IS NOT NULL AND char_length(btrim("cover_alt")) > 0)
    ),
    CONSTRAINT "chk_volunteer_events_published_at" CHECK (
        "status" <> 'PUBLISHED' OR "published_at" IS NOT NULL
    )
);

CREATE UNIQUE INDEX "uq_volunteer_events_slug" ON "volunteer_events" ("slug");
CREATE INDEX "idx_volunteer_events_status_start" ON "volunteer_events" ("status", "starts_at");
CREATE INDEX "idx_volunteer_events_organizer" ON "volunteer_events" ("organizer_id");
CREATE INDEX "idx_volunteer_events_community" ON "volunteer_events" ("community_id");
CREATE INDEX "idx_volunteer_events_location" ON "volunteer_events" ("province", "city");
CREATE INDEX "idx_volunteer_events_title_trgm"
    ON "volunteer_events" USING gin ("title" gin_trgm_ops);

ALTER TABLE "volunteer_events"
    ADD CONSTRAINT "fk_volunteer_events_organizer_id"
    FOREIGN KEY ("organizer_id") REFERENCES "profiles"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON COLUMN "volunteer_events"."community_id" IS
    'Nullable. FK ke communities ditunda sampai struktur tabel komunitas disepakati.';
COMMENT ON COLUMN "volunteer_events"."cover_url" IS
    'Path/URL cover di bucket Supabase Storage event-covers.';
COMMENT ON COLUMN "volunteer_events"."accessibility_notes" IS
    'Informasi aksesibilitas kegiatan untuk peserta/relawan.';
