-- CreateTable
CREATE TABLE "Bar" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'announcement',
    "message" TEXT NOT NULL,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "backgroundColor" TEXT NOT NULL DEFAULT '#288d40',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "fontSize" INTEGER NOT NULL DEFAULT 14,
    "position" TEXT NOT NULL DEFAULT 'top',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bar_shop_idx" ON "Bar"("shop");

-- CreateIndex
CREATE INDEX "Bar_shop_isActive_idx" ON "Bar"("shop", "isActive");
