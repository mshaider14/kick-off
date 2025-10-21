-- AlterTable
ALTER TABLE "Bar" ADD COLUMN     "targetDevices" TEXT DEFAULT 'both',
ADD COLUMN     "targetPages" TEXT DEFAULT 'all',
ADD COLUMN     "targetSpecificUrls" TEXT,
ADD COLUMN     "targetUrlPattern" TEXT,
ADD COLUMN     "displayFrequency" TEXT DEFAULT 'always';
