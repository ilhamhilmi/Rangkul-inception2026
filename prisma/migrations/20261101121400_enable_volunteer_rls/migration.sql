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
