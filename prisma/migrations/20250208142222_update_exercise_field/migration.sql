/*
  Warnings:

  - Made the column `name` on table `ExerciseModel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sets` on table `ExerciseModel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `repetitions` on table `ExerciseModel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ExerciseModel" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "sets" SET NOT NULL,
ALTER COLUMN "repetitions" SET NOT NULL;
