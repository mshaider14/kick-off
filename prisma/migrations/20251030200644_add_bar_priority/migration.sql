-- AlterTable
ALTER TABLE "Bar" ADD COLUMN "priority" INTEGER NOT NULL DEFAULT 5;

-- CreateIndex
CREATE INDEX "Bar_shop_isActive_priority_idx" ON "Bar"("shop", "isActive", "priority");
