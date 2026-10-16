/*
  Warnings:

  - Added the required column `gender` to the `blood_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `donors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "blood_requests" ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "donors" ADD COLUMN     "gender" "Gender" NOT NULL;
