-- Notifikasi in-app dan catatan moderasi kegiatan Volunteer Rangkul.
--
-- Sifat: ADDITIVE.
-- Notifikasi hanya dibuat oleh server (Prisma) dan dibaca/ditandai oleh
-- pemiliknya. RLS ditambahkan sebagai lapisan pertahanan kedua untuk akses
-- Supabase client.

CREATE TYPE "NotificationType" AS ENUM ('EVENT_UPDATED', 'EVENT_ARCHIVED');

ALTER TABLE "volunteer_events"
    ADD COLUMN "moderation_note" TEXT;

CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "body" VARCHAR(500) NOT NULL,
    "href" VARCHAR(300),
    "event_id" UUID,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_notifications_user_read_created"
    ON "notifications" ("user_id", "read_at", "created_at");

ALTER TABLE "notifications"
    ADD CONSTRAINT "fk_notifications_user_id"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications"
    ADD CONSTRAINT "fk_notifications_event_id"
    FOREIGN KEY ("event_id") REFERENCES "volunteer_events"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

REVOKE ALL ON TABLE public.notifications FROM anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.notifications TO authenticated;
