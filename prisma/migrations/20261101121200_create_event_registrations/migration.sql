-- Pendaftaran peserta kegiatan Volunteer Rangkul.
--
-- Sifat: ADDITIVE.
-- Satu pengguna hanya memiliki satu baris per kegiatan. Baris tidak dihapus
-- saat dibatalkan; status diubah menjadi CANCELLED.

CREATE TABLE "event_registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "accessibility_needs" VARCHAR(500),
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "cancelled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_event_registrations_name_length" CHECK (char_length("name") BETWEEN 1 AND 80),
    CONSTRAINT "chk_event_registrations_email" CHECK (
        "email" ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    ),
    CONSTRAINT "chk_event_registrations_phone" CHECK ("phone" ~ '^\+?[0-9 -]{8,20}$'),
    CONSTRAINT "chk_event_registrations_accessibility_needs_length" CHECK (
        "accessibility_needs" IS NULL OR char_length("accessibility_needs") <= 500
    ),
    CONSTRAINT "chk_event_registrations_cancelled_at" CHECK (
        "status" <> 'CANCELLED' OR "cancelled_at" IS NOT NULL
    )
);

CREATE UNIQUE INDEX "uq_event_registrations_event_user"
    ON "event_registrations" ("event_id", "user_id");
CREATE INDEX "idx_event_registrations_event_status"
    ON "event_registrations" ("event_id", "status");
CREATE INDEX "idx_event_registrations_user"
    ON "event_registrations" ("user_id");

ALTER TABLE "event_registrations"
    ADD CONSTRAINT "fk_event_registrations_event_id"
    FOREIGN KEY ("event_id") REFERENCES "volunteer_events"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "event_registrations"
    ADD CONSTRAINT "fk_event_registrations_user_id"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
