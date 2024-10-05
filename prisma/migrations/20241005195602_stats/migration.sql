/*
  Warnings:

  - Added the required column `status` to the `DungeonRaid` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RaidStatus" AS ENUM ('active', 'completed', 'claimed');

-- AlterTable
ALTER TABLE "DungeonRaid" ADD COLUMN     "status" "RaidStatus" NOT NULL;
