-- CreateTable
CREATE TABLE "system_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "entity" VARCHAR(30) NOT NULL,
    "entity_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_lead_user_id" ON "lead"("user_id");

-- CreateIndex
CREATE INDEX "idx_lead_team_id" ON "lead"("team_id");

-- CreateIndex
CREATE INDEX "idx_lead_status" ON "lead"("status");

-- CreateIndex
CREATE INDEX "idx_lead_created_at" ON "lead"("created_at");

-- CreateIndex
CREATE INDEX "idx_lead_store_id" ON "lead"("store_id");

-- CreateIndex
CREATE INDEX "idx_negotiation_lead_id" ON "negotiation"("lead_id");

-- AddForeignKey
ALTER TABLE "system_log" ADD CONSTRAINT "system_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
