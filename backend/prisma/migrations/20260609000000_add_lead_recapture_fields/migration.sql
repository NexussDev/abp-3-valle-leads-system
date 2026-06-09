-- AlterTable
ALTER TABLE "lead" ADD COLUMN     "updated_at"        TIMESTAMP(6),
                   ADD COLUMN     "last_contacted_at" TIMESTAMP(6);

-- Inicializa updated_at com created_at para registros existentes
UPDATE "lead" SET "updated_at" = COALESCE("created_at", NOW()) WHERE "updated_at" IS NULL;

-- CreateIndex
CREATE INDEX "idx_lead_last_contacted_at" ON "lead"("last_contacted_at");
