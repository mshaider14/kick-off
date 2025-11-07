-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "planName" TEXT NOT NULL DEFAULT 'free',
    "planPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingCycle" TEXT,
    "chargeId" TEXT,
    "chargeStatus" TEXT,
    "billingActivated" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewUsage" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingHistory" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "chargeId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "billingOn" TIMESTAMP(3),
    "activatedOn" TIMESTAMP(3),
    "cancelledOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_shop_key" ON "Merchant"("shop");

-- CreateIndex
CREATE INDEX "Merchant_shop_idx" ON "Merchant"("shop");

-- CreateIndex
CREATE INDEX "Merchant_planName_idx" ON "Merchant"("planName");

-- CreateIndex
CREATE INDEX "ViewUsage_shop_idx" ON "ViewUsage"("shop");

-- CreateIndex
CREATE INDEX "ViewUsage_month_idx" ON "ViewUsage"("month");

-- CreateIndex
CREATE INDEX "ViewUsage_shop_month_idx" ON "ViewUsage"("shop", "month");

-- CreateIndex
CREATE UNIQUE INDEX "ViewUsage_shop_month_key" ON "ViewUsage"("shop", "month");

-- CreateIndex
CREATE INDEX "BillingHistory_shop_idx" ON "BillingHistory"("shop");

-- CreateIndex
CREATE INDEX "BillingHistory_chargeId_idx" ON "BillingHistory"("chargeId");

-- CreateIndex
CREATE INDEX "BillingHistory_shop_createdAt_idx" ON "BillingHistory"("shop", "createdAt");

-- AddForeignKey
ALTER TABLE "ViewUsage" ADD CONSTRAINT "ViewUsage_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Merchant"("shop") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingHistory" ADD CONSTRAINT "BillingHistory_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Merchant"("shop") ON DELETE CASCADE ON UPDATE CASCADE;
