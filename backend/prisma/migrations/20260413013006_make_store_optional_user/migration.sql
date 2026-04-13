-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_store_id_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "store_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
