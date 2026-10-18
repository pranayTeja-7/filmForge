/*
  Warnings:

  - Added the required column `onboarding_status` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('ROLES', 'PORTFOLIO', 'COMPLETED');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "onboarding_status" "OnboardingStatus" NOT NULL;
