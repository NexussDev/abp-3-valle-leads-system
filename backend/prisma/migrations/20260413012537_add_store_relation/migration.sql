/*
  Warnings:

  - You are about to drop the column `store` on the `lead` table. All the data in the column will be lost.
  - Added the required column `store_id` to the `lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lead" DROP COLUMN "store",
ADD COLUMN     "store_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "store_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "store" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "store_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
