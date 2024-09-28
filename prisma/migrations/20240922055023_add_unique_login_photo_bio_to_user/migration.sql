/*
  Warnings:

  - You are about to drop the `Exercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkoutProgram` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_workoutDayId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutDay" DROP CONSTRAINT "WorkoutDay_workoutProgramId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutProgram" DROP CONSTRAINT "WorkoutProgram_userId_fkey";

-- DropTable
DROP TABLE "Exercise";

-- DropTable
DROP TABLE "WorkoutDay";

-- DropTable
DROP TABLE "WorkoutProgram";

-- CreateTable
CREATE TABLE "WorkoutProgramModel" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "WorkoutProgramModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutDayModel" (
    "id" SERIAL NOT NULL,
    "dayName" TEXT NOT NULL,
    "muscle" TEXT NOT NULL,
    "workoutProgramId" INTEGER NOT NULL,

    CONSTRAINT "WorkoutDayModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "restTime" INTEGER,
    "note" TEXT,
    "progressMark" TEXT,
    "workoutDayId" INTEGER NOT NULL,

    CONSTRAINT "ExerciseModel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkoutProgramModel" ADD CONSTRAINT "WorkoutProgramModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutDayModel" ADD CONSTRAINT "WorkoutDayModel_workoutProgramId_fkey" FOREIGN KEY ("workoutProgramId") REFERENCES "WorkoutProgramModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseModel" ADD CONSTRAINT "ExerciseModel_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "WorkoutDayModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
