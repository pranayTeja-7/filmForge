/*
  Warnings:

  - You are about to alter the column `display_name` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `bio` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `experience` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `location` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "display_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "bio" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "experience" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "location" SET DATA TYPE VARCHAR(100);
