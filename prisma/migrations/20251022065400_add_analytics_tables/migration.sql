-- CreateTable
CREATE TABLE "BarView" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,

    CONSTRAINT "BarView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarClick" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "ctaLink" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,

    CONSTRAINT "BarClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BarView_barId_idx" ON "BarView"("barId");

-- CreateIndex
CREATE INDEX "BarView_shop_idx" ON "BarView"("shop");

-- CreateIndex
CREATE INDEX "BarView_timestamp_idx" ON "BarView"("timestamp");

-- CreateIndex
CREATE INDEX "BarView_shop_timestamp_idx" ON "BarView"("shop", "timestamp");

-- CreateIndex
CREATE INDEX "BarClick_barId_idx" ON "BarClick"("barId");

-- CreateIndex
CREATE INDEX "BarClick_shop_idx" ON "BarClick"("shop");

-- CreateIndex
CREATE INDEX "BarClick_timestamp_idx" ON "BarClick"("timestamp");

-- CreateIndex
CREATE INDEX "BarClick_shop_timestamp_idx" ON "BarClick"("shop", "timestamp");

-- AddForeignKey
ALTER TABLE "BarView" ADD CONSTRAINT "BarView_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarClick" ADD CONSTRAINT "BarClick_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
