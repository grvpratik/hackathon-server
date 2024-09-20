/*
  Warnings:

  - You are about to drop the column `Last_name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "Last_name",
ADD COLUMN     "last_name" TEXT;
