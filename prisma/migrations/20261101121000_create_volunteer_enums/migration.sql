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
