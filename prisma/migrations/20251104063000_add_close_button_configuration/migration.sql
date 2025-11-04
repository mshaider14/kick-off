-- AlterTable
ALTER TABLE "Bar" ADD COLUMN "closeButtonEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Bar" ADD COLUMN "closeButtonPosition" TEXT DEFAULT 'right';
ALTER TABLE "Bar" ADD COLUMN "dismissBehavior" TEXT DEFAULT 'session';
ALTER TABLE "Bar" ADD COLUMN "closeIconStyle" TEXT DEFAULT 'x';
