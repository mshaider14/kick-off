-- AlterTable
ALTER TABLE "Bar" ADD COLUMN "emailPlaceholder" TEXT,
ADD COLUMN "namePlaceholder" TEXT,
ADD COLUMN "nameFieldEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "submitButtonText" TEXT,
ADD COLUMN "successMessage" TEXT,
ADD COLUMN "discountCode" TEXT,
ADD COLUMN "privacyCheckboxEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "privacyCheckboxText" TEXT;

-- CreateTable
CREATE TABLE "EmailSubmission" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,

    CONSTRAINT "EmailSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailSubmission_barId_idx" ON "EmailSubmission"("barId");

-- CreateIndex
CREATE INDEX "EmailSubmission_shop_idx" ON "EmailSubmission"("shop");

-- CreateIndex
CREATE INDEX "EmailSubmission_email_idx" ON "EmailSubmission"("email");

-- CreateIndex
CREATE INDEX "EmailSubmission_shop_email_idx" ON "EmailSubmission"("shop", "email");

-- CreateIndex
CREATE INDEX "EmailSubmission_timestamp_idx" ON "EmailSubmission"("timestamp");

-- CreateIndex
CREATE INDEX "EmailSubmission_shop_timestamp_idx" ON "EmailSubmission"("shop", "timestamp");

-- AddForeignKey
ALTER TABLE "EmailSubmission" ADD CONSTRAINT "EmailSubmission_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
