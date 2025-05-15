/*
  Warnings:

  - You are about to drop the column `color` on the `WorkoutProgramModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkoutProgramModel" DROP COLUMN "color",
ADD COLUMN     "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
