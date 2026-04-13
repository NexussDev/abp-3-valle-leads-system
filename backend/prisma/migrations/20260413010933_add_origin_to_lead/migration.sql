-- CreateTable
CREATE TABLE "team" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "team_id" UUID,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "cpf" VARCHAR(14),
    "email" VARCHAR(150),
    "phone" VARCHAR(20),

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_source" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "lead_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "brand" VARCHAR(50),
    "model" VARCHAR(50),
    "year" INTEGER,
    "price" DECIMAL(12,2),
    "color" VARCHAR(30),
    "plate" VARCHAR(10),

    CONSTRAINT "car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100),
    "phone" VARCHAR(20),
    "status" VARCHAR(30),
    "origin" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "client_id" UUID,
    "source_id" UUID,
    "car_id" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negotiation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_id" UUID,
    "status" VARCHAR(30),
    "stage" VARCHAR(30),
    "importance" VARCHAR(10),
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "negotiation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negotiation_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "negotiation_id" UUID NOT NULL,
    "old_status" VARCHAR(30),
    "new_status" VARCHAR(30),
    "old_stage" VARCHAR(30),
    "new_stage" VARCHAR(30),
    "changed_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "negotiation_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "client_cpf_key" ON "client"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "negotiation_lead_id_key" ON "negotiation"("lead_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "car"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "lead_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "negotiation" ADD CONSTRAINT "negotiation_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "lead"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "negotiation_history" ADD CONSTRAINT "negotiation_history_negotiation_id_fkey" FOREIGN KEY ("negotiation_id") REFERENCES "negotiation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
