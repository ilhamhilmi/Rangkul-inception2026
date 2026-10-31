-- Rangkul: komunitas, profil, dan pengajuan verifikasi.
-- Migrasi ini kompatibel dengan skema tempat yang sudah ada di database.
-- Cakupan: fitur komunitas saja.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum (idempoten karena UserRole mungkin sudah dibuat fitur tempat)
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ORGANIZER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "CommunityStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "VerificationType" AS ENUM ('COMMUNITY', 'ORGANIZER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "avatar_url" TEXT,
    "bio" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "communities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "focus" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "contact" TEXT NOT NULL,
    "socials" JSONB NOT NULL DEFAULT '{}',
    "join_url" TEXT NOT NULL,
    "logo_url" TEXT,
    "status" "CommunityStatus" NOT NULL DEFAULT 'PENDING',
    "owner_id" UUID NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "verified_by" UUID,
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "verification_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "VerificationType" NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "document_url" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewer_id" UUID,
    "review_note" TEXT,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- Index
CREATE INDEX IF NOT EXISTS "idx_profiles_role" ON "profiles"("role");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_profiles_email_lower" ON "profiles" (lower("email"));

CREATE UNIQUE INDEX IF NOT EXISTS "uq_communities_slug" ON "communities"("slug");
CREATE INDEX IF NOT EXISTS "idx_communities_status" ON "communities"("status");
CREATE INDEX IF NOT EXISTS "idx_communities_location" ON "communities"("province", "city");
CREATE INDEX IF NOT EXISTS "idx_communities_focus" ON "communities" USING GIN ("focus");
CREATE INDEX IF NOT EXISTS "idx_communities_name_trgm" ON "communities" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "idx_verification_requests_status" ON "verification_requests"("status", "submitted_at");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_verification_requests_pending"
    ON "verification_requests" ("user_id", "type")
    WHERE "status" = 'PENDING';

-- AddForeignKey (hanya jika belum ada)
-- Catatan: data seed fitur tempat dibuat sebelum Supabase Auth dipakai, sehingga
-- sebagian baris profiles belum punya pasangan di auth.users. FK hanya dipasang
-- jika seluruh profiles sudah punya akun auth; kalau belum, migrasi tetap aman
-- dan FK bisa dipasang pada migrasi lanjutan setelah data seed dibersihkan.
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_profiles_auth_user'
          AND conrelid = 'profiles'::regclass
    ) AND NOT EXISTS (
        SELECT 1
        FROM "profiles" p
        LEFT JOIN auth.users u ON u.id = p.id
        WHERE u.id IS NULL
    ) THEN
        ALTER TABLE "profiles"
            ADD CONSTRAINT "fk_profiles_auth_user"
            FOREIGN KEY ("id") REFERENCES auth.users("id") ON DELETE CASCADE;
    ELSE
        RAISE NOTICE 'fk_profiles_auth_user dilewati: masih ada profiles tanpa auth.users';
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'communities_owner_id_fkey') THEN
        ALTER TABLE "communities"
            ADD CONSTRAINT "communities_owner_id_fkey"
            FOREIGN KEY ("owner_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'communities_verified_by_fkey') THEN
        ALTER TABLE "communities"
            ADD CONSTRAINT "communities_verified_by_fkey"
            FOREIGN KEY ("verified_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'verification_requests_user_id_fkey') THEN
        ALTER TABLE "verification_requests"
            ADD CONSTRAINT "verification_requests_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'verification_requests_reviewer_id_fkey') THEN
        ALTER TABLE "verification_requests"
            ADD CONSTRAINT "verification_requests_reviewer_id_fkey"
            FOREIGN KEY ("reviewer_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Check constraints
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_name_length') THEN
        ALTER TABLE "profiles"
            ADD CONSTRAINT "chk_profiles_name_length" CHECK (char_length("name") BETWEEN 1 AND 80);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profiles_bio_length') THEN
        ALTER TABLE "profiles"
            ADD CONSTRAINT "chk_profiles_bio_length" CHECK ("bio" IS NULL OR char_length("bio") <= 500);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_communities_slug_format') THEN
        ALTER TABLE "communities"
            ADD CONSTRAINT "chk_communities_slug_format" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_communities_name_length') THEN
        ALTER TABLE "communities"
            ADD CONSTRAINT "chk_communities_name_length" CHECK (char_length("name") BETWEEN 2 AND 120);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_communities_description_length') THEN
        ALTER TABLE "communities"
            ADD CONSTRAINT "chk_communities_description_length" CHECK (char_length("description") BETWEEN 20 AND 3000);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_communities_focus_count') THEN
        ALTER TABLE "communities"
            ADD CONSTRAINT "chk_communities_focus_count" CHECK (cardinality("focus") <= 8);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_communities_contact_length') THEN
        ALTER TABLE "communities"
            ADD CONSTRAINT "chk_communities_contact_length" CHECK (char_length("contact") BETWEEN 1 AND 200);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_communities_socials_object') THEN
        ALTER TABLE "communities"
            ADD CONSTRAINT "chk_communities_socials_object" CHECK (jsonb_typeof("socials") = 'object');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_communities_join_url') THEN
        ALTER TABLE "communities"
            ADD CONSTRAINT "chk_communities_join_url" CHECK ("join_url" ~ '^https?://');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_communities_verified_fields') THEN
        ALTER TABLE "communities"
            ADD CONSTRAINT "chk_communities_verified_fields" CHECK (
                "status" <> 'VERIFIED'
                OR ("verified_at" IS NOT NULL AND "verified_by" IS NOT NULL)
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_verification_review_note_length') THEN
        ALTER TABLE "verification_requests"
            ADD CONSTRAINT "chk_verification_review_note_length" CHECK (
                "review_note" IS NULL OR char_length("review_note") <= 1000
            );
    END IF;
END $$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW."updated_at" = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON "profiles";
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON "profiles"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_communities_updated_at ON "communities";
CREATE TRIGGER trg_communities_updated_at
    BEFORE UPDATE ON "communities"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: lapisan kedua untuk akses lewat Supabase client.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "communities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_requests" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Profil: pengguna login boleh membaca profil publik dan mengubah miliknya.
DROP POLICY IF EXISTS "profiles_select_authenticated" ON "profiles";
CREATE POLICY "profiles_select_authenticated"
    ON "profiles" FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON "profiles";
CREATE POLICY "profiles_insert_own"
    ON "profiles" FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON "profiles";
CREATE POLICY "profiles_update_own"
    ON "profiles" FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_admin_all" ON "profiles";
CREATE POLICY "profiles_admin_all"
    ON "profiles" FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Role tidak boleh diubah pemilik profil lewat Supabase client.
REVOKE UPDATE ("role") ON "profiles" FROM authenticated;

-- Komunitas: publik hanya melihat yang VERIFIED dan belum diarsipkan.
DROP POLICY IF EXISTS "communities_select_public" ON "communities";
CREATE POLICY "communities_select_public"
    ON "communities" FOR SELECT TO anon
    USING ("status" = 'VERIFIED' AND "archived_at" IS NULL);

DROP POLICY IF EXISTS "communities_select_authenticated" ON "communities";
CREATE POLICY "communities_select_authenticated"
    ON "communities" FOR SELECT TO authenticated
    USING (
        ("status" = 'VERIFIED' AND "archived_at" IS NULL)
        OR "owner_id" = auth.uid()
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "communities_insert_own" ON "communities";
CREATE POLICY "communities_insert_own"
    ON "communities" FOR INSERT TO authenticated
    WITH CHECK ("owner_id" = auth.uid() AND "status" = 'PENDING');

DROP POLICY IF EXISTS "communities_update_own" ON "communities";
CREATE POLICY "communities_update_own"
    ON "communities" FOR UPDATE TO authenticated
    USING ("owner_id" = auth.uid())
    WITH CHECK ("owner_id" = auth.uid());

DROP POLICY IF EXISTS "communities_admin_all" ON "communities";
CREATE POLICY "communities_admin_all"
    ON "communities" FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Pengajuan verifikasi: hanya milik sendiri dan admin.
DROP POLICY IF EXISTS "verification_requests_select_own" ON "verification_requests";
CREATE POLICY "verification_requests_select_own"
    ON "verification_requests" FOR SELECT TO authenticated
    USING ("user_id" = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "verification_requests_insert_own" ON "verification_requests";
CREATE POLICY "verification_requests_insert_own"
    ON "verification_requests" FOR INSERT TO authenticated
    WITH CHECK ("user_id" = auth.uid() AND "status" = 'PENDING');

DROP POLICY IF EXISTS "verification_requests_admin_all" ON "verification_requests";
CREATE POLICY "verification_requests_admin_all"
    ON "verification_requests" FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
