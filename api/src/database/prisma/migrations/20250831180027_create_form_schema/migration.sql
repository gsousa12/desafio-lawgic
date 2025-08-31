/*
  Warnings:

  - A unique constraint covering the columns `[notification_id]` on the table `notified_persons` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "public"."form_schemas" (
    "id" TEXT NOT NULL,
    "stepKey" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "schemaJson" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_schemas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_schemas_stepKey_isActive_idx" ON "public"."form_schemas"("stepKey", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "notified_persons_notification_id_key" ON "public"."notified_persons"("notification_id");
