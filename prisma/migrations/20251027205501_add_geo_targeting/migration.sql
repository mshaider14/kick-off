-- AlterTable
ALTER TABLE "Bar" ADD COLUMN "geoTargetingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "geoTargetingMode" TEXT DEFAULT 'all',
ADD COLUMN "geoTargetedCountries" TEXT;
