-- CreateTable
CREATE TABLE "Proof" (
    "id" TEXT NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER,

    CONSTRAINT "Proof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proof_telegram_id_key" ON "Proof"("telegram_id");
