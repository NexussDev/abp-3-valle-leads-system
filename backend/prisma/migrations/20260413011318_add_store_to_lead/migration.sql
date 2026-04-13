/*
  Warnings:

  - Added the required column `store` to the `lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lead" ADD COLUMN     "store" TEXT NOT NULL;
