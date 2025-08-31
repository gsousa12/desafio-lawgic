/*
  Warnings:

  - Made the column `hearing_date` on table `notifications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."notifications" ALTER COLUMN "hearing_date" SET NOT NULL;
