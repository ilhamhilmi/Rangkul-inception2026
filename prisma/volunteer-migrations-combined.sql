-- ============================================================================
-- Volunteer Rangkul - Combined Migration Artifact
-- ============================================================================
-- TUJUAN
--   Satu file SQL gabungan dari 5 migration modul Volunteer, untuk diperiksa
--   dan dijalankan oleh pengelola database bersama (Supabase/Postgres).
--
-- SIFAT
--   ADDITIVE. File ini hanya membuat objek baru milik modul Volunteer:
--   - enum  : "EventStatus", "EventCategory", "RegistrationStatus"
--   - tabel : public.volunteer_events, public.event_registrations
--   - fungsi/trigger/policy/grants khusus tabel Volunteer
--   File ini TIDAK mengubah tabel bersama (profiles, communities,
--   verification_requests), enum bersama, atau policy/trigger milik fitur lain.
--   Satu-satunya sentuhan ke tabel bersama adalah FK baru dari tabel Volunteer
--   ke public.profiles(id) dan pemakaian fungsi yang sudah ada
--   (public.set_updated_at, public.is_admin).
--
-- PRASYARAT (sudah terverifikasi ada di database tujuan)
--   - public.profiles(id) dengan kolom role
--   - public.is_admin()
--   - public.set_updated_at()
--   - extension pg_trgm (dibuat dengan IF NOT EXISTS di bawah)
--   - role Postgres anon dan authenticated (Supabase)
--
-- CARA PAKAI
--   Jalankan seluruh file sebagai satu transaksi, mis.:
--     psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f volunteer-migrations-combined.sql
--   atau tempel isinya ke Supabase SQL Editor lalu Run.
--
-- PENTING - PENCATATAN PRISMA
--   Eksekusi SQL mentah TIDAK mencatat migration ke tabel _prisma_migrations.
--   Setelah SQL berhasil, pengelola database harus memilih SALAH SATU:
--   a) Tandai kelima migration sebagai sudah diterapkan:
--        npx prisma migrate resolve --applied 20261101121000_create_volunteer_enums
--        npx prisma migrate resolve --applied 20261101121100_create_volunteer_events
--        npx prisma migrate resolve --applied 20261101121200_create_event_registrations
--        npx prisma migrate resolve --applied 20261101121300_add_volunteer_triggers
--        npx prisma migrate resolve --applied 20261101121400_enable_volunteer_rls
--   b) Atau jangan jalankan file ini dan gunakan `npx prisma migrate deploy`.
--
-- CATATAN PENTING - MIGRATION BERSAMA YANG GAGAL
--   Tabel _prisma_migrations saat ini memuat DUA baris gagal
--   (finished_at IS NULL) untuk migration:
--     20261101120000_init_communities
--   `prisma migrate deploy` akan berhenti sampai baris gagal tersebut
--   diselesaikan oleh pemilik fitur terkait. Karena itu jalur (a) di atas
--   (SQL manual + migrate resolve) lebih aman untuk modul Volunteer.
--
-- ROLLBACK
--   Jika terjadi error, transaksi di bawah akan otomatis rollback karena
--   BEGIN/COMMIT. Tidak ada DROP otomatis terhadap objek bersama.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1/5  20261101121000_create_volunteer_enums
--      Enum khusus Volunteer + extension pg_trgm.
-- ============================================================================


-- Enum khusus Volunteer Rangkul.
--
-- Sifat: ADDITIVE.
-- Enum bersama "UserRole", "VerificationType", dan "VerificationStatus" sudah
-- dibuat oleh fitur lain dan TIDAK dibuat ulang di sini. Enum baru memakai nama
-- PascalCase agar konsisten dengan enum bersama yang sudah ada.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' AND t.typname = 'EventStatus'
    ) THEN
        CREATE TYPE public."EventStatus" AS ENUM (
            'DRAFT',
            'PENDING',
            'PUBLISHED',
            'CLOSED',
            'REJECTED'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' AND t.typname = 'EventCategory'
    ) THEN
        CREATE TYPE public."EventCategory" AS ENUM (
            'EVENT_SUPPORT',
            'ACCESSIBILITY_AUDIT',
            'SOCIAL_ACTIVITY',
            'INCLUSIVE_PROGRAM',
            'OTHER'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' AND t.typname = 'RegistrationStatus'
    ) THEN
        CREATE TYPE public."RegistrationStatus" AS ENUM (
            'PENDING',
            'CONFIRMED',
            'CANCELLED'
        );
    END IF;
END
$$;

-- ============================================================================
-- 2/5  20261101121100_create_volunteer_events
-- Tabel public.volunteer_events + index + FK ke profiles.
-- ============================================================================

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


-- ============================================================================
-- 3/5  20261101121200_create_event_registrations
-- Tabel public.event_registrations + index + FK.
-- ============================================================================

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


-- ============================================================================
-- 4/5  20261101121300_add_volunteer_triggers
-- Fungsi, trigger updated_at/agregat/guard, dan backfill aman.
-- ============================================================================

-- Trigger dan validasi Volunteer Rangkul.
--
-- Sifat: ADDITIVE.
-- Fungsi bersama public.set_updated_at() dan public.is_admin() SUDAH ADA dan
-- TIDAK didefinisikan ulang di sini. Migration ini tidak menambah trigger atau
-- policy pada tabel bersama (profiles, communities, verification_requests).
--
-- Catatan otorisasi:
-- - Trigger ini adalah lapisan pertahanan kedua untuk akses lewat Supabase
--   client. Prisma terhubung sebagai owner database sehingga auth.uid() NULL
--   dan trigger tidak dapat menggantikan guard di server. Semua server action
--   tetap wajib memeriksa user dan role.
-- - Tidak ada flag transaksi yang dapat dipalsukan client. Update agregat
--   registered_count hanya diizinkan bila nilainya sama dengan hasil hitung
--   CONFIRMED dan tidak ada kolom lain yang ikut berubah.

CREATE OR REPLACE FUNCTION public.refresh_event_registration_count(target_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.volunteer_events e
    SET registered_count = (
        SELECT count(*)::integer
        FROM public.event_registrations r
        WHERE r.event_id = target_event_id
          AND r.status = 'CONFIRMED'
    )
    WHERE e.id = target_event_id;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_event_registration_count(uuid) FROM public;

CREATE OR REPLACE FUNCTION public.sync_event_registration_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.refresh_event_registration_count(OLD.event_id);
        RETURN OLD;
    END IF;

    PERFORM public.refresh_event_registration_count(NEW.event_id);

    IF TG_OP = 'UPDATE' AND NEW.event_id IS DISTINCT FROM OLD.event_id THEN
        PERFORM public.refresh_event_registration_count(OLD.event_id);
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_event_registration_count() FROM public;

DROP TRIGGER IF EXISTS set_volunteer_events_updated_at ON public.volunteer_events;
CREATE TRIGGER set_volunteer_events_updated_at
    BEFORE UPDATE ON public.volunteer_events
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_event_registrations_updated_at ON public.event_registrations;
CREATE TRIGGER set_event_registrations_updated_at
    BEFORE UPDATE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS sync_event_registration_count ON public.event_registrations;
CREATE TRIGGER sync_event_registration_count
    AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_event_registration_count();

-- Kegiatan: organizer hanya boleh membuat draft/pending, tidak boleh
-- menerbitkan sendiri, memindahkan kepemilikan, atau menulis registered_count
-- secara manual.
CREATE OR REPLACE FUNCTION public.protect_event_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    expected_count integer;
BEGIN
    -- Akses server langsung (Prisma) tidak membawa JWT. Otorisasi server tetap
    -- wajib; trigger hanya menjaga akses Supabase client.
    IF auth.uid() IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.organizer_id IS DISTINCT FROM auth.uid() THEN
            RAISE EXCEPTION 'Kegiatan hanya dapat dibuat untuk akun sendiri';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role IN ('ORGANIZER', 'ADMIN')
        ) THEN
            RAISE EXCEPTION 'Hanya organizer terverifikasi yang dapat membuat kegiatan';
        END IF;

        IF NEW.status NOT IN ('DRAFT', 'PENDING') THEN
            RAISE EXCEPTION 'Organizer hanya dapat membuat kegiatan berstatus DRAFT atau PENDING';
        END IF;

        IF NEW.published_at IS NOT NULL THEN
            RAISE EXCEPTION 'published_at hanya dapat diisi oleh admin';
        END IF;

        IF NEW.registered_count <> 0 THEN
            RAISE EXCEPTION 'registered_count hanya boleh diisi trigger';
        END IF;

        RETURN NEW;
    END IF;

    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'ID kegiatan tidak dapat diubah';
    END IF;

    -- Update agregat internal terjadi di sesi peserta/organizer yang sedang
    -- menulis event_registrations, sehingga auth.uid() bisa bukan pemilik
    -- kegiatan. Karena itu kasus "hanya registered_count yang berubah ke nilai
    -- benar" diperiksa lebih dulu. Tidak ada flag sesi yang dapat dipalsukan.
    IF NEW.registered_count IS DISTINCT FROM OLD.registered_count THEN
        SELECT count(*)::integer
        INTO expected_count
        FROM public.event_registrations r
        WHERE r.event_id = NEW.id
          AND r.status = 'CONFIRMED';

        IF NEW.registered_count IS DISTINCT FROM expected_count THEN
            RAISE EXCEPTION 'registered_count hanya boleh diubah oleh trigger agregat';
        END IF;

        IF (to_jsonb(NEW) - 'registered_count' - 'updated_at')
           IS DISTINCT FROM
           (to_jsonb(OLD) - 'registered_count' - 'updated_at') THEN
            RAISE EXCEPTION 'registered_count tidak boleh diubah bersama kolom lain';
        END IF;

        RETURN NEW;
    END IF;

    IF OLD.organizer_id <> auth.uid() THEN
        RAISE EXCEPTION 'Hanya organizer pemilik kegiatan yang dapat mengubahnya';
    END IF;

    IF NEW.organizer_id IS DISTINCT FROM OLD.organizer_id THEN
        RAISE EXCEPTION 'Kepemilikan kegiatan tidak dapat dipindahkan';
    END IF;

    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'created_at tidak dapat diubah';
    END IF;

    IF NEW.published_at IS DISTINCT FROM OLD.published_at THEN
        RAISE EXCEPTION 'published_at hanya dapat diubah oleh admin';
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status THEN
        IF NOT (
            (OLD.status = 'DRAFT' AND NEW.status = 'PENDING')
            OR (OLD.status = 'PENDING' AND NEW.status = 'DRAFT')
            OR (OLD.status = 'REJECTED' AND NEW.status IN ('DRAFT', 'PENDING'))
            OR (OLD.status = 'PUBLISHED' AND NEW.status = 'CLOSED')
        ) THEN
            RAISE EXCEPTION 'Transisi status kegiatan tidak diizinkan untuk organizer';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_event_write() FROM public;

DROP TRIGGER IF EXISTS protect_event_write ON public.volunteer_events;
CREATE TRIGGER protect_event_write
    BEFORE INSERT OR UPDATE ON public.volunteer_events
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_event_write();

-- Pendaftaran: identitas baris tidak boleh diubah pengguna.
CREATE OR REPLACE FUNCTION public.protect_registration_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF auth.uid() IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'ID pendaftaran tidak dapat diubah';
    END IF;

    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'Pemilik pendaftaran tidak dapat diubah';
    END IF;

    IF NEW.event_id IS DISTINCT FROM OLD.event_id THEN
        RAISE EXCEPTION 'Kegiatan pendaftaran tidak dapat diubah';
    END IF;

    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'created_at tidak dapat diubah';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_registration_identity() FROM public;

DROP TRIGGER IF EXISTS protect_registration_identity ON public.event_registrations;
CREATE TRIGGER protect_registration_identity
    BEFORE UPDATE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_registration_identity();

-- Pendaftaran: validasi transisi status dan konsistensi cancelled_at.
CREATE OR REPLACE FUNCTION public.protect_registration_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'CANCELLED' THEN
            NEW.cancelled_at := COALESCE(NEW.cancelled_at, now());
        ELSE
            NEW.cancelled_at := NULL;
        END IF;

        IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
            IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
                RAISE EXCEPTION 'Pendaftaran hanya dapat dibuat untuk akun sendiri';
            END IF;

            IF NEW.status <> 'PENDING' THEN
                RAISE EXCEPTION 'Pendaftaran baru harus berstatus PENDING';
            END IF;
        END IF;

        RETURN NEW;
    END IF;

    -- cancelled_at selalu konsisten dengan status, termasuk untuk akses admin.
    IF NEW.status = 'CANCELLED' THEN
        NEW.cancelled_at := COALESCE(OLD.cancelled_at, NEW.cancelled_at, now());
    ELSE
        NEW.cancelled_at := NULL;
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status
       AND auth.uid() IS NOT NULL
       AND NOT public.is_admin() THEN
        IF OLD.user_id = auth.uid() THEN
            -- Peserta hanya boleh membatalkan pendaftarannya sendiri.
            IF NEW.status <> 'CANCELLED' THEN
                RAISE EXCEPTION 'Peserta hanya dapat membatalkan pendaftaran';
            END IF;
        ELSE
            IF NOT EXISTS (
                SELECT 1
                FROM public.volunteer_events e
                WHERE e.id = OLD.event_id
                  AND e.organizer_id = auth.uid()
            ) THEN
                RAISE EXCEPTION 'Hanya organizer event atau admin yang dapat mengubah status pendaftaran';
            END IF;

            IF OLD.status = 'CANCELLED' THEN
                RAISE EXCEPTION 'Pendaftaran yang dibatalkan tidak dapat diaktifkan kembali';
            END IF;

            IF NOT (
                (OLD.status = 'PENDING' AND NEW.status IN ('CONFIRMED', 'CANCELLED'))
                OR (OLD.status = 'CONFIRMED' AND NEW.status = 'CANCELLED')
            ) THEN
                RAISE EXCEPTION 'Transisi status pendaftaran tidak diizinkan';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_registration_status() FROM public;

DROP TRIGGER IF EXISTS protect_registration_status ON public.event_registrations;
CREATE TRIGGER protect_registration_status
    BEFORE INSERT OR UPDATE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_registration_status();

-- Backfill aman untuk tabel yang baru dibuat. Tidak menghapus data.
UPDATE public.volunteer_events e
SET registered_count = (
    SELECT count(*)::integer
    FROM public.event_registrations r
    WHERE r.event_id = e.id
      AND r.status = 'CONFIRMED'
);


-- ============================================================================
-- 5/5  20261101121400_enable_volunteer_rls
-- RLS policy dan grant khusus tabel Volunteer.
-- ============================================================================

-- RLS dan grant khusus tabel Volunteer Rangkul.
--
-- Sifat: ADDITIVE.
-- Migration ini TIDAK menyentuh policy/grant tabel bersama (profiles,
-- communities, verification_requests). Temuan keamanan pada tabel bersama
-- dilaporkan terpisah dan menunggu persetujuan pemilik fitur.
--
-- RLS adalah lapisan pertahanan kedua untuk akses Supabase client. Prisma
-- terhubung langsung sebagai owner database sehingga otorisasi server tetap
-- wajib diperiksa di server action/query.

ALTER TABLE public.volunteer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.volunteer_is_organizer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('ORGANIZER', 'ADMIN')
    );
$$;

CREATE OR REPLACE FUNCTION public.volunteer_owns_event(target_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.volunteer_events e
        WHERE e.id = target_event_id
          AND e.organizer_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.volunteer_is_open_event(target_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.volunteer_events e
        WHERE e.id = target_event_id
          AND e.status = 'PUBLISHED'
          AND e.archived_at IS NULL
          AND e.ends_at > now()
    );
$$;

REVOKE ALL ON FUNCTION public.volunteer_is_organizer() FROM public;
REVOKE ALL ON FUNCTION public.volunteer_owns_event(uuid) FROM public;
REVOKE ALL ON FUNCTION public.volunteer_is_open_event(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.volunteer_is_organizer() TO authenticated;
GRANT EXECUTE ON FUNCTION public.volunteer_owns_event(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.volunteer_is_open_event(uuid) TO authenticated;

-- volunteer_events: publik hanya membaca event PUBLISHED yang tidak diarsipkan.
DROP POLICY IF EXISTS "volunteer_events_select_published" ON public.volunteer_events;
CREATE POLICY "volunteer_events_select_published"
    ON public.volunteer_events
    FOR SELECT
    TO anon, authenticated
    USING (status = 'PUBLISHED' AND archived_at IS NULL);

DROP POLICY IF EXISTS "volunteer_events_select_own_or_admin" ON public.volunteer_events;
CREATE POLICY "volunteer_events_select_own_or_admin"
    ON public.volunteer_events
    FOR SELECT
    TO authenticated
    USING (organizer_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "volunteer_events_insert_organizer" ON public.volunteer_events;
CREATE POLICY "volunteer_events_insert_organizer"
    ON public.volunteer_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        organizer_id = auth.uid()
        AND registered_count = 0
        AND (status IN ('DRAFT', 'PENDING') OR public.is_admin())
        AND (published_at IS NULL OR public.is_admin())
        AND public.volunteer_is_organizer()
    );

DROP POLICY IF EXISTS "volunteer_events_update_own_or_admin" ON public.volunteer_events;
CREATE POLICY "volunteer_events_update_own_or_admin"
    ON public.volunteer_events
    FOR UPDATE
    TO authenticated
    USING (organizer_id = auth.uid() OR public.is_admin())
    WITH CHECK (organizer_id = auth.uid() OR public.is_admin());

-- event_registrations: PII hanya untuk pemilik, organizer event, dan admin.
DROP POLICY IF EXISTS "event_registrations_select_own_organizer_admin" ON public.event_registrations;
CREATE POLICY "event_registrations_select_own_organizer_admin"
    ON public.event_registrations
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.is_admin()
        OR public.volunteer_owns_event(event_id)
    );

DROP POLICY IF EXISTS "event_registrations_insert_self" ON public.event_registrations;
CREATE POLICY "event_registrations_insert_self"
    ON public.event_registrations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND status = 'PENDING'
        AND cancelled_at IS NULL
        AND public.volunteer_is_open_event(event_id)
    );

DROP POLICY IF EXISTS "event_registrations_update_own_organizer_admin" ON public.event_registrations;
CREATE POLICY "event_registrations_update_own_organizer_admin"
    ON public.event_registrations
    FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid()
        OR public.is_admin()
        OR public.volunteer_owns_event(event_id)
    )
    WITH CHECK (
        user_id = auth.uid()
        OR public.is_admin()
        OR public.volunteer_owns_event(event_id)
    );

-- Grant eksplisit: anon hanya boleh SELECT event publik. Tidak ada DELETE.
REVOKE ALL ON TABLE public.volunteer_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.event_registrations FROM anon, authenticated;

GRANT SELECT ON TABLE public.volunteer_events TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.volunteer_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.event_registrations TO authenticated;


COMMIT;

