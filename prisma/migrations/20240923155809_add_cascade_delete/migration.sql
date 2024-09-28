-- DropForeignKey
ALTER TABLE "ExerciseModel" DROP CONSTRAINT "ExerciseModel_workoutDayId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutDayModel" DROP CONSTRAINT "WorkoutDayModel_workoutProgramId_fkey";

-- AddForeignKey
ALTER TABLE "WorkoutDayModel" ADD CONSTRAINT "WorkoutDayModel_workoutProgramId_fkey" FOREIGN KEY ("workoutProgramId") REFERENCES "WorkoutProgramModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseModel" ADD CONSTRAINT "ExerciseModel_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "WorkoutDayModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
