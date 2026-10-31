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
