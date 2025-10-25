-- AlterTable
ALTER TABLE "Bar" ADD COLUMN     "messages" TEXT,
ADD COLUMN     "rotationSpeed" INTEGER DEFAULT 5,
ADD COLUMN     "transitionType" TEXT DEFAULT 'fade';
