-- AlterTable
ALTER TABLE "Bar" ADD COLUMN     "shippingThreshold" DOUBLE PRECISION,
ADD COLUMN     "shippingCurrency" TEXT,
ADD COLUMN     "shippingGoalText" TEXT,
ADD COLUMN     "shippingReachedText" TEXT,
ADD COLUMN     "shippingProgressColor" TEXT,
ADD COLUMN     "shippingShowIcon" BOOLEAN NOT NULL DEFAULT true;
