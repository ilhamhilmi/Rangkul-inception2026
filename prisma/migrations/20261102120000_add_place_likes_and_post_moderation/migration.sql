-- Postingan tempat: moderasi AI dan tombol "Paling membantu".
-- Kolom alamat dibuat opsional karena form posting hanya mengumpulkan titik peta.

-- AlterTable
ALTER TABLE "places"
    ADD COLUMN "moderation_note" TEXT,
    ADD COLUMN "moderated_at" TIMESTAMPTZ(6),
    ALTER COLUMN "address" DROP NOT NULL,
    ALTER COLUMN "city" DROP NOT NULL,
    ALTER COLUMN "province" DROP NOT NULL;

-- CreateTable
CREATE TABLE "place_likes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "place_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "place_likes_place_id_idx" ON "place_likes"("place_id");

-- CreateIndex
CREATE UNIQUE INDEX "place_likes_place_id_user_id_key" ON "place_likes"("place_id", "user_id");

-- AddForeignKey
ALTER TABLE "place_likes" ADD CONSTRAINT "place_likes_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_likes" ADD CONSTRAINT "place_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
