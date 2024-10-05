/*
  Warnings:

  - You are about to drop the column `userId` on the `DungeonRaid` table. All the data in the column will be lost.
  - You are about to drop the column `beast_exp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `beast_lvl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `knight_exp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `knight_lvl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mage_exp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mage_lvl` on the `User` table. All the data in the column will be lost.
  - Added the required column `gameId` to the `DungeonRaid` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DungeonRaid" DROP CONSTRAINT "DungeonRaid_userId_fkey";

-- DropIndex
DROP INDEX "DungeonRaid_userId_completed_claimed_idx";

-- AlterTable
ALTER TABLE "DungeonRaid" DROP COLUMN "userId",
ADD COLUMN     "gameId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "beast_exp",
DROP COLUMN "beast_lvl",
DROP COLUMN "knight_exp",
DROP COLUMN "knight_lvl",
DROP COLUMN "mage_exp",
DROP COLUMN "mage_lvl";

-- CreateTable
CREATE TABLE "GameAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "knight_lvl" INTEGER,
    "knight_exp" INTEGER,
    "mage_lvl" INTEGER,
    "mage_exp" INTEGER,
    "beast_lvl" INTEGER,
    "beast_exp" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameAccount_userId_key" ON "GameAccount"("userId");

-- CreateIndex
CREATE INDEX "DungeonRaid_gameId_completed_claimed_idx" ON "DungeonRaid"("gameId", "completed", "claimed");

-- CreateIndex
CREATE INDEX "User_telegram_id_idx" ON "User"("telegram_id");

-- AddForeignKey
ALTER TABLE "GameAccount" ADD CONSTRAINT "GameAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonRaid" ADD CONSTRAINT "DungeonRaid_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
