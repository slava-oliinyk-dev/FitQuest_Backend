/*
  Warnings:

  - A unique constraint covering the columns `[id,workoutProgramId]` on the table `WorkoutDayModel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorkoutDayModel_id_workoutProgramId_key" ON "WorkoutDayModel"("id", "workoutProgramId");
