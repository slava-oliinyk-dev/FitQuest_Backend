/*
  Warnings:

  - A unique constraint covering the columns `[id,workoutDayId]` on the table `ExerciseModel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExerciseModel_id_workoutDayId_key" ON "ExerciseModel"("id", "workoutDayId");
