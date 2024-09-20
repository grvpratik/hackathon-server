/*
  Warnings:

  - The primary key for the `Payouts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `Payouts` table. All the data in the column will be lost.
  - The primary key for the `Submission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `worker_id` on the `Submission` table. All the data in the column will be lost.
  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `done` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Task` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Worker` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,task_id]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telegram_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payer_id` to the `Payouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proof` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payer_id` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `task_link` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locked_points` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telegram_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Active', 'Hold', 'End');

-- DropForeignKey
ALTER TABLE "Payouts" DROP CONSTRAINT "Payouts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_task_id_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_worker_id_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_user_id_fkey";

-- DropIndex
DROP INDEX "Submission_worker_id_task_id_key";

-- AlterTable
ALTER TABLE "Payouts" DROP CONSTRAINT "Payouts_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "payer_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Payouts_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Payouts_id_seq";

-- AlterTable
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_pkey",
DROP COLUMN "worker_id",
ADD COLUMN     "proof" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "task_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Submission_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Submission_id_seq";

-- AlterTable
ALTER TABLE "Task" DROP CONSTRAINT "Task_pkey",
DROP COLUMN "done",
DROP COLUMN "user_id",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "payer_id" TEXT NOT NULL,
ADD COLUMN     "status" "TaskStatus",
ADD COLUMN     "task_link" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Task_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "Last_name" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "locked_points" INTEGER NOT NULL,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ref_claim" BOOLEAN DEFAULT false,
ADD COLUMN     "referral_by" TEXT,
ADD COLUMN     "referral_code" TEXT,
ADD COLUMN     "telegram_id" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "Worker";

-- CreateTable
CREATE TABLE "Payer" (
    "id" TEXT NOT NULL,
    "telegram_id" INTEGER NOT NULL,
    "first_name" TEXT,
    "Last_name" TEXT,
    "address" TEXT,

    CONSTRAINT "Payer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payer_telegram_id_key" ON "Payer"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payer_address_key" ON "Payer"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_user_id_task_id_key" ON "Submission"("user_id", "task_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegram_id_key" ON "User"("telegram_id");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "Payer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payouts" ADD CONSTRAINT "Payouts_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "Payer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
