-- AlterTable: campos de vitrine
ALTER TABLE "car" ADD COLUMN     "km" INTEGER,
                  ADD COLUMN     "fuel" VARCHAR(20),
                  ADD COLUMN     "transmission" VARCHAR(20),
                  ADD COLUMN     "category" VARCHAR(20),
                  ADD COLUMN     "description" TEXT,
                  ADD COLUMN     "photo_url" VARCHAR(500),
                  ADD COLUMN     "badge" VARCHAR(20);

-- AlterTable: campos de controle de publicação
ALTER TABLE "car" ADD COLUMN     "listing_status" VARCHAR(20),
                  ADD COLUMN     "published_by_id" UUID,
                  ADD COLUMN     "published_team_id" UUID,
                  ADD COLUMN     "published_at" TIMESTAMP(6),
                  ADD COLUMN     "approved_by_id" UUID,
                  ADD COLUMN     "approved_at" TIMESTAMP(6),
                  ADD COLUMN     "rejection_reason" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "car" ADD CONSTRAINT "car_published_by_id_fkey"
    FOREIGN KEY ("published_by_id") REFERENCES "user"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "car" ADD CONSTRAINT "car_approved_by_id_fkey"
    FOREIGN KEY ("approved_by_id") REFERENCES "user"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "car" ADD CONSTRAINT "car_published_team_id_fkey"
    FOREIGN KEY ("published_team_id") REFERENCES "team"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION;

-- CreateIndex
CREATE INDEX "idx_car_listing_status"    ON "car"("listing_status");
CREATE INDEX "idx_car_published_team_id" ON "car"("published_team_id");
CREATE INDEX "idx_car_published_by_id"   ON "car"("published_by_id");
