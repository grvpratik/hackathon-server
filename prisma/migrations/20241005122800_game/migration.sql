-- AlterTable
ALTER TABLE "User" ADD COLUMN     "beast_exp" INTEGER,
ADD COLUMN     "beast_lvl" INTEGER,
ADD COLUMN     "knight_exp" INTEGER,
ADD COLUMN     "knight_lvl" INTEGER,
ADD COLUMN     "mage_exp" INTEGER,
ADD COLUMN     "mage_lvl" INTEGER;

-- CreateTable
CREATE TABLE "Dungeon" (
    "id" TEXT NOT NULL,
    "token_ca" TEXT,
    "base_amount_usd" INTEGER,
    "t1_token_amount" BIGINT,
    "t2_token_amount" BIGINT,
    "t3_token_amount" BIGINT,
    "t1_usd_amount" BIGINT,
    "t2_usd_amount" BIGINT,
    "t3_usd_amount" BIGINT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entryTokens" INTEGER NOT NULL,
    "timeToComplete" INTEGER NOT NULL,
    "minimumLevel" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Dungeon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonRaid" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dungeonId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "rewardTier" TEXT,
    "experience" INTEGER,
    "tokenAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DungeonRaid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DungeonRaid_userId_completed_claimed_idx" ON "DungeonRaid"("userId", "completed", "claimed");

-- CreateIndex
CREATE INDEX "DungeonRaid_endTime_idx" ON "DungeonRaid"("endTime");

-- AddForeignKey
ALTER TABLE "DungeonRaid" ADD CONSTRAINT "DungeonRaid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonRaid" ADD CONSTRAINT "DungeonRaid_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "Dungeon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
