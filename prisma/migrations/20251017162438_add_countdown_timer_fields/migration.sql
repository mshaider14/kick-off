-- AlterTable
ALTER TABLE "Bar" ADD COLUMN     "timerDailyTime" TEXT,
ADD COLUMN     "timerDuration" INTEGER,
ADD COLUMN     "timerEndAction" TEXT,
ADD COLUMN     "timerEndDate" TIMESTAMP(3),
ADD COLUMN     "timerEndMessage" TEXT,
ADD COLUMN     "timerFormat" TEXT,
ADD COLUMN     "timerType" TEXT;
