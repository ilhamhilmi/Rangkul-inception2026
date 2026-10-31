-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('EVENT_SUPPORT', 'ACCESSIBILITY_AUDIT', 'SOCIAL_ACTIVITY', 'INCLUSIVE_PROGRAM', 'OTHER');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('COMMUNITY', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

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

    CONSTRAINT "volunteer_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
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

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "idx_profiles_role" ON "profiles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "uq_volunteer_events_slug" ON "volunteer_events"("slug");

-- CreateIndex
CREATE INDEX "idx_volunteer_events_status_start" ON "volunteer_events"("status", "starts_at");

-- CreateIndex
CREATE INDEX "idx_volunteer_events_organizer" ON "volunteer_events"("organizer_id");

-- CreateIndex
CREATE INDEX "idx_volunteer_events_community" ON "volunteer_events"("community_id");

-- CreateIndex
CREATE INDEX "idx_volunteer_events_location" ON "volunteer_events"("province", "city");

-- CreateIndex
CREATE INDEX "idx_event_registrations_event_status" ON "event_registrations"("event_id", "status");

-- CreateIndex
CREATE INDEX "idx_event_registrations_user" ON "event_registrations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_event_registrations_event_user" ON "event_registrations"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_verification_requests_status" ON "verification_requests"("status", "submitted_at");

-- AddForeignKey
ALTER TABLE "volunteer_events" ADD CONSTRAINT "fk_volunteer_events_organizer_id" FOREIGN KEY ("organizer_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "fk_event_registrations_event_id" FOREIGN KEY ("event_id") REFERENCES "volunteer_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "fk_event_registrations_user_id" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

