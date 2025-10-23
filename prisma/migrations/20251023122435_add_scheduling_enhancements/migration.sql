-- AlterTable
ALTER TABLE "Bar" ADD COLUMN     "timezone" TEXT DEFAULT 'UTC',
ADD COLUMN     "scheduleStartImmediate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleEndNever" BOOLEAN NOT NULL DEFAULT false;
