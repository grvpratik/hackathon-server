/*
  Warnings:

  - The values [Twitter,Youtube,Discord,Telegram] on the enum `Platforms` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Platforms_new" AS ENUM ('twitter', 'youtube', 'discord', 'telegram');
ALTER TABLE "Task" ALTER COLUMN "platform" TYPE "Platforms_new" USING ("platform"::text::"Platforms_new");
ALTER TYPE "Platforms" RENAME TO "Platforms_old";
ALTER TYPE "Platforms_new" RENAME TO "Platforms";
DROP TYPE "Platforms_old";
COMMIT;
