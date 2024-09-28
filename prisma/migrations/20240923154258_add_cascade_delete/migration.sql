-- DropForeignKey
ALTER TABLE "WorkoutProgramModel" DROP CONSTRAINT "WorkoutProgramModel_userId_fkey";

-- AlterTable
ALTER TABLE "UserModel" ALTER COLUMN "role" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "WorkoutProgramModel" ADD CONSTRAINT "WorkoutProgramModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
