-- AlterTable
ALTER TABLE "Bar" ADD COLUMN "timerType" TEXT,
ADD COLUMN "timerEndDate" TIMESTAMP(3),
ADD COLUMN "timerDailyTime" TEXT,
ADD COLUMN "timerDuration" INTEGER,
ADD COLUMN "timerFormat" TEXT,
ADD COLUMN "timerEndAction" TEXT,
ADD COLUMN "timerEndMessage" TEXT;
